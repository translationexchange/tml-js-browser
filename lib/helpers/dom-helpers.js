var inline      = ["a", "span", "i", "b", "img", "strong", "s", "em", "u", "sub", "sup", "var", "code", "kbd"];
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
  
  applyLocaleToLink: function (link, strategy, locale) {
    var origLink = link.getAttribute('data-tml-orig-link');
    var url = origLink || link.href;

    if (link.onclick || link.href.indexOf('javascript:') === 0)
      return;

    var current = document.location.protocol + '//' + document.location.host + document.location.pathname + document.location.search;
    //only same-domain urls
    if (url.indexOf(document.location.protocol + '//' + document.location.host) !== 0)
      return;

    if (url.replace(current).indexOf('#') === 0)
      return;
    
    var skipDefault = strategy && locale === strategy.default && strategy.skip_default;

    if (!skipDefault) {
      if (strategy.strategy === 'param') {
        url += (url.indexOf('?') > -1 ? '&' : '?') + (strategy.param || 'locale') + '=' + locale;
      }
      else if (strategy.strategy === 'pre-path') {
        var withoutDomain = url.replace(document.location.protocol + '//' + document.location.host, '');
        url =  document.location.protocol + '//' + document.location.host + '/' + locale + '/' + withoutDomain.replace(/^\//, '');
      }
    }

    if (!origLink)
      link.setAttribute('data-tml-orig-link', link.href);
    
    link.href = url;
  },
  
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

  childElementCount: function(node) {
    var count = 0;
    var children = node.childNodes;
    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeType == 1) {
        count++;
      }
    }

    return count;
  },

  hasOnlyLinks: function(node) {
    var count = this.childElementCount(node);
    return (count == node.getElementsByTagName('A').length);
  },

  hasInlineSiblings: function(node) {
    if (this.hasOnlyLinks(node.parentNode))
      return false;

    var has_siblings = (node.parentNode && node.parentNode.childNodes.length > 1);
    return (
      has_siblings &&
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

