/**
 * Copyright (c) 2017 Translation Exchange, Inc.
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

// var inline      = ["a", "span", "i", "b", "img", "strong", "s", "em", "u", "sub", "sup", "var", "code", "kbd"];
// var separators  = ["br", "hr"];

module.exports = {

  /**
   * Checks if the string is empty
   *
   * @param str
   * @returns {boolean}
   */
  isEmptyString: function(str) {
    return !str.replace(/[\s\n\r\t\0\x0b\xa0\xc2]/g, '');
  },

  /**
   * Returns back config option value
   *
   * @param name
   * @returns {*}
   * @param default_value
   */
  getOption: function(name, default_value) {
    return utils.hashValue(config.translator_options, name) || default_value;
  },

  /**
   * Checks if node is inline
   *
   * @param node
   * @returns {boolean}
   */
  isInline: function(node) {
    return (
      node.nodeType == 1 &&
      !node.hasAttribute('isolate') &&
      this.getOption('nodes.inline').indexOf(node.tagName.toLowerCase()) != -1 &&
      // inline.indexOf(node.tagName.toLowerCase()) != -1 &&
      !this.isOnlyChild(node)
    );
  },

  /**
   * Count children by type
   *
   * @param node
   * @returns {{total: number, inline: number, breaking: number, text: number}}
   */
  childTypeCounts: function(node) {
    var children = node.childNodes;
    var counts = {
      total: 0,
      inline: 0,
      breaking: 0,
      text: 0
    };

    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      if (child.nodeType == 1) {
        counts.total++;
        if (this.isInline(child))
          counts.inline++;
        else
          counts.breaking++;
      } else if (child.nodeType == 3 && this.isValidText(child)) {
        counts.total++;
        counts.text++;
      }
    }

    return counts;
  },

  /**
   * Count children elements
   *
   * @param node
   * @returns {number}
   */
  childElementCount: function(node) {
    var count = 0;
    var children = node.childNodes;
    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeType == 1 || children[i].nodeType == 3) {
        count++;
      }
    }

    return count;
  },

  /**
   * Checks if all child nodes are links
   *
   * @param node
   * @returns {boolean}
   */
  hasOnlyLinks: function(node) {
    var count = this.childElementCount(node);
    return (count == node.getElementsByTagName('A').length);
  },

  /**
   * Checks if a node has only inline siblings
   *
   * @param node
   * @returns {*}
   */
  hasInlineSiblings: function(node) {
    if (this.hasOnlyLinks(node.parentNode)) {
      return false;
    }

    var has_siblings = (node.parentNode && node.parentNode.childNodes.length > 1);
    return (
      has_siblings &&
      (node.previousSibling && (this.isInline(node.previousSibling) || this.isValidText(node.previousSibling))) ||
      (node.nextSibling && (this.isInline(node.nextSibling) || this.isValidText(node.nextSibling)))
    );
  },

  /**
   * Checks if the node is self closing like <br> or <hr>
   *
   * @param node
   * @returns {boolean}
   */
  isSelfClosing: function(node) {
    return (!node.firstChild);
  },

  /**
   * Checks if node is a valid text node
   *
   * @param node
   * @returns {boolean}
   */
  isValidText: function(node) {
    if (!node) return false;
    return (node.nodeType == 3 && !this.isEmptyString(node.nodeValue));
  },

  /**
   * Checks if node is a separator
   *
   * @param node
   * @returns {boolean}
   */
  isSeparator: function(node) {
    if (!node) return false;
    // return (node.nodeType == 1 && separators.indexOf(node.tagName.toLowerCase()) != -1);
    return (node.nodeType == 1 && this.getOption('nodes.splitters').indexOf(node.tagName.toLowerCase()) != -1);
  },

  /**
   * Checks if a node has child nodes
   *
   * @param node
   * @returns {boolean}
   */
  hasChildNodes: function(node) {
    if (!node.childNodes) return false;
    return (node.childNodes.length > 0);
  },

  /**
   * Checks if node is between separators
   *
   * @param node
   * @returns {boolean}
   */
  isBetweenSeparators: function(node) {
    if (this.isSeparator(node.previousSibling) && !this.isValidText(node.nextSibling)){ return true; }
    if (this.isSeparator(node.nextSibling) && !this.isValidText(node.previousSibling)){ return true; }
    return false;
  },

  /**
   * Checks if node is the only child
   *
   * @param node
   * @returns {boolean}
   */
  isOnlyChild: function(node) {
    if (!node.parentNode) return false;
    return (node.parentNode.childNodes.length == 1);
  },

  /**
   * Checks if node matches selectors
   *
   * @param node
   * @param selectors
   * @param children
   * @returns {boolean}
   */
  matchesSelectors: function(node, selectors, children) {
    var matcher, slctrs = typeof selectors === "string" ? [selectors] : selectors;
    if(slctrs) {
      for(var i=0,l=slctrs.length; i<l;i++) {
        var slctr = slctrs[i] + ((children) ? ("," + slctrs[i] + " *") : "");
        matcher = 
          (node.matches       && node.matches(slctr)) ||
          (node.webkitMatches && node.webkitMatches(slctr)) || 
          (node.mozMatches    && node.mozMatches(slctr)) || 
          (node.msMatches     && node.msMatches(slctr));
        if(matcher) return true;
      }
    }
    return false;    
  },

  /**
   * Returns back a node info
   *
   * @param node
   * @returns {string}
   */
  nodeInfo: function(node) {
    var info = [node.nodeType];

    if (node.nodeType == 1)             { info.push(node.tagName); }
    if (this.isInline(node))            { info.push("inline"); }
    if (this.hasInlineSiblings(node))   { info.push("sentence"); }
    if (!this.hasInlineSiblings(node))  { info.push("only translatable"); }
    if (this.isSelfClosing(node))       { info.push("self closing"); }
    if (this.isOnlyChild(node))         { info.push("only child"); }
    if (this.nodeType == 3)             { info.push("value: " + node.nodeValue); }

    return "[" + info.join(", ") + "]";
  }

};

