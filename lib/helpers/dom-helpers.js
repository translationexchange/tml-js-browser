
var inline      = ["a", "span", "i", "b", "img", "strong", "s", "em", "u", "sub", "sup", "var"];
var scripts     = ["iframe", "script", "noscript", "style", "audio", "video", "map", "object", "track", "embed", "svg", "code", "ruby"];
var separators  = ["br", "hr"];

module.exports = {

  isEmptyString: function(str) {
    return !str.replace(/[\s\n\r\t\0\x0b\xa0\xc2]/g, '');
  },

  isInline: function(node) {
    return (
      node.nodeType == 1 &&
      !node.hasAttribute('isolate') &&
      inline.indexOf(node.tagName.toLowerCase()) != -1 &&
      !this.isOnlyChild(node)
    );
  },

  hasInlineSiblings: function(node) {
    return (
      (node.parentNode && node.parentNode.childNodes.length > 1) &&
      (node.previousSibling && (this.isInline(node.previousSibling) || this.isValidText(node.previousSibling))) ||
      (node.nextSibling && (this.isInline(node.nextSibling) || this.isValidText(node.nextSibling)))
    );
  },

  isSelfClosing: function(node) {
    return (!node.firstChild);
  },

  isValidText: function(node) {
    if (!node) return false;
    return (node.nodeType == 3 && !this.isEmptyString(node.nodeValue));
  },

  isSeparator: function(node) {
    if (!node) return false;
    return (node.nodeType == 1 && separators.indexOf(node.tagName.toLowerCase()) != -1);
  },

  hasChildNodes: function(node) {
    if (!node.childNodes) return false;
    return (node.childNodes.length > 0);
  },

  isBetweenSeparators: function(node) {
    if (this.isSeparator(node.previousSibling) && !this.isValidText(node.nextSibling)){ return true; }
    if (this.isSeparator(node.nextSibling) && !this.isValidText(node.previousSibling)){ return true; }
    return false;
  },

  isOnlyChild: function(node) {
    if (!node.parentNode) return false;
    return (node.parentNode.childNodes.length == 1);
  },  

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

