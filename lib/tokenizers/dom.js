var tml         = require('tml-js');
var config      = tml.config;
var utils       = tml.utils;

var dom         = require('../helpers/dom-helpers');



var DomTokenizer = function(doc, context, options) {
  this.doc = doc;
  this.context = context || {};
  this.tokens = [];
  this.options = options || {};
};

DomTokenizer.prototype = {

  contentCache   :[],
  contentNodes   :[],
  translatedNodes :[],

  getOption: function(name) {
    if(typeof this.options[name] === 'undefined' || this.options[name] === null) {
      return utils.hashValue(config.translator_options, name);
    }
    return this.options[name];
  },  

  translate: function() {
    return this.translateTree(this.doc);
  },

  updateAllNodes: function(){
    for(var i=0,l=this.contentCache.length;i<l;i++){
      if(this.contentCache[i].container) {
        this.contentCache[i].container.innerHTML = this.translateTml(this.contentCache[i].tml, this.contentCache[i].data);
      }
    }
  },

  replaceNodes: function(nodes) {

    var ti = document.createElement("tml:inline");
    var parent = nodes[0] && nodes[0].parentNode;
    var container;
    var tml, data, translation, text = "";

    if(parent) {
      tml         = nodes.map(function(n){text+=n.innerHTML || n.nodeValue;return this.generateTmlTags(n);}.bind(this)).join("");
      data        = this.tokens;
      translation = this.translateTml(tml);

      if(!translation || this.isEmptyString(tml) || this.isUntranslatableText(text) || !this.isTranslatable(parent)) return;

      if(nodes.length !== parent.childNodes.length) {
        parent.insertBefore(ti, nodes[0]);
        ti.innerHTML = translation;
        ti.insertAdjacentHTML("beforebegin", "\n");
        ti.insertAdjacentHTML("afterend", "\n");
        nodes.forEach(function(n){parent.removeChild(n);});
        container = ti;
      } else {
        parent.insertBefore(ti, nodes[0]);
        ti.insertAdjacentHTML("beforebegin", translation);
        parent.removeChild(ti);
        ti = null;
        nodes.forEach(function(n){parent.removeChild(n);});
        container = parent;
      }

      if(this.contentNodes.indexOf(container) == -1) {
        this.contentCache.push({container: container, tml: tml, data: data});  
        this.contentNodes.push(container);
      }
      
    }
  },


  translateDOM: function(node) {
    if(this.translatedNodes.indexOf(node) !== -1) return;
    this.translatedNodes.push(node);

    if (node.nodeType == 3) { return; }

    var source = node.nodeType == 1 && this.getSourceBlock(node);
    if (source) {
      window.tml_begin_block({source: source});
    }

    var buffer = [];
    for(var i=0;i<node.childNodes.length;i++) {
      var child = node.childNodes[i];
      if(!child || !this.isTranslatable(child)) continue;

      if (child.nodeType == 3 || dom.isInline(child) && dom.hasInlineSiblings(child)) {
        buffer.push(child);
      } else {
        this.replaceNodes(buffer);
        this.translateDOM(child);
        buffer = [];
      }
    }

    if (buffer.length>0) {
      if(buffer.length == 1 && buffer[0].nodeType == 1) {
        this.translateDOM(buffer[0]);
      } else {
        this.replaceNodes(buffer);
      }
    }

    if(source) {
      window.tml_end_block();
    }
  },
  
  getSourceBlock: function(node) {
    if(config.sourceElements) {
      var match = dom.matchesSelectors(node, config.sourceElements);
      if(match) {
        return node.getAttribute('name') || node.getAttribute('id') || node.getAttribute('class');
      }
    }
    return node.getAttribute('data-tml-source') || false;
    
  },

  isTranslatable: function(node) {
    if (node.nodeType == 8) { return false; }
    if (node.nodeType == 3) { node = node.parentNode; }
    if (node.nodeType == 1) {
      return !dom.matchesSelectors(node, ([]).concat(
        (this.getOption("nodes.scripts") || []),
        (this.getOption("ignore_elements") || []),
        (['[notranslate]','.notranslate','tml\\:label'])
      ), true);
    }
    return true;
  },

  translateTml: function(tml, data) {
    tml = this.generateDataTokens(tml);
    data = data || (this.tokens);

    if (!this.isValidTml(tml)) return null;

    var translation = tml;

    if (this.getOption("split_sentences")) {
      var sentences = utils.splitSentences(tml);
      if (sentences) {
        var self = this;
        sentences.forEach(function (sentence) {
          var sentenceTranslation = self.getOption("debug") ? self.debugTranslation(sentence) : window.tr(sentence, data, self.options);
          translation = translation.replace(sentence, sentenceTranslation);
        });
        this.resetContext();
        return translation;
      }
    }

    tml = tml.replace(/[\n]/g, '').replace(/\s\s+/g, ' ').trim();

    translation = this.getOption("debug") ? this.debugTranslation(tml) : window.tr(tml, data, this.options);

    this.resetContext();
    return translation;
  },



  generateTmlTags: function(node) {
    if(node.nodeType == 3) { 
      return this.escapeHtml(node.nodeValue); 
    }

    if (!this.isTranslatable(node)) {
      var tokenName = this.contextualize(this.adjustName(node), node.outerHTML);
      return "{" + tokenName + "}";
    }

    var name = node.tagName.toLowerCase();
    if (name == 'var') {
      return this.registerDataTokenFromVar(node);
    }

    var buffer = "";

    for(var i=0; i<node.childNodes.length; i++) {
      var child = node.childNodes[i];
      buffer = buffer + ((child.nodeType == 3) ? this.escapeHtml(child.nodeValue) : this.generateTmlTags(child));
    }
    var tokenContext = this.generateHtmlToken(node);
    var token = this.contextualize(this.adjustName(node), tokenContext);
    var tml;

    var value = this.sanitizeValue(buffer);

    if (dom.isSelfClosing(node)){
      tml = '{' + token + '}';
    } else {
      tml = '<' + token + '>' + value + '</' + token + '>';
    }

    //if (this.isShortToken(token, value)){
    //  tml = '[' + token + ': ' + value + ']';
    //} else {
    //  if (this.getOption("decoration_token_format") == '<>')
    //    tml = '<' + token + '>' + value + '</' + token + '>';
    //  else
    //    tml = '[' + token + ']' + value + '[/' + token + ']';
    //}

    return tml;
  },

  registerDataTokenFromVar: function(node) {
    var object = {};
    var tokenName = 'var';

    if (node.attributes) {
      for (var i = 0; i < node.attributes.length; i++) {
        var attr = node.attributes[i];
        if (attr.value === '')
          tokenName = attr.name;
        else
          object[attr.name] = attr.value;
      }
    }

    object.value = object.value || node.innerHTML;
    tokenName = this.contextualize(tokenName, node.innerHTML);
    return "{" + tokenName + "}";
  },

  resetContext: function() {
    this.tokens = [].concat(this.context);
  },

  isShortToken: function(token, value) {
    return (this.getOption("nodes.short").indexOf(token.toLowerCase()) != -1 || value.length < 20);
  },

 
  generateDataTokens: function(text) {
    var self = this;

    text = this.sanitizeValue(text);
    var tokenName = null;

    if (this.getOption("data_tokens.date.enabled")) {
      tokenName = self.getOption("data_tokens.date.name");
      var formats = self.getOption("data_tokens.date.formats");
      formats.forEach(function(format) {
        var regex = format[0];
        var date_format = format[1];

        var matches = text.match(regex);
        if (matches) {
          matches.forEach(function (match) {
            var date = match;
            //var date = self.localizeDate(match, date_format);
            var token = self.contextualize(tokenName, date);
            var replacement = "{" + token + "}";
            text = text.replace(match, replacement);
          });
        }
      });
    }

    var rules = this.getOption("data_tokens.rules");
    if (rules) {
      rules.forEach(function (rule) {
        if (rule.enabled) {
          var matches = text.match(rule.regex);
          if (matches) {
            matches.forEach(function (match) {
              var value = match.trim();
              if (value !== '') {
                var token = self.contextualize(rule.name, value);
                var replacement = match.replace(value, "{" + token + "}");
                text = text.replace(match, replacement);
              }
            });
          }
        }
      });
    }
    return text;
  },


  generateHtmlToken: function(node, value) {
    var name = node.tagName.toLowerCase();
    var attributes = node.attributes;
    var attributesHash = {};
    value = (!value ? '{$0}' : value);

    if (attributes.length === 0) {
      if (dom.isSelfClosing(node)) {
        if (dom.isSeparator(node)){
          return '<' + name + '/>';
        } else {
          return '<' + name + '>' + '</' + name + '>';
        }
      }
      return '<' + name + '>' + value + '</' + name + '>';
    }

    for(var i=0; i<attributes.length; i++) {
      attributesHash[attributes[i].name] = attributes[i].value;
    }

    var keys = utils.keys(attributesHash);
    keys.sort();

    var attr = [];
    keys.forEach(function(key) {
      var quote = (attributesHash[key].indexOf("'") != -1 ? '"' : "'");
      attr.push(key  + '=' + quote + attributesHash[key] + quote);
    });
    attr = attr.join(' ');

    if (dom.isSelfClosing(node)) {
      return '<' + name + ' ' + attr + '>' + '</' + name + '>';
    }
    return '<' + name + ' ' + attr + '>' + value + '</' + name + '>';
  },


  adjustName: function(node) {
    if(node && node.tagName) {
      var name = node.tagName.toLowerCase();
      var map = this.getOption("name_mapping");
      name = map[name] ? map[name] : name;
      return name;
    }
    return "";
  },


  contextualize: function(name, context) {
    if (this.tokens[name] && this.tokens[name] != context) {
      var index = 0;
      var matches = name.match(/\d+$/);
      if (matches && matches.length > 0) {
        index = parseInt(matches[matches.length-1]);
        name = name.replace("" + index, '');
      }
      name = name + (index + 1);
      return this.contextualize(name, context);
    }

    this.tokens[name] = context;
    return name;
  },



  // String Helpers

  isEmptyString: function(tml) {
    tml = tml.replace(/[\s\n\r\t\0\x0b\xa0\xc2]/g, '');
    return (tml === '');
  },

  isUntranslatableText: function(text) {
    return (
      this.isEmptyString(text) ||   // empty
      text.match(/^[0-9,.\s]+$/)    // numbers
    );
  },

  isValidTml: function(tml) {
    var tokens = /<\/?([a-z][a-z0-9]*)\b[^>]*>|{([a-z0-9_\.]+)}|{}/gi;
    return !this.isEmptyString(tml.replace(tokens, ''));
  },

  sanitizeValue: function(value) {
    return value.replace(/^\s+/,'');
  },

  escapeHtml: function(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  },



  // Debugging

  debug: function(doc) {
    this.doc = doc;
    this.debugTree(doc, 0);
  },

  debugTree: function(node, depth) {
    var padding = new Array(depth+1).join('=');
    console.log(padding + "=> " + (typeof node) + ": " + dom.nodeInfo(node));

    if (node.childNodes) {
      var self = this;
      for(var i=0; i<node.childNodes.length; i++) {
        var child = node.childNodes[i];
        self.debugTree(child, depth+1);
      }
    }
  },

  debugTranslation: function(translation) {
    return this.getOption("debug_format").replace('{$0}', translation);
  }



};

module.exports = DomTokenizer;
