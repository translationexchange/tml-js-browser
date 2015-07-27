/**
 * Copyright (c) 2015 Translation Exchange, Inc.
 *
 *  _______                  _       _   _             ______          _
 * |__   __|                | |     | | (_)           |  ____|        | |
 *    | |_ __ __ _ _ __  ___| | __ _| |_ _  ___  _ __ | |__  __  _____| |__   __ _ _ __   __ _  ___
 *    | | '__/ _` | '_ \/ __| |/ _` | __| |/ _ \| '_ \|  __| \ \/ / __| '_ \ / _` | '_ \ / _` |/ _ \
 *    | | | | (_| | | | \__ \ | (_| | |_| | (_) | | | | |____ >  < (__| | | | (_| | | | | (_| |  __/
 *    |_|_|  \__,_|_| |_|___/_|\__,_|\__|_|\___/|_| |_|______/_/\_\___|_| |_|\__,_|_| |_|\__, |\___|
 *                                                                                        __/ |
 *                                                                                       |___/
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var tml         = require('tml-js');

var config      = tml.config;
var utils       = tml.utils;

var DomTokenizer = function(doc, context, options) {
  this.doc = doc;
  this.context = context || {};
  this.tokens = [];
  this.options = options || {};
};

DomTokenizer.prototype = {

  content_cache:[],
  content_nodes:[],

  translate: function() {
    return this.translateTree(this.doc);
  },

  updateAllNodes: function(){
    for(var i=0,l=this.content_cache.length;i<l;i++){
      if(this.content_cache[i].container) {
        this.content_cache[i].container.innerHTML = this.translateTml(this.content_cache[i].tml, this.content_cache[i].data);
      }
    }
  },

  replaceNodes: function(nodes) {
    var ti = document.createElement("tml:inline");
    var parent = nodes[0] && nodes[0].parentNode;
    var container;
    var tml, data, translation, text = "";
    if(parent) {
      tml         = nodes.map(function(n){text+=n.innerText||n.nodeValue;return this.generateTmlTags(n);}.bind(this)).join("");
      data        = this.tokens;
      translation = this.translateTml(tml);

      if(this.isEmptyString(tml) || this.isUntranslatableText(text) || this.isNoTranslate(parent)) return;

      if(nodes.length !== parent.childNodes.length) {
        //setTimeout(function(){          
          parent.insertBefore(ti, nodes[0]);
          ti.innerHTML = translation;
          ti.insertAdjacentHTML("beforebegin", "\n");
          ti.insertAdjacentHTML("afterend", "\n");
          nodes.forEach(function(n){parent.removeChild(n);});
        //}.bind(this),0);
        container = ti;
      } else {
        parent.insertBefore(ti, nodes[0]);
        ti.insertAdjacentHTML("beforebegin", translation);
        parent.removeChild(ti);
        ti = null;
        nodes.forEach(function(n){parent.removeChild(n);});
        container = parent;
      }

      if(this.content_nodes.indexOf(container) == -1) {
        this.content_cache.push({container: container, tml: tml, data: data});  
        this.content_nodes.push(container);
      }
      
    }
  },

  isUntranslatableText: function(text) {
    return (
      this.isEmptyString(text) ||   // empty
      text.match(/^[0-9,.\s]+$/)    // numbers
    );
  },

  translateDOM: function(node) {

    // TODO:
    // if you see an element that has source information - begin block
    // as you recurse out - close the block

    if (node.nodeType == 3) {
      node.nodeValue = node.nodeValue;
      return;
    }

    var l = node.childNodes.length, i = l, buffer  = [];
    while(i--) {
      var child = node.childNodes[l-i-1];
      if(!child || this.isNonTranslatable(child)) continue;

      if (child.nodeType == 3 || this.isInlineNode(child) && this.hasInlineSiblings(child)) {
        buffer.push(child);
      } else {
        this.replaceNodes(buffer);
        this.translateDOM(child);
        buffer = [];
      }
    }

    if (buffer.length>0) this.replaceNodes(buffer);
  },

  hasUntranslatableClass: function(node){
    var classes = node.getAttribute("class");
    if(!classes) return false;
    var x = config.translator_options.ignored_classes.sort();
    var y = classes.split(" ").sort();
    var i = 0;
    var j = 0;
    var found;
    while (i < x.length && j < y.length && !found) {
      if (x[i] < y[j]) i++;
      else if (y[j] < x[i]) j++;
      else found = true;
    }
    return found;
  },

  isNonTranslatable: function(node){
    return (
      (node.nodeType == 1 && this.getOption("nodes.scripts").indexOf(node.tagName.toLowerCase()) != -1) ||
      (node.nodeType == 1 && node.getAttribute('notranslate')) ||
      (node.nodeType == 1 && this.hasUntranslatableClass(node)) ||
      (node.nodeType == 8)
    );
  },

  isNoTranslate: function(node) {
    if (node.attributes) {
      for (var i = 0; i < node.attributes.length; i++) {
        if (node.attributes[i].name == 'notranslate')
          return true;
      }
    }

    return false;
  },

  isNonTranslatableNode: function(node) {
    if (!node) return false;

    if (node.nodeType == 1 && this.getOption("nodes.scripts").indexOf(node.nodeName.toLowerCase()) != -1)
      return true;
    if (node.nodeType == 1 && node.childNodes.length === 0 && node.nodeValue === '')
      return true;

    if (this.isNoTranslate(node)) {
      return true;
    }

    return false;
  },

  translateTml: function(tml, data) {
    if (this.isEmptyString(tml)) return tml;

    tml = this.generateDataTokens(tml);
    data = data || (this.tokens);

    if (this.getOption("split_sentences")) {
      sentences = utils.splitSentences(tml);
      translation = tml;
      var self = this;
      sentences.forEach(function(sentence) {
        var sentenceTranslation = self.getOption("debug") ? self.debugTranslation(sentence) : config.currentLanguage.translate(sentence, data, self.options);
        translation = translation.replace(sentence, sentenceTranslation);
      });
      this.resetContext();
      return translation;
    }

    tml = tml.replace(/[\n]/g, '').replace(/\s\s+/g, ' ').trim();

    translation = this.getOption("debug") ? this.debugTranslation(tml) : config.currentLanguage.translate(tml, data, this.options);

    //console.log(" ");
    //console.log(tml);
    //console.log(this.tokens);
    //console.log(translation);

    this.resetContext();
    return translation;
  },

  hasChildNodes: function(node) {
    if (!node.childNodes) return false;
    return (node.childNodes.length > 0);
  },

  isBetweenSeparators: function(node) {
    if (this.isSeparatorNode(node.previousSibling) && !this.isValidTextNode(node.nextSibling))
      return true;

    if (this.isSeparatorNode(node.nextSibling) && !this.isValidTextNode(node.previousSibling))
      return true;

    return false;
  },

  generateTmlTags: function(node) {
    if(node.nodeType == 3) {
      return node.nodeValue;
    }

    if (this.isNoTranslate(node)) {
      var tokenName = this.contextualize(this.adjustName(node), node.innerHTML);
      return "{" + tokenName + "}";
    }

    var name = node.tagName.toLowerCase();
    if (name == 'var') {
      return this.registerDataTokenFromVar(node);
    }

    var buffer = "";

    for(var i=0; i<node.childNodes.length; i++) {
      var child = node.childNodes[i];
      if (child.nodeType == 3)                    // text node
        buffer = buffer + child.nodeValue;
      else
        buffer = buffer + this.generateTmlTags(child);
    }
    var tokenContext = this.generateHtmlToken(node);
    var token = this.contextualize(this.adjustName(node), tokenContext);
    var tml;

    var value = this.sanitizeValue(buffer);

    if (this.isSelfClosingNode(node)){
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

  getOption: function(name) {
    if(typeof this.options[name] === 'undefined' || this.options[name] === null) {
      return utils.hashValue(config.translator_options, name);
    }
    return this.options[name];
  },

  debugTranslation: function(translation) {
    return this.getOption("debug_format").replace('{$0}', translation);
  },

  isEmptyString: function(tml) {
    //  console.log("TML Before: [" + tml + "]");
    tml = tml.replace(/[\s\n\r\t\0\x0b\xa0\xc2]/g, '');
    //  console.log("TML After: [" + tml + "]");
    return (tml === '');
  },

  resetContext: function() {
    this.tokens = [].concat(this.context);
  },

  isShortToken: function(token, value) {
    return (this.getOption("nodes.short").indexOf(token.toLowerCase()) != -1 || value.length < 20);
  },

  isOnlyChild: function(node) {
    if (!node.parentNode) return false;
    return (node.parentNode.childNodes.length == 1);
  },

  hasInlineSiblings: function(node) {
    return (
      (node.parentNode && node.parentNode.childNodes.length > 1) &&
      (node.previousSibling && (this.isInlineNode(node.previousSibling) || this.isValidTextNode(node.previousSibling))) ||
      (node.nextSibling && (this.isInlineNode(node.nextSibling) || this.isValidTextNode(node.nextSibling)))
    );
  },

  isInlineNode: function(node) {
    return (
    node.nodeType == 1 &&
    this.getOption("nodes.inline").indexOf(node.tagName.toLowerCase()) != -1 &&
    !this.isOnlyChild(node)
    );
  },

  isContainerNode: function(node) {
    return (node.nodeType == 1 && !this.isInlineNode(node));
  },

  isSelfClosingNode: function(node) {
    return (!node.firstChild);
  },

  isIgnoredNode: function(node) {
    if (node.nodeType != 1) return true;
    return (this.getOption("nodes.ignored").indexOf(node.tagName.toLowerCase()) != -1);
  },

  isValidTextNode: function(node) {
    if (!node) return false;
    return (node.nodeType == 3 && !this.isEmptyString(node.nodeValue));
  },

  isSeparatorNode: function(node) {
    if (!node) return false;
    return (node.nodeType == 1 && this.getOption("nodes.splitters").indexOf(node.tagName.toLowerCase()) != -1);
  },

  sanitizeValue: function(value) {
    return value.replace(/^\s+/,'');
  },

  replaceSpecialCharacters: function(text) {
    if (!this.getOption("data_tokens.special.enabled")) return text;

    var matches = text.match(this.getOption("data_tokens.special.regex"));
    var self = this;
    matches.forEach(function(match) {
      token = match.substring(1, match.length - 2);
      self.context[token] = match;
      text = text.replace(match, "{" + token + "}");
    });

    return text;
  },

  generateDataTokens: function(text) {
    var self = this;

    text = this.sanitizeValue(text);
    //console.log("Data Tokens: [[" + text + "]]");
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

    if (this.getOption("data_tokens.numeric.enabled")) {
      tokenName = self.getOption("data_tokens.numeric.name");
      var matches = text.match(self.getOption("data_tokens.numeric.regex"));

      if (matches) {
        matches.forEach(function (match) {
          var value = match.replace(/[.,;\s]/g, '');
          var token = self.contextualize(tokenName, parseInt(value));
          var replacement = match.replace(value, "{" + token + "}");
          text = text.replace(match, replacement);
        });
      }
    }

    return text;
  },

  generateHtmlToken: function(node, value) {
    var name = node.tagName.toLowerCase();
    var attributes = node.attributes;
    var attributesHash = {};
    value = (!value ? '{$0}' : value);

    if (attributes.length === 0) {
      if (this.isSelfClosingNode(node)) {
        if (name == "br" || name == "hr")
          return '<' + name + '/>';
        else
          return '<' + name + '>' + '</' + name + '>';
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

    if (this.isSelfClosingNode(node))
      return '<' + name + ' ' + attr + '>' + '</' + name + '>';

    return '<' + name + ' ' + attr + '>' + value + '</' + name + '>';
  },

  adjustName: function(node) {
    var name = node.tagName.toLowerCase();
    var map = this.getOption("name_mapping");
    name = map[name] ? map[name] : name;
    return name;
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

  debug: function(doc) {
    this.doc = doc;
    this.debugTree(doc, 0);
  },

  debugTree: function(node, depth) {
    var padding = new Array(depth+1).join('=');

    console.log(padding + "=> " + (typeof node) + ": " + this.nodeInfo(node));

    if (node.childNodes) {
      var self = this;
      for(var i=0; i<node.childNodes.length; i++) {
        var child = node.childNodes[i];
        self.debugTree(child, depth+1);
      }
    }
  },

  nodeInfo: function(node) {
    var info = [];
    info.push(node.nodeType);

    if (node.nodeType == 1)
      info.push(node.tagName);

    if (this.isInlineNode(node)) {
      info.push("inline");
      if (this.hasInlineSiblings(node))
        info.push("sentence");
      else
        info.push("only translatable");
    }

    if (this.isSelfClosingNode(node))
      info.push("self closing");

    if (this.isOnlyChild(node))
      info.push("only child");

    if (node.nodeType == 3)
      return "[" + info.join(", ") + "]" + ': "' + node.nodeValue + '"';

    return "[" + info.join(", ") + "]";
  }

};

module.exports = DomTokenizer;
