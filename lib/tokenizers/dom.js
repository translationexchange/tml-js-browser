/**
 * Copyright (c) 2016 Translation Exchange, Inc.
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

  /**
   * Returns back config option value
   *
   * @param name
   * @returns {*}
   * @param default_value
   */
  getOption: function(name, default_value) {
    if(typeof this.options[name] === 'undefined' || this.options[name] === null)
      return utils.hashValue(config.translator_options, name) || default_value;

    return this.options[name] || default_value;
  },

  /**
   * Translates the document
   *
   * @returns {*}
   */
  translate: function() {
    return this.translateTree(this.doc);
  },

  /**
   * Updates all nodes with translations
   */
  updateAllNodes: function(){
    var item;
    for(var i=0,l=this.contentCache.length;i<l;i++){
      item = this.contentCache[i];
      if(item.container) {
        if(item.attribute) {
          item.container.setAttribute(item.attribute, this.translateTml(item.tml, item.data, true));
        } else {
          item.container.innerHTML = this.translateTml(item.tml, item.data);
        }
      }
    }
  },

  /**
   * Replaces nodes
   *
   * @param nodes
   */
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

  /**
   * Translates DOM
   *
   * @param node
   */
  translateDOM: function(node) {
    
    if(this.translatedNodes.indexOf(node) !== -1) return;
    this.translatedNodes.push(node);

    if (node.nodeType == 3) {return; }

    var source = node.nodeType == 1 && this.getSourceBlock(node);
    if (source) {
      window.tml_begin_block({source: source});
    }

    var buffer = [];
    for(var i=0;i<node.childNodes.length;i++) {
      var child = node.childNodes[i];
      if(!child || !this.isTranslatable(child)) continue;

      if (child.nodeType == 3 || (dom.isInline(child) && dom.hasInlineSiblings(child))) {
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

    if(node.getAttribute) {
      this.translateAttributes(node);  
    }
  },


  /**
   * Translates Node Attibutes
   *
   * @param node
   */
  translateAttributes: function(node){
    var val, self = this;
    config.translator_options.attributes.labels.forEach(function(attr){
      if(node.hasAttribute(attr)) {self.replaceAttributes(node, attr);}
    });

    if (node.nodeName == 'INPUT') {
      var type = (node.getAttribute('type') || '').toLowerCase();
      var value = node.getAttribute('value');

      if (value && (type == 'submit' || type == 'button'))
        self.replaceAttributes(node, 'value');
    }
  },


  /**
   * Replace Node Attibutes
   *
   * @param node
   * @param attr
   */
  replaceAttributes: function(node, attr){
    var tml         = node.getAttribute(attr);
    var data        = this.tokens;
    var translation = this.translateTml(tml, null, true);

    node.setAttribute(attr, translation);
    this.contentCache.push({container: node, tml: tml, data: data, attribute: attr}); 
  },


  /**
   * Determine a source block
   *
   * @param node
   * @returns {*}
   */
  getSourceBlock: function(node) {
    if (config.sourceElements) {
      var match = dom.matchesSelectors(node, config.sourceElements);
      if(match) {
        return node.getAttribute('name') || node.getAttribute('id') || node.getAttribute('class');
      }
    }
    return node.getAttribute('data-tml-source') || false;
    
  },

  /**
   * Checks if node is translatable
   *
   * @param node
   * @returns {boolean}
   */
  isTranslatable: function(node) {
    if (node.nodeType == 8) { return false; }
    if (node.nodeType == 3) { node = node.parentNode; }
    if (node.nodeType == 1) {

      var translatables = this.getOption("translatable_elements");
      if(translatables && !dom.matchesSelectors(node, translatables, true)) {
        return false;
      }
      return !dom.matchesSelectors(node, ([]).concat(
        (this.getOption("nodes.scripts") || []),
        (this.getOption("ignore_elements") || []),
        (['[notranslate]','.notranslate','tml\\:label'])
      ), true);
    }
    return true;
  },

  /**
   * Treat new lines like the browser would - replace them with spaces.
   * Remove all double spaces to single spaces.
   *
   * @param tml
   * @returns {XML|string|*}
   */
  normalizeTml: function(tml) {
    tml = tml.replace(/\n/g, ' ').replace(/\s{2,}/g, ' ');
    return tml;
  },

  /**
   * Translates TML string with data tokens
   *
   * @param tml
   * @param data
   * @returns {*}
   */
  translateTml: function(tml, data, isLabel) {

    tml = this.normalizeTml(tml);

    if (this.getOption("split_sentences")) {
      var translation = tml;
      var sentences = utils.splitSentences(tml);
      if (sentences) {
        var self = this;
        sentences.forEach(function (sentence) {
          var sentenceTranslation = self.translateTmlFragment(sentence, data, {label: isLabel});
          if (sentenceTranslation)
            translation = translation.replace(sentence, sentenceTranslation);
        });
        return translation;
      }
    }

    return this.translateTmlFragment(tml, data, {label: isLabel, reset: true});
  },

  /**
   * Translates TML fragment
   *
   * @param tml
   * @param data
   * @param opts
   * @returns {*}
   */
  translateTmlFragment: function(tml, data, opts) {
    opts = opts || {};

    tml = this.generateDataTokens(tml);
    data = data || this.tokens;

    // if (!this.isValidTml(tml)) return null;
    // console.log(tml, data);

    var translation = tml;
    tml = tml.replace(/[\n]/g, '').replace(/\s\s+/g, ' ').trim();

    if (this.getOption("debug"))
      translation = this.debugTranslation(tml);
    else if (opts.label)
      translation = window.trl(tml, data, this.options);
    else
      translation = window.tr(tml, data, this.options);

    if (opts.reset)
      this.resetContext();

    return translation;
  },

  /**
   * Generates TML tags
   *
   * @param node
   * @returns {*}
   */
  generateTmlTags: function(node) {
    if(node.nodeType == 3) { 
      return this.escapeHtml(node.nodeValue); 
    }

    if (!this.isTranslatable(node)) {
      var tokenName = this.contextualize(this.adjustTokenName(node), node.outerHTML);
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
    var token = this.contextualize(this.adjustTokenName(node), tokenContext);
    var tml;

    var value = this.sanitizeValue(buffer);

    if (dom.isSelfClosing(node)){
      tml = ' {' + token + '} '; // the extra space is used when the span or i tags are injected. double space is taken care of later.
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

  /**
   * Creates a data token from a variable node element
   *
   * @param node
   * @returns {string}
   */
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

  /**
   * Resets context
   */
  resetContext: function() {
    this.tokens = [].concat(this.context);
  },

  /**
   * Checks if the token is a short token
   *
   * @param token
   * @param value
   * @returns {boolean}
   */
  isShortToken: function(token, value) {
    return (this.getOption("nodes.short").indexOf(token.toLowerCase()) != -1 || value.length < 20);
  },

  /**
   * Generates data tokens
   *
   * @param text
   * @returns {*|void|XML|string}
   */
  generateDataTokens: function(text) {
    var self = this;

    text = this.sanitizeValue(text);
    var tokenName = null;

    if (this.getOption("data_tokens.date.enabled")) {
      tokenName = self.getOption("data_tokens.date.name");
      var formats = self.getOption("data_tokens.date.formats");
      formats.forEach(function(format) {
        var regex = format[0];
        //var date_format = format[1];
        text = self.tokenizeByRule(text, regex, tokenName);
      });
    }

    var rules = this.getOption("data_tokens.rules");
    if (rules) {
      var enabled_rules = this.getOption("data_tokens.enabled_rules");
      rules.forEach(function (rule) {
        if (!enabled_rules || enabled_rules.indexOf(rule.name) != -1) {
          if (rule.enabled) {
            text = self.tokenizeByRule(text, rule.regex, rule.name);
          }
        }
      });
    }
    return text;
  },

  /**
   * Replaces rule matches with tokens
   *
   * @param text
   * @param regex
   * @param tokenName
   * @returns {*}
   */
  tokenizeByRule: function(text, regex, tokenName) {
    var matches = utils.extractMatches(text, utils.toRegex(regex));
    if (!matches || matches.length === 0) return text;

    var self = this;
    var index = matches.length - 1;
    matches = matches.reverse();
    matches.forEach(function (match) {
      var value = match.value.trim();

      if (value !== '') {
        var token = tokenName;
        if (index > 0) {
          token = tokenName + index;
          index --;
        }
        self.tokens[token] = value;

        var replacement = match.value.replace(value, "{" + token + "}");
        text = utils.replaceBetween(text, match.start, match.end, replacement);
      }
    });

    return text;
  },

  /**
   * Generates HTML tokens
   *
   * @param node
   * @param value
   * @returns {string}
   */
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


  /**
   * Uses token name mapping to create token names from HTML tags
   *
   * @param node
   * @returns {*}
   */
  adjustTokenName: function(node) {
    if(node && node.tagName) {
      var map = this.getOption("name_mapping");

      if (utils.isString(map))
        return map;

      var name = node.tagName.toLowerCase();
      name = map[name] ? map[name] : (map['*'] ? map['*'] : name);
      return name;
    }
    return "";
  },

  /**
   * Generates tokens by name
   *
   * @param name
   * @param context
   * @returns {*}
   */
  contextualize: function(name, context) {
    // if token is not yet used, use it
    if (!this.tokens[name]) {
      this.tokens[name] = context;
      return name;
    }

    var index = 0;
    var matches = name.match(/\d+$/);
    if (matches && matches.length > 0) {
      index = parseInt(matches[matches.length-1]);
      name = name.replace("" + index, '');
    }
    name = name + (index + 1);
    return this.contextualize(name, context);
  },

  // String Helpers

  /**
   * Checks if string is empty
   *
   * @param tml
   * @returns {boolean}
   */
  isEmptyString: function(tml) {
    tml = tml.replace(/[\s\n\r\t\0\x0b\xa0\xc2]/g, '');
    return (tml === '');
  },

  /**
   * Checks if string can be translated
   *
   * @param text
   * @returns {*|boolean|Boolean|Array|{index: number, input: string}}
   */
  isUntranslatableText: function(text) {
    return (
      this.isEmptyString(text) ||   // empty
      text.match(/^[0-9,.\s]+$/)    // numbers
    );
  },

  /**
   * Checks if TML is valid
   *
   * @param tml
   * @returns {boolean}
   */
  isValidTml: function(tml) {
    var tokens = /<\/?([a-z][a-z0-9]*)\b[^>]*>|{([a-z0-9_\.]+)}|\{\}/gi;
    return !this.isEmptyString(tml.replace(tokens, ''));
  },

  /**
   * Cleans up string value
   *
   * @param value
   * @returns {*|void|XML|string}
   */
  sanitizeValue: function(value) {
    return value.replace(/^\s+/,'');
  },

  /**
   * Escapes HTML
   *
   * @param str
   * @returns {string}
   */
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
