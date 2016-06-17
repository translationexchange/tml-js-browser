(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

var tml = require('tml-js');
var promise = require('promise');

/**
 * Ajax API adapter
 *
 * @constructor
 */
var Ajax = function() {
};

/**
 * Ajax adapter methods
 */
Ajax.prototype = tml.utils.extend(new tml.ApiAdapterBase(), {

  /**
   * Get data from URL
   *
   * @param url
   * @param params
   */
  get: function(url, params){
    return this.request("get", url, params);
  },

  /**
   * Post data to URL
   *
   * @param url
   * @param params
   */
  post: function(url, params) {
    return this.request("post", url, params);
  },

  /**
   * Perform request
   *
   * @param method
   * @param url
   * @param params
   * @returns {boolean}
   */
  request: function (method, url, params) {
    var t0 = new Date();
    
    var
      data,
      xhr = new XMLHttpRequest();

    if (method.match(/^get$/i)) {
      var query = this.serialize(params || {});
      if (query !== '') url = url + "?" + query;
      data = null;
    } else {
      data = this.serialize(params || {});
    }

    tml.logger.debug("get " + url);

    if ("withCredentials" in xhr) {
      xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
      xhr = new XDomainRequest();
      xhr.open(method, url);
    } else {
      return false;
    }

    return new promise(function (resolve, reject) {
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  
      xhr.onload = function() {
        var t1 = new Date();
        tml.logger.debug("call took " + (t1-t0) + " mls");
        var error = !(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304);
        if (error) {
          var err = new Error('Request status: ' + xhr.status);
          err.xhr = xhr;
          reject(err);
        }
        else {
          resolve(xhr.responseText);
        }
      };
      xhr.onerror = function(err) {
        if (typeof err == 'object')
          err.xhr = xhr;
        else if (typeof err == 'string') {
          err = new Error(err);
          err.xhr = xhr;
        }
        reject(err);
      };
      xhr.send(data);
    });
  },

  /**
   * Serialize object
   *
   * @param obj
   * @returns {string}
   */
  serialize: function(obj) {
    var str = [];
    for(var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
  }

});

module.exports = Ajax;
},{"promise":12,"tml-js":44}],2:[function(require,module,exports){
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

var tml = require('tml-js');
var promise = require('promise');

/**
 * Browser cache adapter
 *
 * @param config
 * @constructor
 */
var Browser = function(config) {
  this.initialize(config);
};

/**
 * Browser cache adapter methods
 */
Browser.prototype = tml.utils.extend(new tml.CacheAdapterBase(), {

  name: "browser",
  read_only: false,

  /**
   * Create browser cache adapter
   *
   * @returns {Storage}
   */
  create: function() {
    return window.localStorage;
  },

  /**
   * Fetch cache data from local url path, if provided
   *
   * @param key
   * @param fallback
   */
  fetchFromPath: function(key, fallback) {
    if (key == 'current_version') {
      return this.fetchDefault(key, fallback);
    }

    var cache_path = this.config.path + "/" + this.config.version + "/" + key + ".json";
    var self = this;

    return self.getRequest().get(cache_path, {}, { resolveWithResponse: true })
        .then(function(data) {
          if (!data) 
            throw new Error('no data');
          
          return self.store(key, data);
        })
        .catch(function (err) {
          return self.fetchDefault(key, fallback);
        });
  },

  /**
   * Fetch data from browser cache
   *
   * @param key
   * @param fallback
   */
  fetch: function(key, fallback) {
    var val = this.cache.getItem(this.getVersionedKey(key));
    if (val) {
      this.info("cache hit " + key);
      return promise.resolve(val);
    } else {
      this.info("cache miss " + key);
      if (this.config.path) {
        return this.fetchFromPath(key, fallback);
      } else {
        return this.fetchDefault(key, fallback);
      }
    }
  },

  /**
   * Get ajax api adapter
   *
   * @returns {Configuration.getApiAdapter|*}
   */
  getRequest: function() {
    if (!this.ajax) {
      var adapter = tml.config.getApiAdapter('ajax');
      this.ajax = new adapter();
    }

    return this.ajax;
  },

  /**
   * Store data in browser cache
   *
   * @param key
   * @param value
   */
  store: function(key, value) {
    var versionedKey = this.getVersionedKey(key);
    this.info("cache store " + key);
    this.cache.setItem(versionedKey, this.stripExtensions(value));
    return promise.resolve(value);
  },

  /**
   * Delete data from browser cache
   *
   * @param key
   */
  del: function(key) {
    this.info("cache del " + key);
    this.cache.removeItem(this.getVersionedKey(key));
    return promise.resolve();
  },

  /**
   * Check if data exists in browser cache
   *
   * @param key
   */
  exists: function(key){
    var val = this.cache.getItem(this.getVersionedKey(key));
    return promise.resolve(!!val);
  },

  /**
   * Clear browser cache
   */
  clear: function() {
    for (var key in this.cache){
      if (key.match(/^tml_/))
        if (!key.match(/current_version/))
          this.cache.removeItem(key);
    }
    return promise.resolve();
  }

});

module.exports = Browser;
},{"promise":12,"tml-js":44}],3:[function(require,module,exports){
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

var tml = require('tml-js');
var promise = require('promise');

/**
 * Inline cache adapter
 *
 * @param config
 * @constructor
 */
var Inline = function(config) {
  this.initialize(config);
};

/**
 * Inline cache adapter methods
 */
Inline.prototype = tml.utils.extend(new tml.CacheAdapterBase(), {

  name: "inline",
  read_only: true,
  cache: {},

  /**
   * Create inline cache adapter
   *
   * @returns {*|{}}
   */
  create: function() {
    return window[this.config.name] || {};
  },

  /**
   * Fetch data from inline cache adapter
   *
   * @param key
   * @param def
   */
  fetch: function(key, def) {
    var parts = key.split("/");
    var val = this.cache;

    parts.forEach(function(part) {
      if (tml.utils.isObject(val))
        val = val[part];
    });

    if (val) {
      this.info("cache hit " + key);
      val = JSON.stringify(val);
      return promise.resolve(val);
    }

    this.info("cache miss " + key);

    if (tml.utils.isFunction(def)) {
      def(function(err, data) {
        // the cache is readonly and cannot store anything
        callback(err, data);
      });
      return;
    }

    val = def || null;
    if (val) val = JSON.stringify(val);
    if (callback) callback(null, val);
  },

  /**
   * Not supported for inline cache
   *
   * @param key
   * @param value
   * @param callback
   * @returns {*}
   */
  store: function(key, value, callback) {
    this.info("the cache is readonly. can't store data");
    return value;
  },

  /**
   * Delete data from inline cache
   *
   * @param key
   * @param callback
   */
  del: function(key, callback) {
    this.info("the cache is readonly. can't delete data");
  },

  /**
   *
   * @param key
   * @param callback
   */
  exists: function(key, callback){
    if(callback) callback(!!this.cache[key]);
  }

});

module.exports = Inline;
},{"promise":12,"tml-js":44}],4:[function(require,module,exports){
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

var tml   = require('tml-js');
var utils = tml.utils;
var promise = require('promise');
var helpers = {

  printWelcomeMessage: function (version) {
    console.log([
      " _______                  _       _   _             ______          _",
      "|__   __|                | |     | | (_)           |  ____|        | |",
      "   | |_ __ __ _ _ __  ___| | __ _| |_ _  ___  _ __ | |__  __  _____| |__   __ _ _ __   __ _  ___",
      "   | | '__/ _` | '_ \\/ __| |/ _` | __| |/ _ \\| '_ \\|  __| \\ \\/ / __| '_ \\ / _` | '_ \\ / _` |/ _ \\",
      "   | | | | (_| | | | \\__ \\ | (_| | |_| | (_) | | | | |____ >  < (__| | | | (_| | | | | (_| |  __/",
      "   |_|_|  \\__,_|_| |_|___/_|\\__,_|\\__|_|\\___/|_| |_|______/_/\\_\\___|_| |_|\\__,_|_| |_|\\__, |\\___|",
      "                                                                                       __/ |",
      "                                                                                      |___/",
      "   version " + version,
      "",
      "   We are hiring! http://translationexchange.com/careers ",
      " "
    ].join("\n"));
  },

  getBrowserLanguages: function() {
    var nav = window.navigator;
    return (
      nav.languages ||
      nav.language && [nav.language] ||
      nav.userLanguage && [nav.userLanguage] ||
      nav.browserLanguage && [nav.browserLanguage] ||
      null
    );
  },

  includeLs: function(options) {
    var node = document.createElement("div");
    if (utils.isObject(options)) {
      for(var propertyName in options) {
        if (propertyName == 'type')
          node.setAttribute("data-tml-language-selector", options[propertyName]);
        else
          node.setAttribute("data-tml-" + propertyName, options[propertyName]);
      }
    } else {
      node.setAttribute("data-tml-language-selector", "sideflags");
    }
    document.body.appendChild(node);
  },

  includeAgent: function(app, options, callback) {
    var agent_host = options.host || "https://tools.translationexchange.com/agent/stable/agent.min.js";

    if (options.cache) {
      var t = new Date().getTime();
      t = t - (t % options.cache);
      agent_host += "?ts=" + t;
    }

    tml.logger.debug("loading agent from " + agent_host);
    return new promise(function (resolve) {
      function resolveAndCallback() {
        resolve();
        if (utils.isFunction(callback)) callback();
      }

      utils.addJS(window.document, 'tml-agent', agent_host, function() {
        Trex.init(app.key, options);
        Trex.ready(resolveAndCallback);
      });
    });
  },

  getCurrentSource: function(options) {
    var current_source = null;
    var current_source_method = options.current_source || options.source;

    // current_source can be a function, hash or a string
    if (current_source_method) {
        if (utils.isFunction(current_source_method)) {
            current_source = current_source_method();
        } else {
            current_source = current_source_method;
        }
    }

    // a simple way to strip a url
    if (!current_source) {
        var parser = document.createElement('a');
        parser.href = location.href;
        current_source = parser.pathname;
    }

    current_source = current_source.replace(/^\//, '');

    if (current_source.match(/\/$/))
        current_source = current_source + 'index';
    if (current_source === '')
        current_source = 'index';

    return current_source;
  },

  getCurrentLocale: function(key, locale_method) {
    var current_locale = null;

    if (locale_method) {
      if (utils.isFunction(locale_method)) {
          current_locale = locale_method();
      } else {
          current_locale = locale_method;
      }
    } else {
      current_locale = (window.location.search.match(/[?&]locale=([^&]+)(&|$)/) ||[])[1];
      if (current_locale) {
        this.updateCurrentLocale(key, current_locale);
      } else {
        var cookie = this.getCookie(key);
        current_locale = cookie.locale;
      }
    }
    return current_locale;
  },

  updateCurrentLocale: function(key, locale) {
    var data = helpers.getCookie(key);
    data = data || {};
    data.locale = locale;
    this.setCookie(key, data);
  },

  getCookie: function(key) {
    var cname = utils.getCookieName(key);
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1);
      if (c.indexOf(name) != -1)
        return utils.decode(c.substring(name.length,c.length));
    }
    return {};
  },

  setCookie: function(key, data) {
    var cname = utils.getCookieName(key);
    document.cookie = cname + "=" + utils.encode(data) + "; path=/";
  }

};

module.exports = {
  printWelcomeMessage:  helpers.printWelcomeMessage,
  getBrowserLanguages:  helpers.getBrowserLanguages,
  includeTools:         helpers.includeTools,
  getCurrentSource:     helpers.getCurrentSource,
  getCurrentLocale:     helpers.getCurrentLocale,
  updateCurrentLocale:  helpers.updateCurrentLocale,
  getCookie:            helpers.getCookie,
  setCookie:            helpers.setCookie,
  includeLs:            helpers.includeLs,
  includeAgent:         helpers.includeAgent
};
},{"promise":12,"tml-js":44}],5:[function(require,module,exports){
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


},{}],6:[function(require,module,exports){
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

// entry point for browserify

(function (root, factory) {
  function addToRoot(result) {
    //for backwards compatibility - always copy everything to global object
    if (root) {

      for (var key in result) {
        if (result.hasOwnProperty(key)) {
          root[key] = result[key];
        }
      }
    }
  }

  if ( typeof exports === 'object' ) {
    //console.log('exports load', module);
    module.exports = factory();
    addToRoot(module.exports);
  }
  else if ( typeof define === 'function' && define.amd ) {
    //console.log('amd load');
    define( [], factory );
  }
  else
  {
    //console.log('global load');
    addToRoot(factory());
  }
}(window, function () {

    var tml = require('tml-js');
    var helpers = require('./helpers');
    var DomTokenizer = require('./tokenizers/dom');
    var Emitter = require('tiny-emitter');
    var promise = require('promise');
    var emitter = new Emitter();

    var mutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

    tml = tml.utils.extend(tml, {
      version: '0.4.49',

      on: emitter.on.bind(emitter),
      off: emitter.off.bind(emitter),
      once: emitter.once.bind(emitter),
      emit: emitter.emit.bind(emitter),

      app: null,
      block_options: [],
      root_element: null,
      options: {},

      /**
       * Initializes TML library
       * @param options
       * @param callback
       */
      init: function (options, callback) {
        options = options || {};

        tml.options = options;
        tml.config.debug = (options.debug ? options.debug : tml.config.debug);

        options.preferred_languages = options.preferred_languages || helpers.getBrowserLanguages();

        if (!options.current_source) {
          options.current_source = function () {
            return helpers.getCurrentSource({});
          };
        }

        if (tml.config.debug || options.info) {
          helpers.printWelcomeMessage(tml.version);
        }
        return tml.initApplication(options)
            .then(function () {
              tml.startKeyListener();
    
              tml.startSourceListener(options);
    
              if (callback) {
                callback();
              }
            });
      },

      // submit any newly registered keys every 3 seconds
      startKeyListener: function () {
        if (tml.getApplication().isInlineModeEnabled()) {
          var app = tml.getApplication();
          var freq = 3000;
          setInterval(function () {
            app.submitMissingTranslationKeys();
          }, freq);
        }
      },

      refreshSource: function (options) {
        var self = this;
        var source = helpers.getCurrentSource(options);
        var app = tml.getApplication();
        var key = tml.utils.generateKey(source); // utils
        var locale = app.current_locale;

        var updateSource = function () {
          if (self.tokenizer) {
            self.tokenizer.updateAllNodes();
          }
        };

        if (!app.getSource(source)) {
          app.loadSources([source], locale, function (sources) {
            if (sources.length > 0 && sources[0] && sources[0].sources && sources[0].sources.length > 0) {
              app.loadSources(sources[0].sources, app.current_locale, updateSource);
            } else {
              updateSource();
            }
          });
        }
      },

      //  keep track of route changes and update source
      startSourceListener: function (options) {
        // TODO: Ian, we don't need this unless we use a fully automated mode
        if (!options.translateBody) return;

        var self = this;
        var app = tml.getApplication();

        function setSource(method) {
          return function () {
            if (method) {
              method.apply(history, arguments);
            }
            self.refreshSource(options);
          };
        }

        window.history.pushState = setSource(window.history.pushState);
        window.history.replaceState = setSource(window.history.replaceState);
        window.addEventListener('popstate', setSource());
      },

      /**
       * Initializes application
       *
       * @param options
       */
      initApplication: function (options) {
        var t0 = new Date();

        var cookie = helpers.getCookie(options.key);

        var cache_version = null;

        if (options.cache && options.cache.version)
          cache_version = options.cache.version;

        tml.config.registerApiAdapter('ajax', require('./api_adapters/ajax'));
        tml.config.api = 'ajax';

        tml.config.registerCacheAdapters({
          inline: require('./cache_adapters/inline'),
          browser: require('./cache_adapters/browser')
        });

        options = tml.utils.merge(tml.config, {
          delayed_flush: true,
          api: "ajax",
          current_source: helpers.getCurrentSource(options),
          current_locale: helpers.getCurrentLocale(options.key, options.current_locale),
          current_translator: cookie.translator ? new tml.Translator(cookie.translator) : null,
          accepted_locales: helpers.getBrowserLanguages(),
          cache: {
            enabled: true,
            adapter: "browser",
            version: cache_version,
            version_check_interval: options.version_check_interval || 60 // browser will default to every 60 sec
          }
        }, options);

        options.fetch_version = (options.cache.adapter == 'browser' && !cache_version);

        tml.config.initCache(options.key);
        // console.log(options);

        tml.app = new tml.Application({
          key: options.key,
          token: cookie.oauth ? cookie.oauth.token : null,
          host: options.host,
          cdn_host: options.cdn_host
        });
        return tml.app.init(options)
            .catch(function (err) {
              console.log(err.stack);
              if (options.onInitError && options.onInitError.call) {
                options.onInitError(err);
              }
            })
            .then(function () {
              if ((options.translateBody || options.translate_body) && mutationObserver) {
                tml.translateElement(document);
              }
              return new promise(function (resolve) {
                tml.domReady(function () {
                  if ((options.translateBody || options.translate_body) && !mutationObserver) {
                    tml.translateElement(document.body);
                  }
  
                  var t1 = new Date();
                  tml.logger.debug("page render took " + (t1 - t0) + " mls");
  
                  if ((options.translateTitle || options.translate_title) && document.title !== "") {
                    document.title = tml.translateLabel(document.title);
                  }
  
                  if (!options.agent) options.agent = {};
  
                  if (options.language_selector) {
                    helpers.includeLs(options.language_selector);
                  }
  
                  helpers.includeAgent(tml.app, {
                    host: options.agent.host,
                    cache: options.agent.cache || 864000000,
                    domains: options.agent.domains || {},
                    locale: tml.app.current_locale,
                    source: tml.app.current_source,
                    sdk: options.sdk || 'tml-js v' + tml.version,
                    css: tml.app.css,
                    languages: tml.app.languages
                  }).then(function () {
                    if (typeof(options.onLoad) == "function") {
                      options.onLoad(tml.app);
                    }
                    tml.emit('load');
                    resolve();
                  });
                });
              });
            });
      },

      /**
       * Fires when DOM is ready
       *
       * @param fn
       */
      domReady: function (fn) {
        if (!document.readyState || /ded|te/.test(document.readyState)) {
          fn();
        } else {
          document.addEventListener("DOMContentLoaded", fn, false);
        }
      },

      /**
       * Changes language. This method can be used:
       *
       *
       *
       * @param locale
       * @param refresh
       */
      changeLanguage: function (locale, refresh) {
        return tml.app.changeLanguage(locale)
            .then(function (language) {
              helpers.updateCurrentLocale(tml.options.key, locale);
              tml.config.currentLanguage = tml.app.getCurrentLanguage();
              var autoMode = this.tokenizer && this.tokenizer.updateAllNodes;
              refresh = typeof refresh !== undefined ? refresh : !tml.config.refreshHandled;
    
              // for dynamic translate body - we want to reload all translations automatically
              if (autoMode) {
                this.tokenizer.updateAllNodes();
              }
    
              if (refresh) {
                // let SDKs handle it: server side or manual JS (like backbone or jst) - we may need a refresh
                // other client-side SDKs need to handle it themselves - angular, ember
                window.location.reload();
              }
    
              if (tml.utils.isFunction(tml.options.onLanguageChange)) {
                tml.options.onLanguageChange(language);
              }
              tml.emit('language-change', language);
            }.bind(this));
      },


      /**
       * Translates a string
       *
       * @param label
       * @param description
       * @param tokens
       * @param options
       * @returns {*}
       */
      translate: function (label, description, tokens, options) {
        if (!tml.app) {
          throw new Error("Invalid application.");
        }

        var params = tml.utils.normalizeParams(label, description, tokens, options);
        params.label = params.label.replace(/\s\s+/g, ' ');

        params.options = tml.utils.extend({}, {
          current_locale: tml.app.current_locale,
          current_source: tml.app.current_source,
          current_translator: tml.app.current_translator,
          block_options: (tml.block_options || [])
        }, params.options);

        return tml.app.getCurrentLanguage().translate(params);
      },

      /**
       * Translates a label
       *
       * @param label
       * @param description
       * @param tokens
       * @param options
       * @returns {*}
       */
      translateLabel: function (label, description, tokens, options) {
        var params = tml.utils.normalizeParams(label, description, tokens, options);
        params.options.skip_decorations = true;
        return tml.translate(params);
      },

      /**
       * Translates an element
       *
       * @param container
       */
      translateElement: function (container) {
        container = (typeof container === "string") ? document.getElementById(container) : container;

        tml.config.currentLanguage = tml.app.getCurrentLanguage();

        this.tokenizer = new DomTokenizer(container, {}, {
          debug: false,
          current_source: tml.app.current_source || 'index',
          current_translator: tml.app.current_translator
        });

        if (/ded|te/.test(document.readyState)) {
          this.tokenizer.translateDOM(document.body);
          this.translateNow();
        } else if (mutationObserver) {
          if (document.body) {
            this.tokenizer.translateDOM(document.body);
          }
          this.translateNow();
        }
      },

      /**
       * Translates DOM
       */
      translateNow: function () {
        var observer, tokenizer = this.tokenizer;
        var moHandler = function (mutations) {
          var nodeList = [];
          if (mutations.length > 0) {
            mutations.forEach(function (mutation) {
              var target = mutation.target;
              var nodes = mutation.addedNodes || [];

              if (nodes.length > 0) {
                for (var i = nodes.length - 1; i > -1; i--) {
                  var node = nodes[i];
                  if (node.tagName && node.tagName.toLowerCase().indexOf("tml:") != -1) continue;
                  if (node.tagName && node.tagName.toLowerCase().indexOf("script") != -1) continue;
                  nodeList.push(node);
                }
              }
            });

            nodeList.forEach(function (n) {
              tokenizer.translateDOM(n);
            });

            if (document.readyState == "interactive") {
              if(!tml.options.translateBody || tml.options.disableAutoTranslate) {
                observer.disconnect();
              }
            }
          }
        };

        observer = new mutationObserver(moHandler);
        observer.observe(document, {
          subtree: true,
          attributes: true,
          attributeOldValue: false,
          childList: true,
          characterData: true,
          characterDataOldValue: false
        });
      },

      /**
       * Translates text nodes
       *
       * @param parent_node
       * @param text_node
       * @param label
       */
      translateTextNode: function (parent_node, text_node, label) {
        // we need to handle empty spaces better
        var sanitized_label = tml.utils.sanitizeString(label);
        if (tml.utils.isNumber(sanitized_label)) return;
        if (sanitized_label === null || sanitized_label.length === 0) return;
        var translation = this.translate(sanitized_label);

        if (/^\s/.test(label)) translation = " " + translation;
        if (/\s$/.test(label)) translation = translation + " ";

        var translated_node = document.createElement("span");
        // translated_node.style.border = '1px dotted green';
        translated_node.innerHTML = translation;

        // translated_node.style.border = '1px dotted red';
        parent_node.replaceChild(translated_node, text_node);
      },

      /**
       * Translates text elements
       *
       * @param element
       */
      translateTextElements: function (element) {
        if (tml.utils.element('tml_status_node')) return;

        console.log("Initializing text nodes...");

        // add node to the document so it is not processed twice
        var status_node = document.createElement('div');
        status_node.id = 'tml_status_node';
        status_node.style.display = 'none';
        document.body.appendChild(status_node);

        var text_nodes = [];
        var tree_walker = document.createTreeWalker(element || document.body, NodeFilter.SHOW_TEXT, null, false);
        while (tree_walker.nextNode()) {
          text_nodes.push(tree_walker.currentNode);
        }

        console.log("Found " + text_nodes.length + " text nodes");

        var disable_sentences = true;

        for (i = 0; i < text_nodes.length; i++) {
          var current_node = text_nodes[i];
          var parent_node = current_node.parentNode;

          if (!parent_node) continue;

          // no scripts
          if (parent_node.tagName == "script" || parent_node.tagName == "SCRIPT") continue;

          var label = current_node.nodeValue || "";

          // console.log(label);

          // no html image tags
          if (label.indexOf("<img") != -1) continue;

          // no comments
          if (label.indexOf("<!-") != -1) continue;

          var sentences = label.split(". ");
          this.translateTextNode(parent_node, current_node, label);
        }
      },

      /**
       * Returns application
       *
       * @returns {*}
       */
      getApplication: function () {
        return tml.app;
      },

      /**
       * Returns current source
       *
       * @returns {*}
       */
      getCurrentSource: function () {
        return tml.app.current_source;
      },

      /**
       * Returns current translator
       *
       * @returns {*}
       */
      getCurrentTranslator: function () {
        return tml.app.current_translator;
      },

      /**
       * Returns current language
       *
       * @returns {*}
       */
      getCurrentLanguage: function () {
        return tml.app.getCurrentLanguage();
      },

      /**
       * Encloses block options
       *
       * @param options
       * @param callback
       */
      block: function (options, callback) {
        tml.block_options.unshift(options);
        callback();
        tml.block_options.pop();
      },

      /**
       * Begins block options
       *
       * @param options
       */
      beginBlock: function (options) {
        tml.block_options.unshift(options);
      },

      /**
       * Ends block options
       */
      endBlock: function () {
        tml.block_options.pop();
      },

      /**
       * Clears cache
       */
      clearCache: function () {
        tml.config.getCache().clear();
      }

    });

    return {
      tml: tml,
      tr: tml.translate,
      trl: tml.translateLabel,
      tre: tml.translateElement,
      tml_application: tml.getApplication,
      tml_current_source: tml.getCurrentSource,
      tml_current_translator: tml.getCurrentTranslator,
      tml_current_language: tml.getCurrentLanguage,
      tml_block: tml.block,
      tml_begin_block: tml.beginBlock,
      tml_end_block: tml.endBlock,

      util: tml.utils
    };
  }
));

},{"./api_adapters/ajax":1,"./cache_adapters/browser":2,"./cache_adapters/inline":3,"./helpers":4,"./tokenizers/dom":7,"promise":12,"tiny-emitter":22,"tml-js":44}],7:[function(require,module,exports){
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

},{"../helpers/dom-helpers":5,"tml-js":44}],8:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
 *     on objects.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  function Bar () {}
  try {
    var arr = new Uint8Array(1)
    arr.foo = function () { return 42 }
    arr.constructor = Bar
    return arr.foo() === 42 && // typed array instances can be augmented
        arr.constructor === Bar && // constructor can be set
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (arg) {
  if (!(this instanceof Buffer)) {
    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
    if (arguments.length > 1) return new Buffer(arg, arguments[1])
    return new Buffer(arg)
  }

  this.length = 0
  this.parent = undefined

  // Common case.
  if (typeof arg === 'number') {
    return fromNumber(this, arg)
  }

  // Slightly less common case.
  if (typeof arg === 'string') {
    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
  }

  // Unusual.
  return fromObject(this, arg)
}

function fromNumber (that, length) {
  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < length; i++) {
      that[i] = 0
    }
  }
  return that
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

  // Assumption: byteLength() return value is always < kMaxLength.
  var length = byteLength(string, encoding) | 0
  that = allocate(that, length)

  that.write(string, encoding)
  return that
}

function fromObject (that, object) {
  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

  if (isArray(object)) return fromArray(that, object)

  if (object == null) {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (typeof ArrayBuffer !== 'undefined') {
    if (object.buffer instanceof ArrayBuffer) {
      return fromTypedArray(that, object)
    }
    if (object instanceof ArrayBuffer) {
      return fromArrayBuffer(that, object)
    }
  }

  if (object.length) return fromArrayLike(that, object)

  return fromJsonObject(that, object)
}

function fromBuffer (that, buffer) {
  var length = checked(buffer.length) | 0
  that = allocate(that, length)
  buffer.copy(that, 0, 0, length)
  return that
}

function fromArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Duplicate of fromArray() to keep fromArray() monomorphic.
function fromTypedArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  // Truncating the elements is probably not what people expect from typed
  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
  // of the old Buffer constructor.
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    array.byteLength
    that = Buffer._augment(new Uint8Array(array))
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromTypedArray(that, new Uint8Array(array))
  }
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
// Returns a zero-length buffer for inputs that don't conform to the spec.
function fromJsonObject (that, object) {
  var array
  var length = 0

  if (object.type === 'Buffer' && isArray(object.data)) {
    array = object.data
    length = checked(array.length) | 0
  }
  that = allocate(that, length)

  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function allocate (that, length) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return an object instance of the Buffer class
    that.length = length
    that._isBuffer = true
  }

  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
  if (fromPool) that.parent = rootParent

  return that
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  var i = 0
  var len = Math.min(x, y)
  while (i < len) {
    if (a[i] !== b[i]) break

    ++i
  }

  if (i !== len) {
    x = a[i]
    y = b[i]
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; i++) {
      length += list[i].length
    }
  }

  var buf = new Buffer(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

function byteLength (string, encoding) {
  if (typeof string !== 'string') string = '' + string

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      // Deprecated
      case 'raw':
      case 'raws':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

function slowToString (encoding, start, end) {
  var loweredCase = false

  start = start | 0
  end = end === undefined || end === Infinity ? this.length : end | 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

// `get` is deprecated
Buffer.prototype.get = function get (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` is deprecated
Buffer.prototype.set = function set (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    var swap = encoding
    encoding = offset
    offset = length | 0
    length = swap
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; i--) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), targetStart)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array set method before overwriting
  arr._set = arr.set

  // deprecated
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.indexOf = BP.indexOf
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

},{"base64-js":9,"ieee754":10,"is-array":11}],9:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],10:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],11:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],12:[function(require,module,exports){
'use strict';

module.exports = require('./lib')

},{"./lib":17}],13:[function(require,module,exports){
'use strict';

var asap = require('asap/raw');

function noop() {}

// States:
//
// 0 - pending
// 1 - fulfilled with _value
// 2 - rejected with _value
// 3 - adopted the state of another promise, _value
//
// once the state is no longer pending (0) it is immutable

// All `_` prefixed properties will be reduced to `_{random number}`
// at build time to obfuscate them and discourage their use.
// We don't use symbols or Object.defineProperty to fully hide them
// because the performance isn't good enough.


// to avoid using try/catch inside critical functions, we
// extract them to here.
var LAST_ERROR = null;
var IS_ERROR = {};
function getThen(obj) {
  try {
    return obj.then;
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

function tryCallOne(fn, a) {
  try {
    return fn(a);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}
function tryCallTwo(fn, a, b) {
  try {
    fn(a, b);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

module.exports = Promise;

function Promise(fn) {
  if (typeof this !== 'object') {
    throw new TypeError('Promises must be constructed via new');
  }
  if (typeof fn !== 'function') {
    throw new TypeError('not a function');
  }
  this._45 = 0;
  this._81 = 0;
  this._65 = null;
  this._54 = null;
  if (fn === noop) return;
  doResolve(fn, this);
}
Promise._10 = null;
Promise._97 = null;
Promise._61 = noop;

Promise.prototype.then = function(onFulfilled, onRejected) {
  if (this.constructor !== Promise) {
    return safeThen(this, onFulfilled, onRejected);
  }
  var res = new Promise(noop);
  handle(this, new Handler(onFulfilled, onRejected, res));
  return res;
};

function safeThen(self, onFulfilled, onRejected) {
  return new self.constructor(function (resolve, reject) {
    var res = new Promise(noop);
    res.then(resolve, reject);
    handle(self, new Handler(onFulfilled, onRejected, res));
  });
};
function handle(self, deferred) {
  while (self._81 === 3) {
    self = self._65;
  }
  if (Promise._10) {
    Promise._10(self);
  }
  if (self._81 === 0) {
    if (self._45 === 0) {
      self._45 = 1;
      self._54 = deferred;
      return;
    }
    if (self._45 === 1) {
      self._45 = 2;
      self._54 = [self._54, deferred];
      return;
    }
    self._54.push(deferred);
    return;
  }
  handleResolved(self, deferred);
}

function handleResolved(self, deferred) {
  asap(function() {
    var cb = self._81 === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      if (self._81 === 1) {
        resolve(deferred.promise, self._65);
      } else {
        reject(deferred.promise, self._65);
      }
      return;
    }
    var ret = tryCallOne(cb, self._65);
    if (ret === IS_ERROR) {
      reject(deferred.promise, LAST_ERROR);
    } else {
      resolve(deferred.promise, ret);
    }
  });
}
function resolve(self, newValue) {
  // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
  if (newValue === self) {
    return reject(
      self,
      new TypeError('A promise cannot be resolved with itself.')
    );
  }
  if (
    newValue &&
    (typeof newValue === 'object' || typeof newValue === 'function')
  ) {
    var then = getThen(newValue);
    if (then === IS_ERROR) {
      return reject(self, LAST_ERROR);
    }
    if (
      then === self.then &&
      newValue instanceof Promise
    ) {
      self._81 = 3;
      self._65 = newValue;
      finale(self);
      return;
    } else if (typeof then === 'function') {
      doResolve(then.bind(newValue), self);
      return;
    }
  }
  self._81 = 1;
  self._65 = newValue;
  finale(self);
}

function reject(self, newValue) {
  self._81 = 2;
  self._65 = newValue;
  if (Promise._97) {
    Promise._97(self, newValue);
  }
  finale(self);
}
function finale(self) {
  if (self._45 === 1) {
    handle(self, self._54);
    self._54 = null;
  }
  if (self._45 === 2) {
    for (var i = 0; i < self._54.length; i++) {
      handle(self, self._54[i]);
    }
    self._54 = null;
  }
}

function Handler(onFulfilled, onRejected, promise){
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, promise) {
  var done = false;
  var res = tryCallTwo(fn, function (value) {
    if (done) return;
    done = true;
    resolve(promise, value);
  }, function (reason) {
    if (done) return;
    done = true;
    reject(promise, reason);
  })
  if (!done && res === IS_ERROR) {
    done = true;
    reject(promise, LAST_ERROR);
  }
}

},{"asap/raw":21}],14:[function(require,module,exports){
'use strict';

var Promise = require('./core.js');

module.exports = Promise;
Promise.prototype.done = function (onFulfilled, onRejected) {
  var self = arguments.length ? this.then.apply(this, arguments) : this;
  self.then(null, function (err) {
    setTimeout(function () {
      throw err;
    }, 0);
  });
};

},{"./core.js":13}],15:[function(require,module,exports){
'use strict';

//This file contains the ES6 extensions to the core Promises/A+ API

var Promise = require('./core.js');

module.exports = Promise;

/* Static Functions */

var TRUE = valuePromise(true);
var FALSE = valuePromise(false);
var NULL = valuePromise(null);
var UNDEFINED = valuePromise(undefined);
var ZERO = valuePromise(0);
var EMPTYSTRING = valuePromise('');

function valuePromise(value) {
  var p = new Promise(Promise._61);
  p._81 = 1;
  p._65 = value;
  return p;
}
Promise.resolve = function (value) {
  if (value instanceof Promise) return value;

  if (value === null) return NULL;
  if (value === undefined) return UNDEFINED;
  if (value === true) return TRUE;
  if (value === false) return FALSE;
  if (value === 0) return ZERO;
  if (value === '') return EMPTYSTRING;

  if (typeof value === 'object' || typeof value === 'function') {
    try {
      var then = value.then;
      if (typeof then === 'function') {
        return new Promise(then.bind(value));
      }
    } catch (ex) {
      return new Promise(function (resolve, reject) {
        reject(ex);
      });
    }
  }
  return valuePromise(value);
};

Promise.all = function (arr) {
  var args = Array.prototype.slice.call(arr);

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([]);
    var remaining = args.length;
    function res(i, val) {
      if (val && (typeof val === 'object' || typeof val === 'function')) {
        if (val instanceof Promise && val.then === Promise.prototype.then) {
          while (val._81 === 3) {
            val = val._65;
          }
          if (val._81 === 1) return res(i, val._65);
          if (val._81 === 2) reject(val._65);
          val.then(function (val) {
            res(i, val);
          }, reject);
          return;
        } else {
          var then = val.then;
          if (typeof then === 'function') {
            var p = new Promise(then.bind(val));
            p.then(function (val) {
              res(i, val);
            }, reject);
            return;
          }
        }
      }
      args[i] = val;
      if (--remaining === 0) {
        resolve(args);
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) {
    reject(value);
  });
};

Promise.race = function (values) {
  return new Promise(function (resolve, reject) {
    values.forEach(function(value){
      Promise.resolve(value).then(resolve, reject);
    });
  });
};

/* Prototype Methods */

Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected);
};

},{"./core.js":13}],16:[function(require,module,exports){
'use strict';

var Promise = require('./core.js');

module.exports = Promise;
Promise.prototype['finally'] = function (f) {
  return this.then(function (value) {
    return Promise.resolve(f()).then(function () {
      return value;
    });
  }, function (err) {
    return Promise.resolve(f()).then(function () {
      throw err;
    });
  });
};

},{"./core.js":13}],17:[function(require,module,exports){
'use strict';

module.exports = require('./core.js');
require('./done.js');
require('./finally.js');
require('./es6-extensions.js');
require('./node-extensions.js');
require('./synchronous.js');

},{"./core.js":13,"./done.js":14,"./es6-extensions.js":15,"./finally.js":16,"./node-extensions.js":18,"./synchronous.js":19}],18:[function(require,module,exports){
'use strict';

// This file contains then/promise specific extensions that are only useful
// for node.js interop

var Promise = require('./core.js');
var asap = require('asap');

module.exports = Promise;

/* Static Functions */

Promise.denodeify = function (fn, argumentCount) {
  if (
    typeof argumentCount === 'number' && argumentCount !== Infinity
  ) {
    return denodeifyWithCount(fn, argumentCount);
  } else {
    return denodeifyWithoutCount(fn);
  }
}

var callbackFn = (
  'function (err, res) {' +
  'if (err) { rj(err); } else { rs(res); }' +
  '}'
);
function denodeifyWithCount(fn, argumentCount) {
  var args = [];
  for (var i = 0; i < argumentCount; i++) {
    args.push('a' + i);
  }
  var body = [
    'return function (' + args.join(',') + ') {',
    'var self = this;',
    'return new Promise(function (rs, rj) {',
    'var res = fn.call(',
    ['self'].concat(args).concat([callbackFn]).join(','),
    ');',
    'if (res &&',
    '(typeof res === "object" || typeof res === "function") &&',
    'typeof res.then === "function"',
    ') {rs(res);}',
    '});',
    '};'
  ].join('');
  return Function(['Promise', 'fn'], body)(Promise, fn);
}
function denodeifyWithoutCount(fn) {
  var fnLength = Math.max(fn.length - 1, 3);
  var args = [];
  for (var i = 0; i < fnLength; i++) {
    args.push('a' + i);
  }
  var body = [
    'return function (' + args.join(',') + ') {',
    'var self = this;',
    'var args;',
    'var argLength = arguments.length;',
    'if (arguments.length > ' + fnLength + ') {',
    'args = new Array(arguments.length + 1);',
    'for (var i = 0; i < arguments.length; i++) {',
    'args[i] = arguments[i];',
    '}',
    '}',
    'return new Promise(function (rs, rj) {',
    'var cb = ' + callbackFn + ';',
    'var res;',
    'switch (argLength) {',
    args.concat(['extra']).map(function (_, index) {
      return (
        'case ' + (index) + ':' +
        'res = fn.call(' + ['self'].concat(args.slice(0, index)).concat('cb').join(',') + ');' +
        'break;'
      );
    }).join(''),
    'default:',
    'args[argLength] = cb;',
    'res = fn.apply(self, args);',
    '}',
    
    'if (res &&',
    '(typeof res === "object" || typeof res === "function") &&',
    'typeof res.then === "function"',
    ') {rs(res);}',
    '});',
    '};'
  ].join('');

  return Function(
    ['Promise', 'fn'],
    body
  )(Promise, fn);
}

Promise.nodeify = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    var callback =
      typeof args[args.length - 1] === 'function' ? args.pop() : null;
    var ctx = this;
    try {
      return fn.apply(this, arguments).nodeify(callback, ctx);
    } catch (ex) {
      if (callback === null || typeof callback == 'undefined') {
        return new Promise(function (resolve, reject) {
          reject(ex);
        });
      } else {
        asap(function () {
          callback.call(ctx, ex);
        })
      }
    }
  }
}

Promise.prototype.nodeify = function (callback, ctx) {
  if (typeof callback != 'function') return this;

  this.then(function (value) {
    asap(function () {
      callback.call(ctx, null, value);
    });
  }, function (err) {
    asap(function () {
      callback.call(ctx, err);
    });
  });
}

},{"./core.js":13,"asap":20}],19:[function(require,module,exports){
'use strict';

var Promise = require('./core.js');

module.exports = Promise;
Promise.enableSynchronous = function () {
  Promise.prototype.isPending = function() {
    return this.getState() == 0;
  };

  Promise.prototype.isFulfilled = function() {
    return this.getState() == 1;
  };

  Promise.prototype.isRejected = function() {
    return this.getState() == 2;
  };

  Promise.prototype.getValue = function () {
    if (this._81 === 3) {
      return this._65.getValue();
    }

    if (!this.isFulfilled()) {
      throw new Error('Cannot get a value of an unfulfilled promise.');
    }

    return this._65;
  };

  Promise.prototype.getReason = function () {
    if (this._81 === 3) {
      return this._65.getReason();
    }

    if (!this.isRejected()) {
      throw new Error('Cannot get a rejection reason of a non-rejected promise.');
    }

    return this._65;
  };

  Promise.prototype.getState = function () {
    if (this._81 === 3) {
      return this._65.getState();
    }
    if (this._81 === -1 || this._81 === -2) {
      return 0;
    }

    return this._81;
  };
};

Promise.disableSynchronous = function() {
  Promise.prototype.isPending = undefined;
  Promise.prototype.isFulfilled = undefined;
  Promise.prototype.isRejected = undefined;
  Promise.prototype.getValue = undefined;
  Promise.prototype.getReason = undefined;
  Promise.prototype.getState = undefined;
};

},{"./core.js":13}],20:[function(require,module,exports){
"use strict";

// rawAsap provides everything we need except exception management.
var rawAsap = require("./raw");
// RawTasks are recycled to reduce GC churn.
var freeTasks = [];
// We queue errors to ensure they are thrown in right order (FIFO).
// Array-as-queue is good enough here, since we are just dealing with exceptions.
var pendingErrors = [];
var requestErrorThrow = rawAsap.makeRequestCallFromTimer(throwFirstError);

function throwFirstError() {
    if (pendingErrors.length) {
        throw pendingErrors.shift();
    }
}

/**
 * Calls a task as soon as possible after returning, in its own event, with priority
 * over other events like animation, reflow, and repaint. An error thrown from an
 * event will not interrupt, nor even substantially slow down the processing of
 * other events, but will be rather postponed to a lower priority event.
 * @param {{call}} task A callable object, typically a function that takes no
 * arguments.
 */
module.exports = asap;
function asap(task) {
    var rawTask;
    if (freeTasks.length) {
        rawTask = freeTasks.pop();
    } else {
        rawTask = new RawTask();
    }
    rawTask.task = task;
    rawAsap(rawTask);
}

// We wrap tasks with recyclable task objects.  A task object implements
// `call`, just like a function.
function RawTask() {
    this.task = null;
}

// The sole purpose of wrapping the task is to catch the exception and recycle
// the task object after its single use.
RawTask.prototype.call = function () {
    try {
        this.task.call();
    } catch (error) {
        if (asap.onerror) {
            // This hook exists purely for testing purposes.
            // Its name will be periodically randomized to break any code that
            // depends on its existence.
            asap.onerror(error);
        } else {
            // In a web browser, exceptions are not fatal. However, to avoid
            // slowing down the queue of pending tasks, we rethrow the error in a
            // lower priority turn.
            pendingErrors.push(error);
            requestErrorThrow();
        }
    } finally {
        this.task = null;
        freeTasks[freeTasks.length] = this;
    }
};

},{"./raw":21}],21:[function(require,module,exports){
(function (global){
"use strict";

// Use the fastest means possible to execute a task in its own turn, with
// priority over other events including IO, animation, reflow, and redraw
// events in browsers.
//
// An exception thrown by a task will permanently interrupt the processing of
// subsequent tasks. The higher level `asap` function ensures that if an
// exception is thrown by a task, that the task queue will continue flushing as
// soon as possible, but if you use `rawAsap` directly, you are responsible to
// either ensure that no exceptions are thrown from your task, or to manually
// call `rawAsap.requestFlush` if an exception is thrown.
module.exports = rawAsap;
function rawAsap(task) {
    if (!queue.length) {
        requestFlush();
        flushing = true;
    }
    // Equivalent to push, but avoids a function call.
    queue[queue.length] = task;
}

var queue = [];
// Once a flush has been requested, no further calls to `requestFlush` are
// necessary until the next `flush` completes.
var flushing = false;
// `requestFlush` is an implementation-specific method that attempts to kick
// off a `flush` event as quickly as possible. `flush` will attempt to exhaust
// the event queue before yielding to the browser's own event loop.
var requestFlush;
// The position of the next task to execute in the task queue. This is
// preserved between calls to `flush` so that it can be resumed if
// a task throws an exception.
var index = 0;
// If a task schedules additional tasks recursively, the task queue can grow
// unbounded. To prevent memory exhaustion, the task queue will periodically
// truncate already-completed tasks.
var capacity = 1024;

// The flush function processes all tasks that have been scheduled with
// `rawAsap` unless and until one of those tasks throws an exception.
// If a task throws an exception, `flush` ensures that its state will remain
// consistent and will resume where it left off when called again.
// However, `flush` does not make any arrangements to be called again if an
// exception is thrown.
function flush() {
    while (index < queue.length) {
        var currentIndex = index;
        // Advance the index before calling the task. This ensures that we will
        // begin flushing on the next task the task throws an error.
        index = index + 1;
        queue[currentIndex].call();
        // Prevent leaking memory for long chains of recursive calls to `asap`.
        // If we call `asap` within tasks scheduled by `asap`, the queue will
        // grow, but to avoid an O(n) walk for every task we execute, we don't
        // shift tasks off the queue after they have been executed.
        // Instead, we periodically shift 1024 tasks off the queue.
        if (index > capacity) {
            // Manually shift all values starting at the index back to the
            // beginning of the queue.
            for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
                queue[scan] = queue[scan + index];
            }
            queue.length -= index;
            index = 0;
        }
    }
    queue.length = 0;
    index = 0;
    flushing = false;
}

// `requestFlush` is implemented using a strategy based on data collected from
// every available SauceLabs Selenium web driver worker at time of writing.
// https://docs.google.com/spreadsheets/d/1mG-5UYGup5qxGdEMWkhP6BWCz053NUb2E1QoUTU16uA/edit#gid=783724593

// Safari 6 and 6.1 for desktop, iPad, and iPhone are the only browsers that
// have WebKitMutationObserver but not un-prefixed MutationObserver.
// Must use `global` instead of `window` to work in both frames and web
// workers. `global` is a provision of Browserify, Mr, Mrs, or Mop.
var BrowserMutationObserver = global.MutationObserver || global.WebKitMutationObserver;

// MutationObservers are desirable because they have high priority and work
// reliably everywhere they are implemented.
// They are implemented in all modern browsers.
//
// - Android 4-4.3
// - Chrome 26-34
// - Firefox 14-29
// - Internet Explorer 11
// - iPad Safari 6-7.1
// - iPhone Safari 7-7.1
// - Safari 6-7
if (typeof BrowserMutationObserver === "function") {
    requestFlush = makeRequestCallFromMutationObserver(flush);

// MessageChannels are desirable because they give direct access to the HTML
// task queue, are implemented in Internet Explorer 10, Safari 5.0-1, and Opera
// 11-12, and in web workers in many engines.
// Although message channels yield to any queued rendering and IO tasks, they
// would be better than imposing the 4ms delay of timers.
// However, they do not work reliably in Internet Explorer or Safari.

// Internet Explorer 10 is the only browser that has setImmediate but does
// not have MutationObservers.
// Although setImmediate yields to the browser's renderer, it would be
// preferrable to falling back to setTimeout since it does not have
// the minimum 4ms penalty.
// Unfortunately there appears to be a bug in Internet Explorer 10 Mobile (and
// Desktop to a lesser extent) that renders both setImmediate and
// MessageChannel useless for the purposes of ASAP.
// https://github.com/kriskowal/q/issues/396

// Timers are implemented universally.
// We fall back to timers in workers in most engines, and in foreground
// contexts in the following browsers.
// However, note that even this simple case requires nuances to operate in a
// broad spectrum of browsers.
//
// - Firefox 3-13
// - Internet Explorer 6-9
// - iPad Safari 4.3
// - Lynx 2.8.7
} else {
    requestFlush = makeRequestCallFromTimer(flush);
}

// `requestFlush` requests that the high priority event queue be flushed as
// soon as possible.
// This is useful to prevent an error thrown in a task from stalling the event
// queue if the exception handled by Node.js’s
// `process.on("uncaughtException")` or by a domain.
rawAsap.requestFlush = requestFlush;

// To request a high priority event, we induce a mutation observer by toggling
// the text of a text node between "1" and "-1".
function makeRequestCallFromMutationObserver(callback) {
    var toggle = 1;
    var observer = new BrowserMutationObserver(callback);
    var node = document.createTextNode("");
    observer.observe(node, {characterData: true});
    return function requestCall() {
        toggle = -toggle;
        node.data = toggle;
    };
}

// The message channel technique was discovered by Malte Ubl and was the
// original foundation for this library.
// http://www.nonblocking.io/2011/06/windownexttick.html

// Safari 6.0.5 (at least) intermittently fails to create message ports on a
// page's first load. Thankfully, this version of Safari supports
// MutationObservers, so we don't need to fall back in that case.

// function makeRequestCallFromMessageChannel(callback) {
//     var channel = new MessageChannel();
//     channel.port1.onmessage = callback;
//     return function requestCall() {
//         channel.port2.postMessage(0);
//     };
// }

// For reasons explained above, we are also unable to use `setImmediate`
// under any circumstances.
// Even if we were, there is another bug in Internet Explorer 10.
// It is not sufficient to assign `setImmediate` to `requestFlush` because
// `setImmediate` must be called *by name* and therefore must be wrapped in a
// closure.
// Never forget.

// function makeRequestCallFromSetImmediate(callback) {
//     return function requestCall() {
//         setImmediate(callback);
//     };
// }

// Safari 6.0 has a problem where timers will get lost while the user is
// scrolling. This problem does not impact ASAP because Safari 6.0 supports
// mutation observers, so that implementation is used instead.
// However, if we ever elect to use timers in Safari, the prevalent work-around
// is to add a scroll event listener that calls for a flush.

// `setTimeout` does not call the passed callback if the delay is less than
// approximately 7 in web workers in Firefox 8 through 18, and sometimes not
// even then.

function makeRequestCallFromTimer(callback) {
    return function requestCall() {
        // We dispatch a timeout with a specified delay of 0 for engines that
        // can reliably accommodate that request. This will usually be snapped
        // to a 4 milisecond delay, but once we're flushing, there's no delay
        // between events.
        var timeoutHandle = setTimeout(handleTimer, 0);
        // However, since this timer gets frequently dropped in Firefox
        // workers, we enlist an interval handle that will try to fire
        // an event 20 times per second until it succeeds.
        var intervalHandle = setInterval(handleTimer, 50);

        function handleTimer() {
            // Whichever timer succeeds will cancel both timers and
            // execute the callback.
            clearTimeout(timeoutHandle);
            clearInterval(intervalHandle);
            callback();
        }
    };
}

// This is for `asap.js` only.
// Its name will be periodically randomized to break any code that depends on
// its existence.
rawAsap.makeRequestCallFromTimer = makeRequestCallFromTimer;

// ASAP was originally a nextTick shim included in Q. This was factored out
// into this ASAP package. It was later adapted to RSVP which made further
// amendments. These decisions, particularly to marginalize MessageChannel and
// to capture the MutationObserver implementation in a closure, were integrated
// back into ASAP proper.
// https://github.com/tildeio/rsvp.js/blob/cddf7232546a9cf858524b75cde6f9edf72620a7/lib/rsvp/asap.js

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],22:[function(require,module,exports){
function E () {
	// Keep this empty so it's easier to inherit from
  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
}

E.prototype = {
	on: function (name, callback, ctx) {
    var e = this.e || (this.e = {});

    (e[name] || (e[name] = [])).push({
      fn: callback,
      ctx: ctx
    });

    return this;
  },

  once: function (name, callback, ctx) {
    var self = this;
    function listener () {
      self.off(name, listener);
      callback.apply(ctx, arguments);
    };

    listener._ = callback
    return this.on(name, listener, ctx);
  },

  emit: function (name) {
    var data = [].slice.call(arguments, 1);
    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
    var i = 0;
    var len = evtArr.length;

    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }

    return this;
  },

  off: function (name, callback) {
    var e = this.e || (this.e = {});
    var evts = e[name];
    var liveEvents = [];

    if (evts && callback) {
      for (var i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback)
          liveEvents.push(evts[i]);
      }
    }

    // Remove event from queue to prevent memory leak
    // Suggested by https://github.com/lazd
    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

    (liveEvents.length)
      ? e[name] = liveEvents
      : delete e[name];

    return this;
  }
};

module.exports = E;

},{}],23:[function(require,module,exports){
module.exports = {
  "default_locale":"en",
  "languages":[
    {
      "locale":"en",
      "name":"English",
      "english_name":"English",
      "native_name":"English",
      "flag_url":"https://s3-us-west-1.amazonaws.com/trex-snapshots/flags/default/languages/16/en.png"
    }
  ],
  "threshold":1,
  "css":".tml_not_translated { border-bottom: 1px dotted red; } .tml_translated { border-bottom: 1px dotted green; } .tml_fallback { border-bottom: 1px dotted #e90; } .tml_pending { border-bottom: 1px dotted #e90; } .tml_locked { border-bottom: 1px dotted blue; } .tml_language_case { padding:0px 2px; border: 1px dotted blue; border-radius: 2px; } .tml_token { background: #eee; padding:0px 2px; border: 1px dotted #ccc; border-radius: 2px; color: black; }"
};
},{}],24:[function(require,module,exports){
module.exports = {

  enabled: true,
  default_locale: "en",
  source_separator: "@:@",
  delayed_flush: false,
  debug: false,

  default_tokens: {
    html : {
      data : {
        ndash  :  "&ndash;",  
        mdash  :  "&mdash;",  
        iexcl  :  "&iexcl;",  
        iquest :  "&iquest;", 
        quot   :  "&quot;",   
        ldquo  :  "&ldquo;",  
        rdquo  :  "&rdquo;",  
        lsquo  :  "&lsquo;",  
        rsquo  :  "&rsquo;",  
        laquo  :  "&laquo;",  
        raquo  :  "&raquo;",  
        nbsp   :  "&nbsp;",   
        lsaquo :  "&lsaquo;", 
        rsaquo :  "&rsaquo;", 
        br     :  "<br/>",    
        lbrace :  "{",
        rbrace :  "}",
        trade  :  "&trade;"
      },
      decoration : {
        strong :  "<strong>{$0}</strong>",
        bold   :  "<strong>{$0}</strong>",
        b      :  "<strong>{$0}</strong>",
        em     :  "<em>{$0}</em>",
        italic :  "<i>{$0}</i>",
        i      :  "<i>{$0}</i>",
        link   :  "<a href='{$href}' class='{$class}' style='{$style}'>{$0}</a>",
        br     :  "<br>{$0}",
        strike :  "<strike>{$0}</strike>",
        div    :  "<div id='{$id}' class='{$class}' style='{$style}'>{$0}</div>",
        span   :  "<span id='{$id}' class='{$class}' style='{$style}'>{$0}</span>",
        h1     :  "<h1>{$0}</h1>",
        h2     :  "<h2>{$0}</h2>",
        h3     :  "<h3>{$0}</h3>"
      }
    },
    text : {
      data : {
        ndash  :  "–",
        mdash  :  "-",
        iexcl  :  "¡",
        iquest :  "¿",
        quot   :  "\"",
        ldquo  :  "“",
        rdquo  :  "”",
        lsquo  :  "‘",
        rsquo  :  "’",
        laquo  :  "«",
        raquo  :  "»",
        nbsp   :  " ",
        lsaquo :  "‹",
        rsaquo :  "›",
        br     :  "\n",
        lbrace :  "{",
        rbrace :  "}",
        trade  :  "™"
      },
      decoration : {
        strong :  "{$0}",
        bold   :  "{$0}",
        b      :  "{$0}",
        em     :  "{$0}",
        italic :  "{$0}",
        i      :  "{$0}",
        link   :  "{$0}{$1}",
        br     :  "\n{$0}",
        strike :  "{$0}",
        div    :  "{$0}",
        span   :  "{$0}",
        h1     :  "{$0}",
        h2     :  "{$0}",
        h3     :  "{$0}"
      }
    }
  },

  translator_options: {
    debug: false,
    debug_format_html: "<span style='font-size:20px;color:red;'>{<\/span> {$0} <span style='font-size:20px;color:red;'>}<\/span>",
    debug_format: "{{{{$0}}}}",
    split_sentences: true,
    decoration_token_format: "[]",
    ignore_elements: ['.notranslate'],
    nodes: {
      ignored:    [],
      scripts:    ["iframe", "script", "noscript", "style", "audio", "video", "map", "object", "track", "embed", "svg", "ruby", "pre"],
      inline:     ["a", "span", "i", "b", "img", "strong", "s", "em", "u", "sub", "sup", "var", "code"],
      short:      ["i", "b"],
      splitters:  ["br", "hr"]
    },
    attributes: {
      labels: ["title", "alt"]
    },
    name_mapping: {
      b: "bold",
      i: "italic",
      a: "link",
      img: "picture"
    },
    data_tokens: {
      special: {
        enable: true,
        regex: /(&[^;]*;)/g
      },
      date: {
        enabled: true,
        formats: [
          [/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+,\s+\d+/g, "{month} {day}, {year}"],
          [/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d+,\s+\d+/g, "{month} {day}, {year}"],
          [/\d+\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec),\s+\d+/g, "{day} {month}, {year}"],
          [/\d+\s+(January|February|March|April|May|June|July|August|September|October|November|December),\s+\d+/g, "{day} {month}, {year}"]
        ],
        name: 'date'
      },
      rules: [
        {enabled: true, name: 'phone',    regex: /(\d{1}-)?\d{3}-\d{3}-\d{4}|\d?\(\d{3}\)\s*\d{3}-\d{4}|(\d.)?\d{3}.\d{3}.\d{4}/g},
        {enabled: true, name: 'email',    regex: /[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|io|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?/g},
        {enabled: true, name: 'price',    regex: /\$\d*(,\d*)*(\.\d*)?/g},
        {enabled: true, name: 'fraction', regex: /\d+\/\d+/g},
        {enabled: true, name: 'num',      regex: /\b\d+(,\d*)*(\.\d*)?%?\b/g}
      ]
    }
  },

  context_rules: {
    number: {
      variables: {}
    },
    gender: {
      variables: {
        "@gender": "gender"
      }
    },
    genders: {
      variables: {
        "@genders": function(list) {
          var genders = [];
          list.forEach(function(obj) {
            genders.push(obj.gender);
          });
          return genders;
        }
      }
    },
    date: {
      variables: {}
    },
    time: {
      variables: {}
    }
  }

};
},{}],25:[function(require,module,exports){
module.exports = {
  "locale": "en",
  "english_name": "English",
  "flag_url": "https://s3-us-west-1.amazonaws.com/trex-snapshots/flags/default/languages/16/en.png",
  "contexts": {
    "list": {
      "rules": {
        "other": {
          "description": "{token} contains at least 2 elements"
        },
        "one": {
          "description": "{token} contains 1 element",
          "conditions": "(= 1 @count)",
          "conditions_expression": [
            "=",
            1,
            "@count"
          ]
        }
      },
      "keys": [
        "one",
        "other"
      ],
      "default_key": "other",
      "token_expression": "/.*(items|list)(\\d)*$/",
      "variables": [
        "@count"
      ],
      "token_mapping": [
        "unsupported",
        {
          "one": "{$0}",
          "other": "{$1}"
        }
      ]
    },
    "date": {
      "rules": {
        "future": {
          "description": "{token} is in the past",
          "conditions": "(< @date (today))",
          "conditions_expression": [
            "<",
            "@date",
            [
              "today"
            ]
          ]
        },
        "present": {
          "description": "{token} is in the present",
          "conditions": "(= @date (today))",
          "conditions_expression": [
            "=",
            "@date",
            [
              "today"
            ]
          ]
        },
        "past": {
          "description": "{token} is in the future",
          "conditions": "(> @date (today))",
          "conditions_expression": [
            ">",
            "@date",
            [
              "today"
            ]
          ]
        }
      },
      "keys": [
        "past",
        "present",
        "future"
      ],
      "default_key": "present",
      "token_expression": "/.*(date|time)(\\d)*$/",
      "variables": [
        "@date"
      ],
      "token_mapping": [
        "unsupported",
        "unsupported",
        {
          "past": "{$0}",
          "present": "{$1}",
          "future": "{$2}"
        }
      ]
    },
    "number": {
      "rules": {
        "one": {
          "description": "{token} is 1",
          "examples": "1",
          "conditions": "(= @n 1)",
          "conditions_expression": [
            "=",
            "@n",
            1
          ]
        },
        "other": {
          "description": "{token} is not 1",
          "examples": "0, 2-999; 1.2, 2.07..."
        }
      },
      "keys": [
        "one",
        "other"
      ],
      "default_key": "other",
      "token_expression": "/.*(count|num|minutes|seconds|hours|sum|total)(\\d)*$/",
      "variables": [
        "@n"
      ],
      "token_mapping": [
        {
          "one": "{$0}",
          "other": "{$0::plural}"
        },
        {
          "one": "{$0}",
          "other": "{$1}"
        }
      ]
    },
    "gender": {
      "rules": {
        "female": {
          "description": "{token} is a female",
          "conditions": "(= 'female' @gender)",
          "conditions_expression": [
            "=",
            "female",
            "@gender"
          ]
        },
        "male": {
          "description": "{token} is a male",
          "conditions": "(= 'male' @gender)",
          "conditions_expression": [
            "=",
            "male",
            "@gender"
          ]
        },
        "other": {
          "description": "{token}'s gender is unknown"
        }
      },
      "keys": [
        "male",
        "female",
        "other"
      ],
      "default_key": "other",
      "token_expression": "/.*(user|translator|profile|actor|target)(\\d)*$/",
      "variables": [
        "@gender"
      ],
      "token_mapping": [
        {
          "other": "{$0}"
        },
        {
          "male": "{$0}",
          "female": "{$1}",
          "other": "{$0}/{$1}"
        },
        {
          "male": "{$0}",
          "female": "{$1}",
          "other": "{$2}"
        }
      ]
    },
    "genders": {
      "rules": {
        "female": {
          "description": "{token} contains 1 female",
          "conditions": "(&& (= 1 (count @genders)) (all @genders 'female'))",
          "conditions_expression": [
            "&&",
            [
              "=",
              1,
              [
                "count",
                "@genders"
              ]
            ],
            [
              "all",
              "@genders",
              "female"
            ]
          ]
        },
        "male": {
          "description": "{token} contains 1 male",
          "conditions": "(&& (= 1 (count @genders)) (all @genders 'male'))",
          "conditions_expression": [
            "&&",
            [
              "=",
              1,
              [
                "count",
                "@genders"
              ]
            ],
            [
              "all",
              "@genders",
              "male"
            ]
          ]
        },
        "other": {
          "description": "{token} contains at least 2 people"
        },
        "unknown": {
          "description": "{token} contains 1 person with unknown gender",
          "conditions": "(&& (= 1 (count @genders)) (all @genders 'unknown'))",
          "conditions_expression": [
            "&&",
            [
              "=",
              1,
              [
                "count",
                "@genders"
              ]
            ],
            [
              "all",
              "@genders",
              "unknown"
            ]
          ]
        }
      },
      "keys": [
        "male",
        "female",
        "unknown",
        "other"
      ],
      "default_key": "other",
      "token_expression": "/.*(users|profiles|actors|targets)(\\d)*$/",
      "variables": [
        "@genders"
      ],
      "token_mapping": [
        {
          "male": "{$0}",
          "female": "{$0}",
          "unknown": "{$0}",
          "other": "{$0}"
        },
        {
          "male": "{$0}",
          "female": "{$0}",
          "unknown": "{$0}",
          "other": "{$1}"
        },
        {
          "male": "{$0}",
          "female": "{$1}",
          "unknown": "{$0}/{$1}",
          "other": "{$2}"
        },
        {
          "male": "{$0}",
          "female": "{$1}",
          "unknown": "{$2}",
          "other": "{$3}"
        }
      ]
    }
  },
  "cases": {
    "times": {
      "rules": [
        {
          "description": "replace '1' with 'once'",
          "conditions": "(= 1 @value)",
          "conditions_expression": [
            "=",
            1,
            "@value"
          ],
          "operations": "(replace '1' 'once' @value)",
          "operations_expression": [
            "replace",
            "1",
            "once",
            "@value"
          ]
        },
        {
          "description": "replace '2' with 'twice'",
          "conditions": "(= 2 @value)",
          "conditions_expression": [
            "=",
            2,
            "@value"
          ],
          "operations": "(replace '2' 'twice' @value)",
          "operations_expression": [
            "replace",
            "2",
            "twice",
            "@value"
          ]
        },
        {
          "description": "in all other cases, append x times",
          "conditions": "(true)",
          "conditions_expression": [
            "true"
          ],
          "operations": "(append ' times' @value)",
          "operations_expression": [
            "append",
            " times",
            "@value"
          ]
        }
      ],
      "latin_name": "Iteration",
      "description": "The iteration form of the cardinal numbers",
      "application": "phrase"
    },
    "plural": {
      "rules": [
        {
          "description": "Uncountable word",
          "conditions": "(in 'sheep,fish,series,species,money,rice,information,equipment' @value)",
          "conditions_expression": [
            "in",
            "sheep,fish,series,species,money,rice,information,equipment",
            "@value"
          ],
          "operations": "@value",
          "operations_expression": "@value"
        },
        {
          "description": "Irregular word",
          "conditions": "(= 'move' @value)",
          "conditions_expression": [
            "=",
            "move",
            "@value"
          ],
          "operations": "(quote 'moves')",
          "operations_expression": [
            "quote",
            "moves"
          ]
        },
        {
          "description": "Irregular word",
          "conditions": "(= 'sex' @value)",
          "conditions_expression": [
            "=",
            "sex",
            "@value"
          ],
          "operations": "(quote 'sexes')",
          "operations_expression": [
            "quote",
            "sexes"
          ]
        },
        {
          "description": "Irregular word",
          "conditions": "(= 'child' @value)",
          "conditions_expression": [
            "=",
            "child",
            "@value"
          ],
          "operations": "(quote 'children')",
          "operations_expression": [
            "quote",
            "children"
          ]
        },
        {
          "description": "Irregular word",
          "conditions": "(= 'person' @value)",
          "conditions_expression": [
            "=",
            "person",
            "@value"
          ],
          "operations": "(quote 'people')",
          "operations_expression": [
            "quote",
            "people"
          ]
        },
        {
          "conditions": "(match '/(quiz)$/i' @value)",
          "conditions_expression": [
            "match",
            "/(quiz)$/i",
            "@value"
          ],
          "operations": "(replace '/(quiz)$/i' '$1zes' @value)",
          "operations_expression": [
            "replace",
            "/(quiz)$/i",
            "$1zes",
            "@value"
          ]
        },
        {
          "conditions": "(match '/^(ox)$/i' @value)",
          "conditions_expression": [
            "match",
            "/^(ox)$/i",
            "@value"
          ],
          "operations": "(replace '/^(ox)$/i' '$1en' @value)",
          "operations_expression": [
            "replace",
            "/^(ox)$/i",
            "$1en",
            "@value"
          ]
        },
        {
          "conditions": "(match '/([m|l])ouse$/i' @value)",
          "conditions_expression": [
            "match",
            "/([m|l])ouse$/i",
            "@value"
          ],
          "operations": "(replace '/([m|l])ouse$/i' '$1ice' @value)",
          "operations_expression": [
            "replace",
            "/([m|l])ouse$/i",
            "$1ice",
            "@value"
          ]
        },
        {
          "conditions": "(match '/(matr|vert|ind)ix|ex$/i' @value)",
          "conditions_expression": [
            "match",
            "/(matr|vert|ind)ix|ex$/i",
            "@value"
          ],
          "operations": "(replace '/(matr|vert|ind)ix|ex$/i' '$1ices' @value)",
          "operations_expression": [
            "replace",
            "/(matr|vert|ind)ix|ex$/i",
            "$1ices",
            "@value"
          ]
        },
        {
          "conditions": "(match '/(x|ch|ss|sh)$/i' @value)",
          "conditions_expression": [
            "match",
            "/(x|ch|ss|sh)$/i",
            "@value"
          ],
          "operations": "(replace '/(x|ch|ss|sh)$/i' '$1es' @value)",
          "operations_expression": [
            "replace",
            "/(x|ch|ss|sh)$/i",
            "$1es",
            "@value"
          ]
        },
        {
          "conditions": "(match '/([^aeiouy]|qu)y$/i' @value)",
          "conditions_expression": [
            "match",
            "/([^aeiouy]|qu)y$/i",
            "@value"
          ],
          "operations": "(replace '/([^aeiouy]|qu)y$/i' '$1ies' @value)",
          "operations_expression": [
            "replace",
            "/([^aeiouy]|qu)y$/i",
            "$1ies",
            "@value"
          ]
        },
        {
          "conditions": "(match '/([^aeiouy]|qu)ies$/i' @value)",
          "conditions_expression": [
            "match",
            "/([^aeiouy]|qu)ies$/i",
            "@value"
          ],
          "operations": "(replace '/([^aeiouy]|qu)ies$/i' '$1y' @value)",
          "operations_expression": [
            "replace",
            "/([^aeiouy]|qu)ies$/i",
            "$1y",
            "@value"
          ]
        },
        {
          "conditions": "(match '/(hive)$/i' @value)",
          "conditions_expression": [
            "match",
            "/(hive)$/i",
            "@value"
          ],
          "operations": "(replace '/(hive)$/i' '$1s' @value)",
          "operations_expression": [
            "replace",
            "/(hive)$/i",
            "$1s",
            "@value"
          ]
        },
        {
          "conditions": "(match '/(?:([^f])fe|([lr])f)$/i' @value)",
          "conditions_expression": [
            "match",
            "/(?:([^f])fe|([lr])f)$/i",
            "@value"
          ],
          "operations": "(replace '/(?:([^f])fe|([lr])f)$/i' '$1$2ves' @value)",
          "operations_expression": [
            "replace",
            "/(?:([^f])fe|([lr])f)$/i",
            "$1$2ves",
            "@value"
          ]
        },
        {
          "conditions": "(match '/sis$/i' @value)",
          "conditions_expression": [
            "match",
            "/sis$/i",
            "@value"
          ],
          "operations": "(replace '/sis$/i' 'ses' @value)",
          "operations_expression": [
            "replace",
            "/sis$/i",
            "ses",
            "@value"
          ]
        },
        {
          "conditions": "(match '/([ti])um$/i' @value)",
          "conditions_expression": [
            "match",
            "/([ti])um$/i",
            "@value"
          ],
          "operations": "(replace '/([ti])um$/i' '$1a' @value)",
          "operations_expression": [
            "replace",
            "/([ti])um$/i",
            "$1a",
            "@value"
          ]
        },
        {
          "conditions": "(match '/(buffal|tomat|potat)o$/i' @value)",
          "conditions_expression": [
            "match",
            "/(buffal|tomat|potat)o$/i",
            "@value"
          ],
          "operations": "(replace '/(buffal|tomat|potat)o$/i' '$1oes' @value)",
          "operations_expression": [
            "replace",
            "/(buffal|tomat|potat)o$/i",
            "$1oes",
            "@value"
          ]
        },
        {
          "conditions": "(match '/(bu)s$/i' @value)",
          "conditions_expression": [
            "match",
            "/(bu)s$/i",
            "@value"
          ],
          "operations": "(replace '/(bu)s$/i' '$1ses' @value)",
          "operations_expression": [
            "replace",
            "/(bu)s$/i",
            "$1ses",
            "@value"
          ]
        },
        {
          "conditions": "(match '/(alias|status)$/i' @value)",
          "conditions_expression": [
            "match",
            "/(alias|status)$/i",
            "@value"
          ],
          "operations": "(replace '/(alias|status)$/i' '$1es' @value)",
          "operations_expression": [
            "replace",
            "/(alias|status)$/i",
            "$1es",
            "@value"
          ]
        },
        {
          "conditions": "(match '/(octop)us$/i' @value)",
          "conditions_expression": [
            "match",
            "/(octop)us$/i",
            "@value"
          ],
          "operations": "(replace '/(octop)us$/i' '$1i' @value)",
          "operations_expression": [
            "replace",
            "/(octop)us$/i",
            "$1i",
            "@value"
          ]
        },
        {
          "conditions": "(match '/(ax|test)is$/i' @value)",
          "conditions_expression": [
            "match",
            "/(ax|test)is$/i",
            "@value"
          ],
          "operations": "(replace '/(ax|test)is$/i' '$1es' @value)",
          "operations_expression": [
            "replace",
            "/(ax|test)is$/i",
            "$1es",
            "@value"
          ]
        },
        {
          "conditions": "(match '/us$/i' @value)",
          "conditions_expression": [
            "match",
            "/us$/i",
            "@value"
          ],
          "operations": "(replace '/us$/i' '$1es' @value)",
          "operations_expression": [
            "replace",
            "/us$/i",
            "$1es",
            "@value"
          ]
        },
        {
          "conditions": "(match '/s$/i' @value)",
          "conditions_expression": [
            "match",
            "/s$/i",
            "@value"
          ],
          "operations": "(replace '/s$/i' 's' @value)",
          "operations_expression": [
            "replace",
            "/s$/i",
            "s",
            "@value"
          ]
        },
        {
          "conditions": "(match '/$/' @value)",
          "conditions_expression": [
            "match",
            "/$/",
            "@value"
          ],
          "operations": "(replace '/$/' 's' @value)",
          "operations_expression": [
            "replace",
            "/$/",
            "s",
            "@value"
          ]
        }
      ],
      "latin_name": "Plural",
      "description": "Converts singular form to plural",
      "application": "phrase"
    },
    "ordinal": {
      "rules": [
        {
          "description": "replace 1 with 'first'",
          "conditions": "(= 1 @value)",
          "conditions_expression": [
            "=",
            1,
            "@value"
          ],
          "operations": "(replace 1 'first' @value)",
          "operations_expression": [
            "replace",
            1,
            "first",
            "@value"
          ]
        },
        {
          "description": "replace 2 with 'second'",
          "conditions": "(= 2 @value)",
          "conditions_expression": [
            "=",
            2,
            "@value"
          ],
          "operations": "(replace 2 'first' @value)",
          "operations_expression": [
            "replace",
            2,
            "first",
            "@value"
          ]
        },
        {
          "description": "replace 3 with 'third'",
          "conditions": "(= 3 @value)",
          "conditions_expression": [
            "=",
            3,
            "@value"
          ],
          "operations": "(replace 3 'third' @value)",
          "operations_expression": [
            "replace",
            3,
            "third",
            "@value"
          ]
        }
      ],
      "latin_name": "Ordinal",
      "description": "The adjective form of the cardinal numbers",
      "application": "phrase"
    },
    "ord": {
      "rules": [
        {
          "description": "append 'st' if value ends in 1, but not in 11",
          "examples": "1, 21, 31, 41, 101, 121...",
          "conditions": "(&& (match '/1$/' @value) (! (match '/11$/' @value)))",
          "conditions_expression": [
            "&&",
            [
              "match",
              "/1$/",
              "@value"
            ],
            [
              "!",
              [
                "match",
                "/11$/",
                "@value"
              ]
            ]
          ],
          "operations": "(append 'st' @value)",
          "operations_expression": [
            "append",
            "st",
            "@value"
          ]
        },
        {
          "description": "append 'nd' if value ends in 2, but not in 12",
          "examples": "2, 22, 32, 42, 102, 122...",
          "conditions": "(&& (match '/2$/' @value) (! (match '/12$/' @value)))",
          "conditions_expression": [
            "&&",
            [
              "match",
              "/2$/",
              "@value"
            ],
            [
              "!",
              [
                "match",
                "/12$/",
                "@value"
              ]
            ]
          ],
          "operations": "(append 'nd' @value)",
          "operations_expression": [
            "append",
            "nd",
            "@value"
          ]
        },
        {
          "description": "append 'nd' if value ends in 3, but not in 13",
          "examples": "3, 23, 33, 43, 103, 123...",
          "conditions": "(&& (match '/3$/' @value) (! (match '/13$/' @value)))",
          "conditions_expression": [
            "&&",
            [
              "match",
              "/3$/",
              "@value"
            ],
            [
              "!",
              [
                "match",
                "/13$/",
                "@value"
              ]
            ]
          ],
          "operations": "(append 'rd' @value)",
          "operations_expression": [
            "append",
            "rd",
            "@value"
          ]
        },
        {
          "description": "append 'th' in all other cases",
          "examples": "0, 4, 5, 6, 7, 8, 9, 11, 12, 13, 111, 113...",
          "conditions": "(true)",
          "conditions_expression": [
            "true"
          ],
          "operations": "(append 'th' @value)",
          "operations_expression": [
            "append",
            "th",
            "@value"
          ]
        }
      ],
      "latin_name": "Ordinal",
      "description": "The adjective form of the cardinal numbers",
      "application": "phrase"
    },
    "singular": {
      "rules": [
        {
          "description": "Uncountable word",
          "conditions": "(in 'sheep,fish,series,species,money,rice,information,equipment' @value)",
          "conditions_expression": [
            "in",
            "sheep,fish,series,species,money,rice,information,equipment",
            "@value"
          ],
          "operations": "@value",
          "operations_expression": "@value"
        },
        {
          "description": "Irregular word",
          "conditions": "(= 'moves' @value)",
          "conditions_expression": [
            "=",
            "moves",
            "@value"
          ],
          "operations": "(quote 'move')",
          "operations_expression": [
            "quote",
            "move"
          ]
        },
        {
          "description": "Irregular word",
          "conditions": "(= 'sexes' @value)",
          "conditions_expression": [
            "=",
            "sexes",
            "@value"
          ],
          "operations": "(quote 'sex')",
          "operations_expression": [
            "quote",
            "sex"
          ]
        },
        {
          "description": "Irregular word",
          "conditions": "(= 'children' @value)",
          "conditions_expression": [
            "=",
            "children",
            "@value"
          ],
          "operations": "(quote 'child')",
          "operations_expression": [
            "quote",
            "child"
          ]
        },
        {
          "description": "Irregular word",
          "conditions": "(= 'people' @value)",
          "conditions_expression": [
            "=",
            "people",
            "@value"
          ],
          "operations": "(quote 'person')",
          "operations_expression": [
            "quote",
            "person"
          ]
        },
        {
          "conditions": "(match '/(n)ews$/i' @value)",
          "conditions_expression": [
            "match",
            "/(n)ews$/i",
            "@value"
          ],
          "operations": "(replace '/(n)ews$/i' '$1ews' @value)",
          "operations_expression": [
            "replace",
            "/(n)ews$/i",
            "$1ews",
            "@value"
          ]
        },
        {
          "conditions": "(match '/([ti])a$/i' @value)",
          "conditions_expression": [
            "match",
            "/([ti])a$/i",
            "@value"
          ],
          "operations": "(replace '/([ti])a$/i' '$1um' @value)",
          "operations_expression": [
            "replace",
            "/([ti])a$/i",
            "$1um",
            "@value"
          ]
        },
        {
          "conditions": "(match '/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i' @value)",
          "conditions_expression": [
            "match",
            "/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i",
            "@value"
          ],
          "operations": "(replace '/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i' '$1$2sis' @value)",
          "operations_expression": [
            "replace",
            "/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i",
            "$1$2sis",
            "@value"
          ]
        },
        {
          "conditions": "(match '/(^analy)ses$/i' @value)",
          "conditions_expression": [
            "match",
            "/(^analy)ses$/i",
            "@value"
          ],
          "operations": "(replace '/(^analy)ses$/i' '$1sis' @value)",
          "operations_expression": [
            "replace",
            "/(^analy)ses$/i",
            "$1sis",
            "@value"
          ]
        },
        {
          "conditions": "(match '/([^f])ves$/i' @value)",
          "conditions_expression": [
            "match",
            "/([^f])ves$/i",
            "@value"
          ],
          "operations": "(replace '/([^f])ves$/i' '$1fe' @value)",
          "operations_expression": [
            "replace",
            "/([^f])ves$/i",
            "$1fe",
            "@value"
          ]
        },
        {
          "conditions": "(match '/(hive)s$/i' @value)",
          "conditions_expression": [
            "match",
            "/(hive)s$/i",
            "@value"
          ],
          "operations": "(replace '/(hive)s$/i' '$1' @value)",
          "operations_expression": [
            "replace",
            "/(hive)s$/i",
            "$1",
            "@value"
          ]
        },
        {
          "conditions": "(match '/(tive)s$/i' @value)",
          "conditions_expression": [
            "match",
            "/(tive)s$/i",
            "@value"
          ],
          "operations": "(replace '/(tive)s$/i' '$1' @value)",
          "operations_expression": [
            "replace",
            "/(tive)s$/i",
            "$1",
            "@value"
          ]
        },
        {
          "conditions": "(match '/([lr])ves$/i' @value)",
          "conditions_expression": [
            "match",
            "/([lr])ves$/i",
            "@value"
          ],
          "operations": "(replace '/([lr])ves$/i' '$1f' @value)",
          "operations_expression": [
            "replace",
            "/([lr])ves$/i",
            "$1f",
            "@value"
          ]
        },
        {
          "conditions": "(match '/([^aeiouy]|qu)ies$/i' @value)",
          "conditions_expression": [
            "match",
            "/([^aeiouy]|qu)ies$/i",
            "@value"
          ],
          "operations": "(replace '/([^aeiouy]|qu)ies$/i' '$1y' @value)",
          "operations_expression": [
            "replace",
            "/([^aeiouy]|qu)ies$/i",
            "$1y",
            "@value"
          ]
        },
        {
          "conditions": "(match '/(s)eries$/i' @value)",
          "conditions_expression": [
            "match",
            "/(s)eries$/i",
            "@value"
          ],
          "operations": "(replace '/(s)eries$/i' '$1eries' @value)",
          "operations_expression": [
            "replace",
            "/(s)eries$/i",
            "$1eries",
            "@value"
          ]
        },
        {
          "conditions": "(match '/(m)ovies$/i' @value)",
          "conditions_expression": [
            "match",
            "/(m)ovies$/i",
            "@value"
          ],
          "operations": "(replace '/(m)ovies$/i' '$1ovie' @value)",
          "operations_expression": [
            "replace",
            "/(m)ovies$/i",
            "$1ovie",
            "@value"
          ]
        },
        {
          "conditions": "(match '/(x|ch|ss|sh)es$/i' @value)",
          "conditions_expression": [
            "match",
            "/(x|ch|ss|sh)es$/i",
            "@value"
          ],
          "operations": "(replace '/(x|ch|ss|sh)es$/i' '$1' @value)",
          "operations_expression": [
            "replace",
            "/(x|ch|ss|sh)es$/i",
            "$1",
            "@value"
          ]
        },
        {
          "conditions": "(match '/([m|l])ice$/i' @value)",
          "conditions_expression": [
            "match",
            "/([m|l])ice$/i",
            "@value"
          ],
          "operations": "(replace '/([m|l])ice$/i' '$1ouse' @value)",
          "operations_expression": [
            "replace",
            "/([m|l])ice$/i",
            "$1ouse",
            "@value"
          ]
        },
        {
          "conditions": "(match '/(bus)es$/i' @value)",
          "conditions_expression": [
            "match",
            "/(bus)es$/i",
            "@value"
          ],
          "operations": "(replace '/(bus)es$/i' '$1' @value)",
          "operations_expression": [
            "replace",
            "/(bus)es$/i",
            "$1",
            "@value"
          ]
        },
        {
          "conditions": "(match '/(o)es$/i' @value)",
          "conditions_expression": [
            "match",
            "/(o)es$/i",
            "@value"
          ],
          "operations": "(replace '/(o)es$/i' '$1' @value)",
          "operations_expression": [
            "replace",
            "/(o)es$/i",
            "$1",
            "@value"
          ]
        },
        {
          "conditions": "(match '/(shoe)s$/i' @value)",
          "conditions_expression": [
            "match",
            "/(shoe)s$/i",
            "@value"
          ],
          "operations": "(replace '/(shoe)s$/i' '$1' @value)",
          "operations_expression": [
            "replace",
            "/(shoe)s$/i",
            "$1",
            "@value"
          ]
        },
        {
          "conditions": "(match '/(cris|ax|test)es$/i' @value)",
          "conditions_expression": [
            "match",
            "/(cris|ax|test)es$/i",
            "@value"
          ],
          "operations": "(replace '/(cris|ax|test)es$/i' '$1is' @value)",
          "operations_expression": [
            "replace",
            "/(cris|ax|test)es$/i",
            "$1is",
            "@value"
          ]
        },
        {
          "conditions": "(match '/(octop|vir)i$/i' @value)",
          "conditions_expression": [
            "match",
            "/(octop|vir)i$/i",
            "@value"
          ],
          "operations": "(replace '/(octop|vir)i$/i' '$1us' @value)",
          "operations_expression": [
            "replace",
            "/(octop|vir)i$/i",
            "$1us",
            "@value"
          ]
        },
        {
          "conditions": "(match '/(alias|status)es$/i' @value)",
          "conditions_expression": [
            "match",
            "/(alias|status)es$/i",
            "@value"
          ],
          "operations": "(replace '/(alias|status)es$/i' '$1' @value)",
          "operations_expression": [
            "replace",
            "/(alias|status)es$/i",
            "$1",
            "@value"
          ]
        },
        {
          "conditions": "(match '/^(ox)en$/i' @value)",
          "conditions_expression": [
            "match",
            "/^(ox)en$/i",
            "@value"
          ],
          "operations": "(replace '/^(ox)en$/i' '$1' @value)",
          "operations_expression": [
            "replace",
            "/^(ox)en$/i",
            "$1",
            "@value"
          ]
        },
        {
          "conditions": "(match '/(vert|ind)ices$/i' @value)",
          "conditions_expression": [
            "match",
            "/(vert|ind)ices$/i",
            "@value"
          ],
          "operations": "(replace '/(vert|ind)ices$/i' '$1ex' @value)",
          "operations_expression": [
            "replace",
            "/(vert|ind)ices$/i",
            "$1ex",
            "@value"
          ]
        },
        {
          "conditions": "(match '/(matr)ices$/i' @value)",
          "conditions_expression": [
            "match",
            "/(matr)ices$/i",
            "@value"
          ],
          "operations": "(replace '/(matr)ices$/i' '$1ix' @value)",
          "operations_expression": [
            "replace",
            "/(matr)ices$/i",
            "$1ix",
            "@value"
          ]
        },
        {
          "conditions": "(match '/(quiz)zes$/i' @value)",
          "conditions_expression": [
            "match",
            "/(quiz)zes$/i",
            "@value"
          ],
          "operations": "(replace '/(quiz)zes$/i' '$1' @value)",
          "operations_expression": [
            "replace",
            "/(quiz)zes$/i",
            "$1",
            "@value"
          ]
        },
        {
          "conditions": "(match '/(us)es$/i' @value)",
          "conditions_expression": [
            "match",
            "/(us)es$/i",
            "@value"
          ],
          "operations": "(replace '/(us)es$/i' '$1' @value)",
          "operations_expression": [
            "replace",
            "/(us)es$/i",
            "$1",
            "@value"
          ]
        },
        {
          "conditions": "(match '/s$/i' @value)",
          "conditions_expression": [
            "match",
            "/s$/i",
            "@value"
          ],
          "operations": "(replace '/s$/i' '' @value)",
          "operations_expression": [
            "replace",
            "/s$/i",
            "",
            "@value"
          ]
        }
      ],
      "latin_name": "Singular",
      "description": "Converts plural form to singular",
      "application": "phrase"
    },
    "pos": {
      "rules": [
        {
          "description": "if value ends in s, append '",
          "conditions": "(match '/s$/' @value)",
          "conditions_expression": [
            "match",
            "/s$/",
            "@value"
          ],
          "operations": "(append \"'\" @value)",
          "operations_expression": [
            "append",
            "'",
            "@value"
          ]
        },
        {
          "description": "in all other cases, append 's",
          "conditions": "(true)",
          "conditions_expression": [
            "true"
          ],
          "operations": "(append \"'s\" @value)",
          "operations_expression": [
            "append",
            "'s",
            "@value"
          ]
        }
      ],
      "latin_name": "Possessive",
      "description": "Used to indicate possession (i.e., ownership). It is usually created by adding 's to the word",
      "application": "phrase"
    }
  }
};
},{}],26:[function(require,module,exports){
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

/**
 * Base API adapter
 * @constructor
 */
var Base = function() {};

/**
 * Base API adapter methods
 *
 * @type {{}}
 */
Base.prototype = {

  /**
   * Gets data from a URL
   *
   * @param url
   * @param params
   */
  get: function(url, params){
    throw new Error("Must be implemented by the extending class");
  },

  /**
   * Posts data to a URL
   *
   * @param url
   * @param params
   */
  post: function(url, params) {
    throw new Error("Must be implemented by the extending class");
  }

};

module.exports = Base;
},{}],27:[function(require,module,exports){
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

var logger = require("./logger");
var utils = require("./utils");
var config = require("./configuration");
var BaseAdapter = require('./api_adapters/base');
var promise = require('promise');

var API_PATH = "/v1/";

var parseOrReject = function (body) {
  try {
    return JSON.parse(body);
  } catch (e) {
    return promise.reject(e);
  }
}

/**
 * API Client
 *
 * @param app
 * @constructor
 */
var ApiClient = function (app) {
  this.application = app;
  this.cache = config.getCache();
  var adapter_class = config.getApiAdapter(config.api);
  adapter_class.prototype = utils.extend(new BaseAdapter(), adapter_class.prototype);
  this.adapter = new adapter_class();
};

ApiClient.prototype = {

  /**
   * Normalizes API params
   *
   * @param path
   * @param params
   * @param options
   * @returns {{path: *, params: *, options: (*|{})}}
   */
  normalizeParams: function (path, params, options) {
    options = options || {};
    return {path: path, params: params, options: options};
  },

  /**
   * Gets the latest release version from the CDN
   */
  getReleaseVersion: function () {
    var self = this;
    var t = new Date().getTime();

    var url = this.application.getCdnHost() + "/" + this.application.key + "/version.json";

    return self.adapter.get(url, {t: t})
        .then(function (data) {
          return JSON.parse(data).version;
        })
        .catch(function (err) {
          return 0;
        });
  },

  /**
   * Pulls the latest release and update it in the cache
   */
  updateReleaseVersion: function (current_version) {
    var self = this;
    return self.getReleaseVersion()
        .then(function (new_version) {
          return self.cache.storeVersion(new_version)
              .then(function (updated_version) {
                if (current_version != updated_version) {
                  logger.debug("Changing version from " + current_version + " to " + updated_version);
                  self.cache.clear();
                }
                return updated_version;
              });
        });
  },

  /**
   * Checks local cache first, if the release is undefined, get it and update the local cache
   */
  getCacheVersion: function () {
    // check version in the memory cache first
    if (this.cache.version && this.cache.version != 'undefined') {
      return promise.resolve(this.cache.version);
    }

    var self = this;

    // get version from local cache
    return this.cache.fetchVersion()
      .then(function (version_data) {
        // check timestamp for the version
        var needs_version_check = false;
        if (version_data.t) {
          var expires_at = version_data.t + self.cache.getVersionCheckInterval();
          var now = new Date().getTime();
          if (expires_at < now) {
            logger.debug("Cache version is outdated and needs a refresh now");
            needs_version_check = true;
          } else {
            var delta = Math.round((expires_at - now) / 1000);
            logger.debug("Cache version is up to date, will be checked in: " + delta + "s");
          }
        } else {
          logger.debug("Cache version has no timestamp, needs a refresh");
          needs_version_check = true;
        }
  
        //logger.debug(version_data);
        if (needs_version_check) {
          // update local cache version from CDN
          return self.updateReleaseVersion(version_data.version);
        } else {
          // if version is defined in the cache use it.
          self.cache.setVersion(version_data.version);
          return promise.resolve(version_data.version);
        }
      });
  },

  /**
   * Fetches data from CDN
   *
   * @param key
   */
  fetchFromCdn: function (key) {
    var self = this;

    if (self.cache.version == '0') {
      return promise.resolve(null);
    }

    var cdn_url = this.application.getCdnHost() + "/" + this.application.key + "/" + this.cache.version + utils.normalizePath(key) + ".json";
    return self.adapter.get(cdn_url, {})
        .then(function (data) {
          if (!data || data.match(/xml/)) 
            throw new Error('Not found');
          
          return data;
      });
  },

  /**
   * Gets data from URL
   *
   * @param path
   * @param params
   * @param options
   */
  get: function (path, params, options) {
    var opts = this.normalizeParams(path, params, options);
    opts.options.method = "get";
    return this.api(opts.path, opts.params, opts.options);
  },

  /**
   * Posts data to URL
   *
   * @param path
   * @param params
   * @param options
   */
  post: function (path, params, options) {
    var opts = this.normalizeParams(path, params, options);
    opts.options.method = "post";
    return this.api(opts.path, opts.params, opts.options);
  },

  isLiveApiRequest: function() {
    if (!this.application.token) return false;
    return this.application.isInlineModeEnabled();
  },

  isCacheEnabled: function(options) {
    if (options.method == "post") return false;
    return options.cache_key && this.cache;
  },

  /**
   * Internal - should never be used directly
   *
   * @param path
   * @param params
   * @param options
   */
  api: function (path, params, options) {
    utils.extend(params, {access_token: this.application.token});

    var url = this.application.getHost() + API_PATH + path;
    var self = this;
    
    if (self.isLiveApiRequest()) {
      if (options.method == "post") {
        return self.adapter.post(url, params)
            .then(parseOrReject);
      } else {
        return self.adapter.get(url, params)
            .then(parseOrReject);
      }
    }

    if (!self.isCacheEnabled(options)) {
      return promise.reject('Cache is disabled');
    }

    return self.getCacheVersion()
        .then(function (version) {
          if (parseInt(version) === 0) {
            return promise.reject(new Error('No release has been published'));
          } else {
            return self.cache.fetch(options.cache_key, function () {
              return self.fetchFromCdn(options.cache_key);
            })
            .then(parseOrReject);
          }
        });
  }

};

module.exports = ApiClient;

},{"./api_adapters/base":26,"./configuration":31,"./logger":39,"./utils":54,"promise":55}],28:[function(require,module,exports){
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

var utils       = require("./utils");
var config      = require("./configuration");
var logger      = require('./logger');
var promise     = require('promise');

var Language    = require("./language");
var Source      = require("./source");
var ApiClient   = require("./api_client");

var API_HOST = "https://api.translationexchange.com";
var CDN_HOST = "https://cdn.translationexchange.com";

/**
 * Application
 *
 * @constructor
 * @param {object} options - options
 */
var Application = function(options) {
  utils.extend(this, options);

  this.languages = [];
  for(var lang in (options.languages || [])) {
    this.languages.push(new Language(utils.extend(lang, {application: this})));
  }

  this.default_locale = config.default_locale;
  this.languages_by_locale = {};
  this.sources_by_key = {};
  this.missing_keys_by_source = {};
  this.translation_keys = {};
};

Application.prototype = {

  /**
   * Returns application host
   *
   * @returns {*|string}
   */
  getHost: function() {
    return this.host || API_HOST;
  },

  /**
   * Returns CDN host
   *
   * @returns {*|string}
   */
  getCdnHost: function() {
    return this.cdn_host || CDN_HOST;
  },

  /**
   * Extends current object
   *
   * @param data
   */
  extend: function(data) {
    utils.extend(this, data);
  },

  /**
   * addLanguage
   *
   * @function
   * @param {Language} language - language to be added
   */
  addLanguage: function(language) {
    language.application = this;
    this.languages_by_locale[language.locale] = new Language(language);
    return this.getLanguage(language.locale);
  },

  /**
   * getLanguage
   *
   * @description
   * returns a language object for a given locale
   *
   * @function
   * @param {string} locale - locale for which to get a language
   */
  getLanguage: function(locale) {
    var lang = this.languages_by_locale[locale];
    if (lang) lang.application = this;
    return lang;
  },

  /**
   * changes current language
   *
   * @param locale
   */
  changeLanguage: function(locale) {
    var self = this;
    self.current_locale = locale;
    self.sources_by_key = {};
    return this.initData([locale], [self.current_source])
        .then(function () {
          return self.getLanguage(self.current_locale); 
        });
  },

  /**
   * Returns current language
   *
   * @returns {*}
   */
  getCurrentLanguage: function() {
    var locale = this.current_locale;

    if (!locale)
      return this.getDefaultLanguage();

    var language = this.getLanguage(locale);
    if (language) return language;

    locale = locale.split('-')[0];
    language = this.getLanguage(locale);

    return language || this.getDefaultLanguage();
  },

  /**
   *
   * @returns {*|Language}
   */
  getDefaultLanguage: function() {
    var language = this.getLanguage(this.default_locale);
    language = language || new Language(config.getDefaultLanguage());
    language.application = this;
    return language;
  },

  /**
   * Adds a source
   *
   * @param source
   * @param locale
   * @param translations
   * @returns {*}
   */
  addSource: function(source, locale, translations) {
    if (!source) return;
    source = new Source({source: source});
    source.application = this;
    source.updateTranslations(locale, translations);
    this.sources_by_key[source.source] = source;

    return this.getSource(source.source);
  },

  /**
   * Returns a source
   *
   * @param key
   * @returns {*}
   */
  getSource: function(key) {
    return this.sources_by_key[key];
  },

  removeSource: function(key) {
    delete this.sources_by_key[key];
  },

  /**
   * Returns current source
   *
   * @returns {*}
   */
  getCurrentSource: function() {
    if (!this.current_source) return null;
    return this.sources_by_key[this.current_source];
  },

  /**
   * Checks if feature is enabled
   *
   * @param name
   * @returns {*|translator.features|{fallback_language, show_locked_keys}}
   */
  isFeatureEnabled: function(name) {
    return (this.features && this.features[name]);
  },

  /**
   * Returns Api Client object
   *
   * @returns {ApiClient|exports|module.exports|*}
   */
  getApiClient: function() {
    if (!this.api_client) {
      this.api_client = new ApiClient(this);
    }

    return this.api_client;
  },

  /**
   * Initializes the application
   *
   * @param options
   */
  init: function(options) {
    options = options || {};

    var self = this;

    self.current_translator = options.current_translator;
    self.current_source = options.current_source;

    if (utils.isFunction(self.current_source)) {
      self.current_source = self.current_source();
    }

    var params = {
      locale: options.current_locale || (options.accepted_locales ? options.accepted_locales.join(',') : 'en'),
      source: self.current_source,
      ignored: true
    };
    self.default_locale = self.default_locale || "en";
    return self.getApiClient().get("projects/" + self.key + "/definition", params, { cache_key: 'application' })
        .catch(function (err) {
          self.extend(config.getDefaultApplication());
          self.addLanguage(config.getDefaultLanguage());
          throw err;
        })
        .then(function (data) {
          self.extend(data);

          if (data.settings) {
            utils.merge(config, data.settings);
          }

          self.loadExtension(data);

          self.current_locale = (
              options.current_locale ||
              self.getPreferredLocale(options.accepted_locales, self.languages) ||
              self.default_locale
          );

          if (!self.isSupportedLocale(self.current_locale)) {
            self.current_locale = self.default_locale;
          }

          var locales = [self.default_locale];
          if (self.current_locale != self.default_locale) {
            locales.push(self.current_locale);
          }

          //console.log("Current locale: ", self.current_locale);

          var sources = [self.current_source || 'index'];
          return self.initData(locales, sources);
        }); 
  },

  /**
   * Checks if the locale is part of the application
   *
   * @param locale
   * @returns {boolean}
   */
  isSupportedLocale: function(locale) {
    if (!this.languages) return false;
    for(var i=0; i<this.languages.length; i++) {
      if (this.languages[i].locale == locale)
        return true;
    }
    return false;
  },

  /**
   * Loads application extensions: locales, sources
   *
   * @param data
   */
  loadExtension: function(data) {
    data = data.extensions;
    if (!data) return;

    var self = this;
    var sourceLocale = self.default_locale;
    var cache = config.getCache();
    if (self.isInlineModeEnabled()) cache = null;

    if (data.languages) {
      Object.keys(data.languages).forEach(function(locale) {
        if (locale != self.default_locale)
          sourceLocale = locale;
        if (cache) cache.store(self.getLanguageKey(locale), JSON.stringify(data.languages[locale]));
        self.addLanguage(new Language(data.languages[locale]));
      });
    }

    if (data.sources) {
      Object.keys(data.sources).forEach(function(key) {
        if (cache) cache.store(self.getSourceKey(key, sourceLocale), JSON.stringify(data.sources[key]));
        self.addSource(key, sourceLocale, data.sources[key]);
      });
    }
  },

  /**
   * Inits internal application data
   *
   * @param locales
   * @param sources
   */
  initData: function(locales, sources) {
    var self = this;

    // init languages
    var languagesLoad = self.loadLanguages(locales);
    if (!sources || !sources.length)
        return languagesLoad;
    
    return languagesLoad
        .then(function(languages) {
          // init main source
          return self.loadSources(sources, self.current_locale)
              .then(function(loadedSources) {
                // init all sub-loadedSources
                if (loadedSources.length > 0 && loadedSources[0] && loadedSources[0].sources && loadedSources[0].sources.length > 0) {
                  return self.loadSources(loadedSources[0].sources, self.current_locale);
                }
                return loadedSources;
          });
    });
  },

  /**
   * Returns user preferred locale
   *
   * @param preferredLocales
   * @param languages
   * @returns {*}
   */
  getPreferredLocale: function(preferredLocales, languages){
    var match;
    var appLocales = (languages || []).map(function(l){return l.locale;});

    (preferredLocales || []).forEach(function(plocale){
      var regx = new RegExp(plocale+"|"+plocale.replace(/-\w+$/,''));
      appLocales.forEach(function(alocale) {
        if(!match && alocale.match(regx)) match = alocale;
      });
    });
    return match;
  },

  /**
   * Loads languages
   *
   * @param locales
   */
  loadLanguages: function(locales) {
    var self = this;

    var loadingLanguages = locales.map(function (locale) {
      return self.getApiClient().get("languages/" + locale + "/definition", {}, 
          {cache_key: self.getLanguageKey(locale)})
          .then(function (langData) {
            return self.addLanguage(new Language(utils.extend(langData, {application: self})));
          });
    });
    
    return promise.all(loadingLanguages);
  },

  /**
   * Returns language cache key
   *
   * @param locale
   * @returns {string}
   */
  getLanguageKey: function(locale) {
    return locale + "/language";
  },

  /**
   * Returns source by source key
   *
   * @param source
   * @param locale
   * @returns {string}
   */
  getSourceKey: function(source, locale) {
    return locale + "/sources/" + source;
  },

  getSourceName: function(source) {
    return source.call && source() || source;
  },  

  /**
   * Loads sources
   *
   * @param sources
   * @param locale
   */
  loadSources: function(sources, locale) {
    //var data = {};
    var self = this;

    var loadingSources = sources.map(function (source) {
      source = self.getSourceName(source);
      if (!self.sources_by_key[source]) {
        var key = utils.generateSourceKey(source);
        return self.getApiClient().get("sources/" + key + '/translations', {
          locale: locale,
          ignored: true,
          all: true,
          app_id: self.key
        }, {
          cache_key: locale + '/sources' + utils.normalizePath(source)
        }).then(function (sourceData) {
          self.addSource(source, locale, sourceData);
          return sourceData;
        });
      }
    });

    return promise.all(loadingSources.filter(Boolean))
  },

  isInlineModeEnabled: function() {
    if (!this.current_translator) return false;
    return this.current_translator.inline;
  },

  addMissingElement: function(source_key, translation_key) {
    // do not register keys if file cache is used and not in the inline translation mode
    // otherwise keys will always be sent for registration as cache is not renewed automatically

    if (config.isFileCache() && !this.isInlineModeEnabled())
      return;

    if (!this.missing_keys_by_source)
      this.missing_keys_by_source = {};
    if (!this.missing_keys_by_source[source_key])
      this.missing_keys_by_source[source_key] = {};
    if (translation_key !== null)
      this.missing_keys_by_source[source_key][translation_key.key] = translation_key;
  },

  verifySourcePath: function(source_key, source_path) {
    if (!this.extensions || !this.extensions.sources || this.extensions.sources[source_key] !== null)
      return;

    this.addMissingElement(source_path, null);
  },

  registerMissingTranslationKey: function(source_key, translation_key) {
    //console.log("Registering missing translation key: " + source_key + " " + translation_key.label);

    this.addMissingElement(source_key, translation_key);

    var self = this;
    if (config.delayed_flush && !self.submit_scheduled) {
      self.submit_scheduled = true;
      setTimeout(function() {
        self.submitMissingTranslationKeys();
      }, 3000);
    }
  },

  /**
   * Submits missing keys to the server
   */
  submitMissingTranslationKeys: function() {
    if (!this.missing_keys_by_source) {
      return;
    }

    // only submit keys if no snapshots were configured or
    // in inline translation mode

    if (!this.isInlineModeEnabled()) {
      return;
    }

    var source_keys = utils.keys(this.missing_keys_by_source);
    if (source_keys.length === 0) {
      return;
    }

    logger.debug("Submitting missing translation keys...");

    var params = [];

    var attributes = ["key", "label", "description", "locale", "level"];
    for(var i=0; i<source_keys.length; i++) {
      var source_key = source_keys[i];
      var keys = utils.keys(this.missing_keys_by_source[source_key]);
      var keys_data = [];
      for(var j=0; j<keys.length; j++) {
        var key = this.missing_keys_by_source[source_key][keys[j]];
        var json = {};
        for(var k=0; k<attributes.length; k++) {
          var attr = attributes[k];
          if (key[attr]) json[attr] = key[attr];
        }
        keys_data.push(json);
      }
      params.push({source: source_key, keys: keys_data});
    }

    // logger.debug(JSON.stringify(params));

    var self = this;
    self.missing_keys_by_source = null;
    return this.getApiClient().post("sources/register_keys", {source_keys: JSON.stringify(params), app_id: self.key})
        .then(function () {
          utils.keys(self.languages_by_locale).forEach(function (locale) {
            source_keys.forEach(function (source_key) {
              // delete from cache source_key + locale
              source_key = source_key.split(config.source_separator);
              source_key.forEach(function (source) {
                // console.log("Removing " + locale + '/sources/' + source + " from cache");
                // TODO: may not need to remove all sources in path from the cache
                self.removeSource(source);
                config.getCache().del(locale + '/sources/' + source, function () {});
              });
            });
          });
        });
  },

  /**
   * Returns translation key from local cache
   *
   * @param key
   * @returns {*}
   */
  getTranslationKey: function(key) {
    return this.translation_keys[key];
  },

  /**
   * temporary / per request cache
   * @param translation_key
   * @returns {*}
   */
  cacheTranslationKey: function(translation_key) {
    var cached_key = this.getTranslationKey(translation_key.key);

    if (cached_key) {
      // move all translations from the new key to the cached one
      var locales = utils.keys(translation_key.translations || {});
      for (var i=0; i<locales.length; i++) {
        var translations = translation_key.translations[locales[i]];
        var language = this.getLanguage(locales[i]);
        cached_key.setTranslationsForLanguage(language, translations);
      }
      return cached_key;
    }

    // cache the new translation key
    translation_key.setApplication(this);
    this.translation_keys[translation_key.key] = translation_key;
    return translation_key;
  }

};

module.exports = Application;

},{"./api_client":27,"./configuration":31,"./language":34,"./logger":39,"./source":43,"./utils":54,"promise":55}],29:[function(require,module,exports){
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

var utils        = require("./utils");
var promise      = require('promise');
var BaseAdapter  = require('./cache_adapters/base');

var Cache = function(options) {
  this.adapter = null;
  this.options = options;
  this.version = options.version;

  var adapter_class;
  
  if (options) {
    if(typeof options.adapter == "string") {
      var config = require("./configuration");
      adapter_class = config.getCacheAdapter(options.adapter);
    } else if (typeof options.adapter == "function") {
      adapter_class = options.adapter;
      delete options.adapter;
    }
    if (adapter_class) {
      adapter_class.prototype = utils.extend(new BaseAdapter(), adapter_class.prototype);
      this.adapter = new adapter_class(options);
      if (options.version_check_interval)
        this.adapter.version_check_interval = options.version_check_interval;
    }
  }

};

Cache.prototype = {

  /**
   * Fetches data from cache
   *
   * @param key
   * @param fallback
   */
  fetch: function(key, fallback) {
    if (!this.adapter) {

      if (utils.isFunction(fallback)) {
        return fallback()
            .then(function(data) {
              if (data) {
                return data;
              }
              else
                throw new Error("no data");
            });
      } else {
        return fallback;
      }
    }
    return this.adapter.fetch(key, fallback);
  },

  /**
   * Stores data in the cache
   *
   * @param key
   * @param value
   */
  store: function(key, value) {
    if (!this.adapter) {
      return promise.resolve();
    }
    return this.adapter.store(key, value);
  },

  /**
   * Deletes data from cache
   *
   * @param key
   */
  del: function(key) {
    if (!this.adapter) {
      return promise.resolve();
    }
    return this.adapter.del(key);
  },

  /**
   * Checks if data exists in the cache
   *
   * @param key
   */
  exists: function(key) {
    if (!this.adapter) {
      return promise.resolve();
    }
    return this.adapter.exists(key);
  },

  /**
   * Fetches current release version
   */
  fetchVersion: function() {
    if (!this.adapter) {
      return promise.resolve({version: this.options.version || '0'});
    }
    return this.adapter.fetchVersion();
  },

  /**
   * Stores release version in local cache
   *
   * @param version
   */
  storeVersion: function(version) {
    this.version = version;
    if (!this.adapter) {
      return promise.resolve(version);
    }
    return this.adapter.storeVersion(version);
  },

  /**
   * Sets internal version
   *
   * @param new_version
   */
  setVersion: function(new_version) {
    this.version = new_version;
    if (this.adapter) {
      this.adapter.version = new_version;
    }
  },

  /**
   * Resets internal version
   */
  resetVersion: function() {
    if (!this.adapter) return;
    this.version = null;
  },

  /**
   * Returns version check interval
   *
   * @returns {number}
   */
  getVersionCheckInterval: function() {
    if (!this.adapter) return 0;
    return this.adapter.version_check_interval * 1000;
  },

  /**
   * Clears cache
   *
   */
  clear: function() {
    if (!this.adapter) {
      return promise.resolve();
    }
    return this.adapter.clear();
  }
};

module.exports = Cache;
},{"./cache_adapters/base":30,"./configuration":31,"./utils":54,"promise":55}],30:[function(require,module,exports){
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

var config      = require('../configuration');
var logger      = require('../logger');
var utils       = require('../utils');
var promise     = require('promise');

var VERSION_KEY  = 'current_version';
var KEY_PREFIX   = 'tml';
var CDN_URL      = 'http://cdn.translationexchange.com';
// var CDN_URL      = 'https://trex-snapshots.s3-us-west-1.amazonaws.com';

/**
 * Base cache adapter
 *
 * @constructor
 */
var Base = function() {};

/**
 * Base adapter methods
 */
Base.prototype = {

  read_only         : true,
  cached_by_source  : true,
  name              : "",

  // check for version every hour - store number in seconds
  version_check_interval: (60 * 60),

  initialize: function(config) {
    this.config = config || {};
    this.cache = this.create();
  },

  create: function(){
    logger.debug("Must be implemented by the extending class");
  },

  fetch: function() {
    logger.debug("Must be implemented by the extending class");
  },

  store: function(key, value){
    logger.debug("Must be implemented by the extending class");
  },

  del: function(key) {
    logger.debug("Must be implemented by the extending class");
  },

  exists: function(key) {
    logger.debug("Must be implemented by the extending class");
  },

  warn: function(msg) {
    logger.debug(this.name + " - " + msg);
  },

  info: function(msg) {
    logger.debug(this.name + " - " + msg);
  },

  fileName: function(key) {
    return key + '.json';
  },

  fetchDefault: function(key, fallback) {
    var self = this;
    if (utils.isFunction(fallback)) {
      return fallback()
        .then(function(data) {
          if (data) {
            return self.store(key, data);
          } 
          else 
            throw new Error("no data");
        });
    } else if (fallback) {
      return self.store(key, fallback);
    }
  },

  // pulls current stored version from cache
  fetchVersion: function() {
    var self = this;

    if (self.config.version) {
      self.info("Cache version from config: " + self.config.version);
      return promise.resolve(self.config.version);
    } else {
      var default_version = JSON.stringify({version: "undefined"});
      return self.fetch(VERSION_KEY, default_version)
          .then(function (data) {
            data = data || '';
            if (data.indexOf('{') != -1)
              data = JSON.parse(data);
            else
              data = {version: data};
            self.info("Cache version: " + data.version);
            return data;
          });
    }
  },

  storeVersion: function(version) {
    var self = this;
    self.version = version;

    // store version with a timestamp when it was last updated
    var version_data = JSON.stringify({version: self.version, t: self.getVersionTimestamp()});
    //logger.debug("Storing version data " + version_data);

    return self.store(VERSION_KEY, version_data)
        .then(function() {
          return self.version;
        });
  },

  /**
   * Returns timestamp based on the frequency interval
   */
  getVersionTimestamp: function() {
    var t = new Date().getTime();
    //t = t - (t % (this.version_check_interval * 1000));
    return t;
  },

  /**
   * Prefix key with a version
   *
   * @param key
   * @returns {string}
   */
  getVersionedKey: function(key) {
    var parts = [
      KEY_PREFIX,
      this.config.namespace || '',
      (key == VERSION_KEY) ? 'v' : 'v' + (this.version || this.config.version || '0'),
      key
    ];
    return parts.join('_');
  },

  /**
   * Remove extensions from data before putting it in cache
   *
   * @param data
   * @returns {*}
   */
  stripExtensions: function(data) {
    if (utils.isString(data) && data.match(/^\{/)) {
      data = JSON.parse(data);
      if (data.extensions)
        delete data.extensions;
      data = JSON.stringify(data);
    }
    return data;
  },

  /**
   * Get the API request object based on implementation
   *
   * @returns {null}
   */
  getRequest: function() {
    // must be overloaded by cache adapters
    return null;
  },

  /**
   * Clear cache
   *
   * @param callback
   */
  clear: function() {
    return promise.resolve(null);
  }
};

module.exports = Base;
},{"../configuration":31,"../logger":39,"../utils":54,"promise":55}],31:[function(require,module,exports){
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

var Cache     = require("./cache");

var utils     = require("./utils");
var defaults  = require("./../config/defaults.js");
var english  = require("./../config/english.js");
var application  = require("./../config/application.js");

var Configuration = function() {
  utils.merge(this, defaults);
};

Configuration.prototype = {

  /**
   * Initializes cache
   *
   * @param key
   * @returns {Cache|exports|module.exports|*}
   */
  initCache: function(key) {
    this.cache = this.cache || {};
    if (key) {
      this.cache.namespace = key.substring(0, 5);
    }
    this.cacheAdapter = new Cache(this.cache);
    return this.cacheAdapter;
  },

  /**
   * Returns default application
   *
   * @returns {Application}
   */
  getDefaultApplication: function() {
    return application;
  },

  /**
   * Returns default language
   *
   * @returns {Language}
   */
  getDefaultLanguage: function() {
    return english;
  },

  /**
   * Gets cache instance
   *
   * @returns {Cache|exports|module.exports|*}
   */
  getCache: function() {
    return this.cacheAdapter;
  },

  /**
   * Returns default token implementation
   *
   * @param token
   * @param type
   * @param format
   * @returns {*}
   */
  getDefaultToken: function(token, type, format) {
    type = type || "data"; format = format || "html";

    if (this.default_tokens[format][type][token])
      return this.default_tokens[format][type][token];

    var parts = token.split("_");
    token = parts[parts.length-1];
    token = token.replace(/_*\d+$/, '');

    if (this.default_tokens[format][type][token])
      return this.default_tokens[format][type][token];

    return null;
  },

  /**
   * Configures default token
   *
   * @param token
   * @param value
   * @param type
   * @param format
   */
  setDefaultToken: function(token, value, type, format) {
    type = type || "data"; format = format || "html";
    this.default_tokens[format] = this.default_tokens[format] || {};
    this.default_tokens[format][type] = this.default_tokens[format][type] || {};
    this.default_tokens[format][type][token] = value;
  },

  /**
   * Returns context rules
   *
   * @param key
   * @returns {*|{}}
   */
  getContextRules: function(key) {
    return this.context_rules[key] || {};
  },

  /**
   * Sets context rules
   *
   * @param key
   * @param variable
   * @param rule
   * @returns {boolean}
   */
  setContextRules: function(key, variable, rule) {
    if(!this.context_rules[key]) return false;
    this.context_rules[key].variables[variable] = rule;
  },

  /**
   * Checks if disabled
   *
   * @returns {boolean}
   */
  isDisabled: function() {
    return !this.isEnabled();
  },

  /**
   * Checks if enabled
   *
   * @returns {boolean|at.selectors.pseudos.enabled|Function}
   */
  isEnabled: function() {
    return this.enabled;
  },

  /**
   * Checks if file cache
   *
   * @returns {boolean}
   */
  isFileCache: function() {
    if (this.cache === null) return false;
    return this.cache.adapter == 'file';
  },

  /**
   * Registers custom cache adapter
   *
   * @param key
   * @param klass
   */
  registerCacheAdapter: function(key, klass) {
    this.cache_adapters = this.cache_adapters || {};
    this.cache_adapters[key] = klass;
  },

  /**
   * Registers multiple cache adapters
   *
   * @param adapters
   */
  registerCacheAdapters: function(adapters) {
    var self = this;
    Object.keys(adapters).forEach(function(key) {
      self.registerCacheAdapter(key, adapters[key]);
    });
  },

  /**
   * Returns specific cache adapter
   *
   * @param key
   * @returns {*}
   */
  getCacheAdapter: function (key) {
    if (!this.cache_adapters)
      return null;
    return this.cache_adapters[key];
  },

  /**
   * Registers API adapter
   *
   * @param key
   * @param klass
   */
  registerApiAdapter: function(key, klass) {
    this.api_adapters = this.api_adapters || {};
    this.api_adapters[key] = klass;
  },

  /**
   * Registers multiple api adapters
   *
   * @param adapters
   */
  registerApiAdapters: function(adapters) {
    var self = this;
    Object.keys(adapters).forEach(function(key) {
      self.registerApiAdapter(key, adapters[key][klass]);
    });
  },

  /**
   * Returns specific API adapter
   *
   * @param key
   * @returns {*}
   */
  getApiAdapter: function(key) {
    if (!this.api_adapters)
      return null;
    return this.api_adapters[key];
  }
};

module.exports = new Configuration();



},{"./../config/application.js":23,"./../config/defaults.js":24,"./../config/english.js":25,"./cache":29,"./utils":54}],32:[function(require,module,exports){
(function (Buffer){
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

var utils = require('../utils');

var HTMLDecorator = {

  isEnabled: function(options) {
    if (!options) return false;
    if (options.skip_decorations) return false;
    if (options.ignored) return false;

    return (
      options.current_translator &&
      options.current_translator.inline
    );
  },

  getDecorationElement: function(defaultElement, options) {
    if (options.use_span)
      return 'span';

    if (options.use_div)
      return 'div';

    return defaultElement;
  },

  decorate: function(translated_label, translation_language, target_language, translation_key, options) {
    options = options || {};
    if (!this.isEnabled(options)) return translated_label;

    if (
      (translation_key.application && translation_key.application.isFeatureEnabled("lock_original_content") && translation_key.language == target_language) ||
      (translation_key.locked && !options.current_translator.manager)
    ) return translated_label;

    var element = this.getDecorationElement('tml:label', options);
    var classes = ['tml_translatable'];

    if (options.locked) {
      if (options.current_translator && !options.current_translator.isFeatureEnabled("show_locked_keys"))
          return translated_label;
      classes.push('tml_locked');
    } else if (translation_language.locale === translation_key.locale) {
      if (options.pending)
        classes.push('tml_pending');
      else
        classes.push('tml_not_translated');
    } else if (translation_language.locale === target_language.locale) {
      classes.push('tml_translated');
    } else {
      classes.push('tml_fallback');
    }

    var html = [];
    html.push("<" + element + " class='" + classes.join(' ') + "' data-translation_key='" + translation_key.key + "' data-target_locale='" + target_language.locale + "'>");
    html.push(translated_label);
    html.push("</" + element + ">");
    return html.join("");
  },

  decorateLanguageCase: function(language_case, rule, original, transformed, options) {
    options = options || {};
    if (!this.isEnabled(options)) return transformed;

    var data = {
      'keyword': language_case.keyword,
      'language_name': language_case.language.english_name,
      'latin_name': language_case.latin_name,
      'native_name': language_case.native_name,
      'conditions': (rule ? rule.conditions : ''),
      'operations': (rule ? rule.operations : ''),
      'original': original,
      'transformed': transformed
    };

    var payload = new Buffer(JSON.stringify(data)).toString('base64').trim().replace("\n", "");

    var attributes = {
      'class': 'tml_language_case',
      'data-locale': language_case.language.locale,
      'data-rule': encodeURIComponent(payload)
    };

    var query = [];
    var keys = utils.keys(attributes);
    for (var i=0; i<keys.length; i++) {
      query.push("" + keys[i] + "=\"" +  attributes[keys[i]] + "\"");
    }

    var element = this.getDecorationElement('tml:case', options);

    var html = [];
    html.push("<" + element + " " + query.join(" ") + ">");
    html.push(transformed);
    html.push("</" + element + ">");

    return html.join("");
  },

  decorateToken: function(token, value, options) {
    if (!this.isEnabled(options)) return value;

    var element = this.getDecorationElement('tml:token', options);

    var classes = ['tml_token', "tml_token_" + token.getDecorationName()];

    var html = [];
    html.push("<" + element + " class='" + classes.join(' ') + "' data-name='" + token.short_name + "'");
    if (token.context_keys && token.context_keys.length > 0)
      html.push(" data-context='" + token.context_keys.join(',') + "'");

    if (token.case_keys && token.case_keys.length > 0)
      html.push(" data-case='" + token.case_keys.join(',') + "'");

    html.push('>');
    html.push(value);
    html.push("</" + element + ">");

    return html.join("");
  },

  decorateElement: function(token, value, options) {
    if (!this.isEnabled(options)) return value;

    var element = this.getDecorationElement('tml:element', options);

    var html = [];
    html.push("<" + element + ">");
    html.push(value);
    html.push("</" + element + ">");

    return html.join("");
  }

};

module.exports = HTMLDecorator;




}).call(this,require("buffer").Buffer)
},{"../utils":54,"buffer":8}],33:[function(require,module,exports){
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

var scripts = {

  agent_tag: function (app, options) {
    options = options || {};

    options.cache = options.cache || 864000000;
    var agent_host = options.host || "https://tools.translationexchange.com/agent/stable/agent.min.js";

    if (options.cache) {
      var t = new Date().getTime();
      t = t - (t % options.cache);
      agent_host += "?ts=" + t;
    }

    options.css = options.css || app.css;
    options.sdk = options.sdk || 'tml-js v0.4.16';
    options.languages = [];

    for (var l = 0; l < app.languages.length; l++) {
      var language = app.languages[l];
      options.languages.push({
        locale: language.locale,
        english_name: language.english_name,
        native_name: language.native_name,
        flag_url: language.flag_url
      });
    }

    //console.log(options);

    var html = [];
    html.push("<script>");
    html.push("(function() {");
    html.push("  var script = document.createElement('script');");
    html.push("  script.setAttribute('id', 'tml-agent'); script.setAttribute('type', 'application/javascript');");
    html.push("  script.setAttribute('src', '" + agent_host + "');");
    html.push("  script.setAttribute('charset', 'UTF-8');");
    html.push("  script.onload = function() {");
    html.push("       Trex.init('" + app.key + "', " + JSON.stringify(options) + ");");
    html.push("  };");
    html.push("  document.getElementsByTagName('head')[0].appendChild(script);");
    html.push("})();");
    html.push("</script>");
    return html.join("\n");
  },

  language_name_tag: function (language, options) {
    options = options || {};
    if (language === null) language = tml_current_language();
    var html = [];
    if (options.flag) {
      html.push(this.language_flag_tag(language));
      html.push(' ');
    }
    html.push(language.native_name);
    return html.join('');
  },

  language_flag_tag: function (language, options) {
    options = options || {};
    var name = language.english_name;
    if (options.language == 'native')
      name = language.native_name;

    if (language === null) language = tml_current_language();
    return "<img src='" + language.flag_url + "' style='margin-right:3px;' alt='" + name + "' title='" + name + "'>";
  },

  language_selector_tag: function (app, type, options) {
    type = type || 'default';

    var attrs = [];
    var keys = Object.keys(options);
    for (var i=1; i<keys.length; i++) {
      attrs.push("data-tml-" + keys[i] + "='" + options[keys[i]] + "'");
    }
    attrs = attrs.join(' ');

    return "<div data-tml-language-selector='" + type + "' " + attrs + "></div>";
  }
};

module.exports = {
  header: scripts.agent_tag, // deprecated
  agent_tag: scripts.agent_tag,
  language_name_tag: scripts.language_name_tag,
  language_flag_tag: scripts.language_flag_tag,
  language_selector: scripts.language_selector_tag
};
},{}],34:[function(require,module,exports){
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

var utils           = require('./utils');
var config          = require('./configuration');

var LanguageContext = require('./language_context');
var LanguageCase    = require('./language_case');
var TranslationKey  = require('./translation_key');

/**
 * Language
 *
 * @constructor
 * @param {object} attrs - options
 */
var Language = function(attrs) {
  utils.extend(this, attrs);

  this.contexts = {};
  var keys = utils.keys(attrs.contexts || {});
  for (var i=0; i<keys.length; i++) {
    this.contexts[keys[i]] = new LanguageContext(utils.extend(attrs.contexts[keys[i]], {language: this, keyword: keys[i]}));
  }

  this.cases = {};
  keys = utils.keys(attrs.cases || {});
  for (i=0; i<keys.length; i++) {
    this.cases[keys[i]] = new LanguageCase(utils.extend(attrs.cases[keys[i]], {language: this, keyword: keys[i]}));
  }
};

Language.prototype = {
  getContextByKeyword: function(key) {
    return this.contexts[key];
  },
  
  getContextByTokenName: function(token_name) {
    var keys = utils.keys(this.contexts || {});
    for (var i=0; i<keys.length; i++) {
      if (this.contexts[keys[i]].isAppliedToToken(token_name))
        return this.contexts[keys[i]];
    }
    return null;
  },
  
  getLanguageCaseByKeyword: function(key) {
    return this.cases[key];
  },

  isDefault: function() {
    return (this.locale == config.default_locale);
  },

  translate: function(label, description, tokens, options) {
    var params = utils.normalizeParams(label, description, tokens, options);

    var translation_key = new TranslationKey({
      label:        params.label,
      description:  params.description,
      language:     this.application ? this.application.getLanguage() : null,
      application:  this.application
    });

    if (this.application) {
      var source_path = this.getSourcePath(params.options);
      var current_source = source_path[source_path.length-1];
      source_path = source_path.join(config.source_separator);

      if (params.options.block_options && params.options.block_options.dynamic)
        source_path = current_source;
      else
        this.application.verifySourcePath(current_source, source_path);

      var source = this.application.getSource(current_source);
      if (source && source.isIgnoredKey(translation_key.key)) {
        params.options.ignored = true;
        return translation_key.translate(this, params.tokens, params.options);
      }

      var cached_translations = source ? source.getTranslations(this.locale, translation_key.key) : null;

      if (cached_translations) {
        translation_key.setTranslations(this.locale, cached_translations);
      } else {
        params.options.pending = true;
        this.application.registerMissingTranslationKey(source_path, translation_key);
        var local_key = this.application.getTranslationKey(translation_key.key);
        if (local_key) translation_key = local_key;
      }
    }

    return translation_key.translate(this, params.tokens, params.options);
  },

  align: function(dest) {
    if (this.isRightToLeft())
      return (dest == 'left' ? 'right' : 'left');
    return dest;
  },

  isRightToLeft: function() {
    return this.right_to_left;
  },

  direction: function() {
    return this.isRightToLeft() ? 'rtl' : 'ltr';
  },

  getSourceName: function(source) {
    var source_name = source.call && source() || source;
    // limit source name to no more than 60 characters
    if (source_name && source_name.length > 60)
      source_name = source_name.substring(0, 60);
    return source_name;
  },

  getSourcePath: function(options) {

    if (!options.block_options.length){
      return [this.getSourceName(options.current_source)];
    }

    var source_path = [];

    for(var i=0; i<options.block_options.length; i++) {
      var opts = options.block_options[i];
      if (opts.source) {
        source_path.push(this.getSourceName(opts.source));
      }
    }

    source_path = source_path.reverse();
    source_path.unshift(this.getSourceName(options.current_source));

    return source_path;
  }
};

module.exports = Language;

},{"./configuration":31,"./language_case":35,"./language_context":37,"./translation_key":52,"./utils":54}],35:[function(require,module,exports){
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

var utils     = require("./utils");
var config    = require("./configuration");

var LanguageCaseRule = require("./language_case_rule");
var HTMLDecorator    = require("./decorators/html");

/**
 * Language Case
 *
 * @constructor
 * @param {object} attrs - options
 */
var LanguageCase = function(attrs) {
  utils.extend(this, attrs);

  this.rules = [];
  attrs.rules = attrs.rules || [];
  for (var i=0; i<attrs.rules.length; i++) {
    this.rules.push(new LanguageCaseRule(utils.extend(attrs.rules[i], {language_case: this})));
  }
};


LanguageCase.prototype = {

  findMatchingRule: function(value, object) {
    for (var i=0; i<this.rules.length; i++) {
      var rule = this.rules[i];
      if (rule.evaluate(value, object))
        return rule;
    }

    return null;
  },

  apply: function(value, object, options) {
    var tags = utils.unique(value.match(/<\/?[^>]*>/g) || []);
    var sanitized_value = value.replace(/<\/?[^>]*>/g, '');

    var elements = [sanitized_value];
    if (this.application != 'phrase')
      elements = utils.unique(sanitized_value.split(/[\s\/]/) || []);

    // replace html tokens with temporary placeholders {$h1}
    for(var i=0; i<tags.length; i++) {
      value = value.replace(tags[i], '{$h' + i + '}');
    }

    // replace words with temporary placeholders {$w1}
    for(i=0; i<elements.length; i++) {
      value = value.replace(elements[i], '{$w' + i + '}');
    }

    var decorator = HTMLDecorator;

    var transformed_elements = [];
    for(i=0; i<elements.length; i++) {
      var element = elements[i];
      var rule = this.findMatchingRule(element, object);
      var case_value = (rule ? rule.apply(element) : element);
      transformed_elements.push(decorator.decorateLanguageCase(this, rule, element, case_value, options));
    }

    // replace back temporary placeholders {$w1}
    for(i=0; i<elements.length; i++) {
      value = value.replace('{$w' + i + '}', transformed_elements[i]);
    }

    // replace back temporary placeholders {$h1}
    for(i=0; i<tags.length; i++) {
      value = value.replace('{$h' + i + '}', tags[i]);
    }

    return value;
  },

  getConfig: function() {
    return config;
  }

};

module.exports = LanguageCase;


},{"./configuration":31,"./decorators/html":32,"./language_case_rule":36,"./utils":54}],36:[function(require,module,exports){
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

var utils     = require("./utils");

var Parser    = require('./rules_engine/parser');
var Evaluator = require('./rules_engine/evaluator');
/**
 * Language Case Rule
 *
 * @constructor
 * @param {object} attrs - options
 */
var LanguageCaseRule = function(attrs) {
  utils.extend(this, attrs);
};

LanguageCaseRule.prototype = {

  getConditionsExpression: function() {
    if (!this.conditions_expression)
      this.conditions_expression = (new Parser(this.conditions)).parse();
    return this.conditions_expression;
  },
  
  getOperationsExpression: function() {
    if (!this.operations_expression)
      this.operations_expression = (new Parser(this.operations)).parse();
    return this.operations_expression;
  },
  
  getGenderVariables: function(object) {
    if (this.conditions.indexOf("@gender") == -1)
      return {};
  
    if (!object)
      return {gender: 'unknown'};
  
    var context = this.language_case.language.getContextByKeyword("gender");
  
    if (!context)
      return {gender: 'unknown'};
  
    return context.getVars(object);
  },
  
  evaluate: function(value, object) {
    if (!this.conditions)
      return false;
  
    var evaluator = new Evaluator();
    evaluator.setVars(utils.extend({"@value": value}, this.getGenderVariables(object)));
  
    return evaluator.evaluate(this.getConditionsExpression());
  },
  
  apply: function(value) {
    if (!this.operations)
      return value;
  
    var evaluator = new Evaluator();
    evaluator.setVars({"@value": value});
  
    return evaluator.evaluate(this.getOperationsExpression());
  }

};

module.exports = LanguageCaseRule;

},{"./rules_engine/evaluator":41,"./rules_engine/parser":42,"./utils":54}],37:[function(require,module,exports){
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

var utils     = require("./utils");
var config    = require("./configuration");

var LanguageContextRule = require("./language_context_rule");

/**
 * Language Context
 *
 * @constructor
 * @param {object} attrs - options
 */
var LanguageContext = function(attrs) {
  utils.extend(this, attrs);

  this.rules = {};

  var keys = utils.keys(attrs.rules || {});
  for (var i=0; i<keys.length; i++) {
    this.rules[keys[i]] = new LanguageContextRule(utils.extend(attrs.rules[keys[i]], {language_context: this, keyword: keys[i]}));
  }

};

LanguageContext.prototype = {

  isAppliedToToken: function(token) {
    var expr = new RegExp(this.token_expression.substring(1,this.token_expression.length-2));
    return (token.match(expr) !== null);
  },
  
  getFallbackRule: function() {
    if (!this.fallback_rule) {
      var keys = utils.keys(this.rules);
      for (var i=0; i<keys.length; i++) {
        var key = keys[i];
        if (this.rules[key].isFallback())
          this.fallback_rule = this.rules[key];
      }
    }
    return this.fallback_rule;
  },

  getConfig: function() {
    return config.getContextRules(this.keyword);
  },

  getVars: function(obj) {
    var vars = {};
    var config = this.getConfig();

    for (var i=0; i<this.variables.length; i++) {
      var key = this.variables[i];
      if (!config.variables || !config.variables[key]) {
        vars[key] = obj;
      } else {
        var method = config.variables[key];
        if (typeof method === "string") {
          if (obj.object) obj = obj.object;
          vars[key] = obj[method];
        } else if (typeof method === "function") {
          vars[key] = method(obj);
        } else {
          vars[key] = obj;
        }
      }
    }
  
    return vars;
  },
  
  findMatchingRule: function(obj) {
    var token_vars = this.getVars(obj);

    var keys = utils.keys(this.rules);

    for (var i=0; i<keys.length; i++) {
      var rule = this.rules[keys[i]];
      if (!rule.isFallback() && rule.evaluate(token_vars))
          return rule;
    }
  
    return this.getFallbackRule();
  }

};

module.exports = LanguageContext;
},{"./configuration":31,"./language_context_rule":38,"./utils":54}],38:[function(require,module,exports){
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

var utils     = require("./utils");

var Parser    = require('./rules_engine/parser');
var Evaluator = require('./rules_engine/evaluator');

/**
 * Language Context Rule
 *
 * @constructor
 * @param {object} attrs - options
 */
var LanguageContextRule = function(attrs) {
  utils.extend(this, attrs);
};

LanguageContextRule.prototype = {

  isFallback: function() {
    return (this.keyword == "other");
  },
  
  getConditionsExpression: function() {
    if (!this.conditions_expression)
      this.conditions_expression = (new Parser(this.conditions)).parse();
    return this.conditions_expression;
  },
  
  evaluate: function(vars) {
    if (this.isFallback()) return true;
  
    var evaluator = new Evaluator();
    evaluator.setVars(vars || {});
  
    return evaluator.evaluate(this.getConditionsExpression());
  }

};

module.exports = LanguageContextRule;
},{"./rules_engine/evaluator":41,"./rules_engine/parser":42,"./utils":54}],39:[function(require,module,exports){
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

var utils     = require("./utils");

/**
 * Logger
 */
var Logger = {

  formatDate: function(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ':' + seconds;
    return date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear() + ' ' + strTime;
  },

  log: function(msg, object) {
    var config = require("./configuration");
    if (!config.debug) return;
    // var output = this.formatDate(new Date()) + " tml: " + msg;
    var output = "tml: " + msg;
    if (object) output = output + " " +  JSON.stringify(object);
    console.log(output);
  },

  debug: function(msg, object) {
    this.log(msg, object);
  }

};

module.exports = Logger;
},{"./configuration":31,"./utils":54}],40:[function(require,module,exports){
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

/****************************************************************************
***
***  MD5 (Message-Digest Algorithm)
***  http://www.webtoolkit.info/javascript-md5.html
***
***  MD5 was developed by Professor Ronald L. Rivest in 1994. 
***  Its 128 bit (16 byte) message digest makes it a faster implementation than SHA-1.
****************************************************************************/

var MD5 = function (string) {
 
  function RotateLeft(lValue, iShiftBits) {
    return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
  }
 
  function AddUnsigned(lX,lY) {
    var lX4,lY4,lX8,lY8,lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
    if (lX4 & lY4) {
      return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      } else {
        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
      }
    } else {
      return (lResult ^ lX8 ^ lY8);
    }
  }
 
  function F(x,y,z) { return (x & y) | ((~x) & z); }
  function G(x,y,z) { return (x & z) | (y & (~z)); }
  function H(x,y,z) { return (x ^ y ^ z); }
  function I(x,y,z) { return (y ^ (x | (~z))); }
 
  function FF(a,b,c,d,x,s,ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
 
  function GG(a,b,c,d,x,s,ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
 
  function HH(a,b,c,d,x,s,ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
 
  function II(a,b,c,d,x,s,ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
 
  function ConvertToWordArray(string) {
    var lWordCount;
    var lMessageLength = string.length;
    var lNumberOfWords_temp1=lMessageLength + 8;
    var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
    var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
    var lWordArray=Array(lNumberOfWords-1);
    var lBytePosition = 0;
    var lByteCount = 0;
    while ( lByteCount < lMessageLength ) {
      lWordCount = (lByteCount-(lByteCount % 4))/4;
      lBytePosition = (lByteCount % 4)*8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount-(lByteCount % 4))/4;
    lBytePosition = (lByteCount % 4)*8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
    lWordArray[lNumberOfWords-2] = lMessageLength<<3;
    lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
    return lWordArray;
  }
 
  function WordToHex(lValue) {
    var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
    for (lCount = 0;lCount<=3;lCount++) {
      lByte = (lValue>>>(lCount*8)) & 255;
      WordToHexValue_temp = "0" + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
    }
    return WordToHexValue;
  }
 
  function Utf8Encode(string) {
    string = string.replace(/\r\n/g,"\n");
    var utftext = "";
 
    for (var n = 0; n < string.length; n++) {
 
      var c = string.charCodeAt(n);
 
      if (c < 128) {
        utftext += String.fromCharCode(c);
      }
      else if((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      }
      else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
 
    }
 
    return utftext;
  }
 
  var x=Array();
  var k,AA,BB,CC,DD,a,b,c,d;
  var S11=7, S12=12, S13=17, S14=22;
  var S21=5, S22=9 , S23=14, S24=20;
  var S31=4, S32=11, S33=16, S34=23;
  var S41=6, S42=10, S43=15, S44=21;
 
  string = Utf8Encode(string);
 
  x = ConvertToWordArray(string);
 
  a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
 
  for (k=0;k<x.length;k+=16) {
    AA=a; BB=b; CC=c; DD=d;
    a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
    d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
    c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
    b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
    a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
    d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
    c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
    b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
    a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
    d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
    c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
    b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
    a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
    d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
    c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
    b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
    a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
    d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
    c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
    b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
    a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
    d=GG(d,a,b,c,x[k+10],S22,0x2441453);
    c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
    b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
    a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
    d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
    c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
    b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
    a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
    d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
    c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
    b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
    a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
    d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
    c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
    b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
    a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
    d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
    c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
    b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
    a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
    d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
    c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
    b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
    a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
    d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
    c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
    b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
    a=II(a,b,c,d,x[k+0], S41,0xF4292244);
    d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
    c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
    b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
    a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
    d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
    c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
    b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
    a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
    d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
    c=II(c,d,a,b,x[k+6], S43,0xA3014314);
    b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
    a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
    d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
    c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
    b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
    a=AddUnsigned(a,AA);
    b=AddUnsigned(b,BB);
    c=AddUnsigned(c,CC);
    d=AddUnsigned(d,DD);
  }
 
  var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
 
  return temp.toLowerCase();
};

module.exports = MD5;
},{}],41:[function(require,module,exports){
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

var Evaluator = function(ctx) {
  this.vars = {};
  this.ctx = ctx || {

    'label'   : function(l, r)    { this.vars[l] = this.ctx[l] = r; return r; },
    'quote'   : function(expr)    { return expr; },
    'car'     : function(list)    { return list[1]; },
    'cdr'     : function(list)    { list.shift(); return list; },
    'cons'    : function(e, cell) { cell.unshift(e); return cell; },
    'eq'      : function(l, r)    { return (l == r); },
    'atom'    : function(a)       { return !(typeof a in {'object':1, 'array':1, 'function':1}); },
    'cond'    : function(c, t, f) { return (this.evaluate(c) ? this.evaluate(t) : this.evaluate(f)); },
  
    'set'     : function(l, r){ this.vars[l] = this.ctx[l] = r; return r; },

    '='       : function(l, r)    {return l == r; },                                                     // ['=', 1, 2]
    '!='      : function(l, r)    {return l != r; },                                                     // ['!=', 1, 2]
    '<'       : function(l, r)    {return l < r; },                                                      // ['<', 1, 2]
    '>'       : function(l, r)    {return l > r; },                                                      // ['>', 1, 2]
    '+'       : function(l, r)    {return l + r; },                                                      // ['+', 1, 2]
    '-'       : function(l, r)    {return l - r; },                                                      // ['-', 1, 2]
    '*'       : function(l, r)    {return l * r; },                                                      // ['*', 1, 2]
    '%'       : function(l, r)    {return l % r; },                                                      // ['%', 14, 10]
    'mod'     : function(l, r)    {return l % r; },                                                      // ['mod', '@n', 10]
    '/'       : function(l, r)    {return (l * 1.0) / r; },                                              // ['/', 1, 2]
    '!'       : function(expr)    {return !expr; },                                                      // ['!', ['true']]
    'not'     : function(val)     {return !val; },                                                       // ['not', ['true']]

    '&&'      : function()        {return Array.prototype.slice.call(arguments).every(this.evaluate.bind(this));},            // ['&&', [], [], ...]
    'and'     : function()        {return Array.prototype.slice.call(arguments).every(this.evaluate.bind(this));},            // ['and', [], [], ...]
    '||'      : function()        {return !!Array.prototype.slice.call(arguments).filter(this.evaluate.bind(this)).length;},  // ['||', [], [], ...]
    'or'      : function()        {return !!Array.prototype.slice.call(arguments).filter(this.evaluate.bind(this)).length;},  // ['or', [], [], ...]

    'if'      : function(c,t,f)   {return this.evaluate(c) ? this.evaluate(t) : this.evaluate(f);},      // ['if', 'cond', 'true', 'false']
    'let'     : function(l, r)    {this.vars[l] = r; return r;},                                         // ['let', 'n', 5]
    'true'    : function()        {return true; },                                                       // ['true']
    'false'   : function()        {return false; },                                                      // ['false']

    'date'    : function(date)    {return new Date(date); },                                             // ['date', '2010-01-01']
    'today'   : function()        {return new Date(); },                                                 // ['today']
    'time'    : function(expr)    {return new Date(expr); },                                             // ['time', '2010-01-01 10:10:05']
    'now'     : function()        {return Date.now(); },                                                 // ['now']

    'append'  : function(l, r)    {return String(r) + String(l); },                                      // ['append', 'world', 'hello ']
    'prepend' : function(l, r)    {return String(l) + String(r); },                                      // ['prepend', 'hello  ', 'world']

    'match'   : function(search, subject) {                                                             // ['match', /a/, 'abc']
      search = this._stringToRegexp(search);
      return !!subject.match(search);
    },

    'in'      : function(values, search) {                                                              // ['in', '1,2,3,5..10,20..24', '@n']
      var bounds, range = this._range;
      values = values
        .replace(/\s/g,'')
        .replace(/(\w+)\.\.(\w+)/g, function(x,f,l){
          bounds = range(f,l);
          bounds.push(l);
          return bounds.join();
        });
      return values
        .split(',')
        .indexOf(String(search)) != -1;
    },

    'within'  : function(values, search) {                                                             // ['within', '0..3', '@n']
      var 
        bounds = values.split('..').map(function(d){return parseInt(d);});
      return (bounds[0] <= search && search <= bounds[1]);
    },

    'replace' : function(search, replace, subject) {                                                  // ['replace', '/^a/', 'v', 'abc']
      search = this._stringToRegexp(search);
      return subject.replace(search, replace);
    },

    'count'   : function(list){                                                                       // ['count', '@genders']
      return (typeof(list) == "string" ? this.vars[list] : list).length;
    },

    'all'     : function(list, value) {                                                               // ['all', '@genders', 'male']
      list = (typeof(list) == "string") ? this.vars[list] : list;
      return (list instanceof Array) ? list.every(function(e){return e == value;}) : false;
    },
    
    'any'     : function(list, value) {                                                               // ['any', '@genders', 'female']
      list = (typeof(list) == "string") ? this.vars[list] : list;
      return (list instanceof Array) ? !!list.filter(function(e){return e == value;}) : false;
    }

  };
  return this;
};

Evaluator.prototype = {

  _range: function(start, end) {
    var 
      range = [],
      is_string = !String(start).match(/^\d+$/);

    start = (is_string) ? start.charCodeAt(0) : parseInt(start);
    end   = (is_string) ? end.charCodeAt(0)   : parseInt(end);

    while (end >= start) {
      range.push(is_string ? String.fromCharCode(start) : String(start));
      start += 1;
    }

    return range;
  },

  _stringToRegexp: function(str) {
    var re = new RegExp("^\/","g");
    if(!str.match(re)) {
      return new RegExp(str,"g");
    }
    str = str.replace(re, '');
    if (str.match(/\/i$/)) {
      str = str.replace(/\/i$/g, '');
      return new RegExp(str,"ig");
    }
    str = str.replace(/\/$/, '');
    return new RegExp(str,"g");
  },

  setVars: function(vars) {
    this.vars = vars;
  },

  getVars: function() {
    return this.vars;
  },

  apply: function(fn, args) {
    if (typeof this.ctx[fn] == 'function') {
      return this.ctx[fn].apply(this,args);
    }
    return this.ctx[fn];
  },

  evaluate: function(expr) {
    if (this.ctx.atom.call(this, expr)) {
      if (typeof expr == "string" && this.vars[expr]) return this.vars[expr];
      return (expr in this.ctx ? this.ctx[expr] : expr);
    }
    var 
      fn    = expr[0],
      args  = expr.slice(1);

    if(['quote','car','cdr','cond','if','&&','||','and','or','true','false','let','count','all','any'].indexOf(fn) == -1) {
      args = args.map(this.evaluate.bind(this));
    }
    return this.apply(fn,args);
  }
};

module.exports = Evaluator;

},{}],42:[function(require,module,exports){
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

var Parser = function(expression) {
  this.tokenize(expression);
};

Parser.prototype = {
  tokenize: function(expression) {
	  this.tokens = expression.match(/[()]|\w+|@\w+|[\+\-\!\|\=>&<\*\/%]+|\".*?\"|'.*?'/g);
  },

  parse: function() {
  	token = this.tokens.shift();
  	if (!token) return;
  	if (token == "(") return this.parseList();
  	if (token.match(/^['"].*/)) return token.slice(1, -1);
  	if (token.match(/\d+/)) return parseInt(token);
  	return String(token);
  },

  parseList: function() {
  	var list = [];
  	while (this.tokens.length > 0 && this.tokens[0] != ')')
  		list.push(this.parse());
  	this.tokens.shift();
  	return list;
  }
};

module.exports = Parser;
},{}],43:[function(require,module,exports){
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

var utils     = require("./utils");
var config    = require("./configuration");

var Translation     = require("./translation");

/**
 * Source
 *
 * @constructor
 * @param {object} attrs - options
 */
var Source = function(attrs) {
  utils.extend(this, attrs);

  this.key = utils.generateSourceKey(attrs.source);
  this.translations = {};
  this.ignored_keys = [];
};

Source.prototype = {

  isIgnoredKey: function(key) {
    return this.ignored_keys.indexOf(key) != -1;
  },

  getTranslations: function(locale, key) {
    if (!this.translations[locale]) return null;
    return this.translations[locale][key];
  },

  updateTranslations: function(locale, results) {
    this.ignored_keys = results && results.ignored_keys ? results.ignored_keys : [];
    results = results && results.results ? results.results : results;

    // check if results is an array
    // build keys from the label + description

    var keys = utils.keys(results);

    this.translations[locale] = this.translations[locale] || [];

    for (var i=0; i<keys.length; i++) {
      var key = keys[i];
      this.translations[locale][key] = [];

      var data = results[key];
      if (!utils.isArray(data) && data.translations)
        data = data.translations;

      for (var j=0; j<data.length; j++) {
        var translation = data[j];
        this.translations[locale][key].push(new Translation({
          locale:   translation.locale || locale,
          label:    translation.label,
          locked:   translation.locked,
          context:  translation.context
        }));
      }
    }
  }

};

module.exports = Source;
},{"./configuration":31,"./translation":51,"./utils":54}],44:[function(require,module,exports){

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

var utils               = require('./utils');
var config              = require('./configuration');
var logger              = require('./logger');

var Tml = {
  version             : '0.4.2',

  Application         : require('./application'),
  Language            : require('./language'),
  LanguageContext     : require('./language_context'),
  LanguageContextRule : require('./language_context_rule'),
  LanguageCase        : require('./language_case'),
  LanguageCaseRule    : require('./language_case_rule'),
  TranslationKey      : require('./translation_key'),
  Translation         : require('./translation'),
  Translator          : require('./translator'),
  Source              : require('./source'),
  DomTokenizer        : require('./tokenizers/dom'),

  ApiAdapterBase      : require('./api_adapters/base'),
  CacheAdapterBase    : require('./cache_adapters/base'),

  logger              : logger,
  utils               : utils,
  config              : config,
  scripts             : require('./helpers/scripts'),

  init: function(options) {
    utils.merge(config, options);
    config.initCache();
  },

  translate: function(label, description, tokens, options) {
    var language = this.application.getLanguage(config.current_locale);
    language = language || this.application.getLanguage(config.default_locale);
    return language.translate(label, description, tokens, options);
  },

  configure: function(callback) {
    callback(config);
  },

  cache: function(callback) {
    var data = config.cache.data || {};
    data.languages = data.languages || {};
    data.sources = data.sources || {};
    config.cache.data = data;
    callback(config.cache.data);
  }

};

module.exports = Tml;



},{"./api_adapters/base":26,"./application":28,"./cache_adapters/base":30,"./configuration":31,"./helpers/scripts":33,"./language":34,"./language_case":35,"./language_case_rule":36,"./language_context":37,"./language_context_rule":38,"./logger":39,"./source":43,"./tokenizers/dom":47,"./translation":51,"./translation_key":52,"./translator":53,"./utils":54}],45:[function(require,module,exports){
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

var config          = require('../configuration');

var DataToken       = require("../tokens/data");
var MethodToken     = require("../tokens/method");
var PipedToken      = require("../tokens/piped");

var DataTokenizer = function(label) {
  this.label = label;
  this.tokenize();
};

DataTokenizer.prototype = {

  tokenize: function() {
    this.tokens = [];
    var tokens = this.getSupportedTokens();

    var label = "" + this.label;
    for (var i=0; i<tokens.length; i++) {
      var token = tokens[i];
      var matches = label.match(token[0]) || [];
      for (var j=0; j<matches.length; j++) {
        this.tokens.push(new token[1](matches[j], this.label));
      }
      label = label.replace(tokens[i][0], "");
    }
  },

  getSupportedTokens: function() {
    //TODO: Add ability to overload the syntax from config
    //TODO: Add ability to override token syntax in config

    return [
      [/(%?\{{1,2}\s*\w*\s*(:\s*\w+)*\s*(::\s*\w+)*\s*\}{1,2})/g, DataToken],
      [/(%?\{{1,2}\s*[\w]*\.\w*\s*(:\s*\w+)*\s*(::\s*\w+)*\s*\}{1,2})/g, MethodToken],
      [/(%?\{{1,2}\s*[\w]*\s*(:\s*\w+)*\s*\|\|?[^\{\}\|]+\}{1,2})/g, PipedToken]
    ];
  },

  isTokenAllowed: function(token, options) {
    if (!options.allowed_tokens) return true;
    return (options.allowed_tokens.indexOf(token) != -1);
  },

  substitute: function(language, context, options) {
    options = options || {};
    var label = this.label;

    for (var i=0; i<this.tokens.length; i++) {
      var token = this.tokens[i];
      if (this.isTokenAllowed(token.name, options)) {
        label = token.substitute(label, context, language, options);
      }
    }
    return label;
  }

};

module.exports = DataTokenizer;
},{"../configuration":31,"../tokens/data":48,"../tokens/method":49,"../tokens/piped":50}],46:[function(require,module,exports){
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

var utils           = require('../utils');
var config          = require('../configuration');

var RESERVED_TOKEN       = "tml";
var RE_SHORT_TOKEN_START = "\\[[\\w]*:";                      // [link:
var RE_SHORT_TOKEN_END   = "\\]";                             // ]
var RE_LONG_TOKEN_START  = "\\[[\\w]*\\]";                    // [link]
var RE_LONG_TOKEN_END    = "\\[\\/[\\w]*\\]";                 // [/link]
var RE_HTML_TOKEN_START  = "<[^\\>]*>";                       // <link>
var RE_HTML_TOKEN_END    = "<\\/[^\\>]*>";                    // </link>
var RE_TEXT              = "[^\\[\\]<>]+";                    // anything that is left

var TOKEN_TYPE_SHORT     = "short";
var TOKEN_TYPE_LONG      = "long";
var TOKEN_TYPE_HTML      = "html";
var PLACEHOLDER          = "{$0}";

var DecorationTokenizer = function(label) {
  this.label =  "[" + RESERVED_TOKEN + "]" + label + "[/" + RESERVED_TOKEN + "]";
  this.fragments = [];
  this.tokens = [];
  this.tokenize();
};

DecorationTokenizer.prototype = {

  tokenize: function() {
    var expression = [
      RE_SHORT_TOKEN_START,
      RE_SHORT_TOKEN_END,
      RE_LONG_TOKEN_START,
      RE_LONG_TOKEN_END,
      RE_HTML_TOKEN_START,
      RE_HTML_TOKEN_END,
      RE_TEXT
    ].join("|");
    expression = new RegExp(expression, "g");
    this.fragments = this.label.match(expression);
    return this.fragments;
  },

  peek: function() {
    if (this.fragments.length === 0) return null;
    return this.fragments[0];
  },

  getNextFragment: function() {
    if (this.fragments.length === 0) return null;
    return this.fragments.shift();
  },

  parse: function() {
    var token = this.getNextFragment();
    if (token.match(new RegExp(RE_SHORT_TOKEN_START))) {
      return this.parseTree(token.replace(/[\[:]/g, ''), TOKEN_TYPE_SHORT);
    } else if (token.match(new RegExp(RE_LONG_TOKEN_START))) {
      return this.parseTree(token.replace(/[\[\]]/g, ''), TOKEN_TYPE_LONG);
    } else if (token.match(new RegExp(RE_HTML_TOKEN_START))) {
      if (token.indexOf("/>") != -1) return token;
      return this.parseTree(token.replace(/[<>]/g, '').split(' ')[0], TOKEN_TYPE_HTML);
    }
    return token;
  },

  parseTree: function(name, type) {
    var tree = [name];
    if (this.tokens.indexOf(name) == -1 && name != RESERVED_TOKEN)
      this.tokens.push(name);

    if (type == TOKEN_TYPE_SHORT) {
      var first = true;
      while (this.peek()!==null && !this.peek().match(new RegExp(RE_SHORT_TOKEN_END))) {
        var value = this.parse();
        if (first && typeof value == "string") {
          value = value.replace(/^\s+/,'');
          first = false;
        }
        tree.push(value);
      }
    } else if (type == TOKEN_TYPE_LONG) {
      while (this.peek()!==null && !this.peek().match(new RegExp(RE_LONG_TOKEN_END))) {
        tree.push(this.parse());
      }
    } else if (type == TOKEN_TYPE_HTML) {
      while (this.peek()!==null && !this.peek().match(new RegExp(RE_HTML_TOKEN_END))) {
        tree.push(this.parse());
      }
    }

    this.getNextFragment();
    return tree;
  },

  isTokenAllowed: function(token) {
    return (!this.options.allowed_tokens || this.options.allowed_tokens.indexOf(token) != -1);
  },

  getDefaultDecoration: function(token, value) {
    var default_decoration = config.getDefaultToken(token, "decoration");

    // need to think a bit more about this
    if (default_decoration === null) {
      return "<" + token + ">" + value + "</" + token + ">";
    }

    var decoration_token_values = this.context[token];
    default_decoration = default_decoration.replace(PLACEHOLDER, value);

    if (utils.isObject(decoration_token_values)) {
      var keys = utils.keys(decoration_token_values);
      for (var i = 0; i < keys.length; i++) {
        default_decoration = default_decoration.replace("{$" + keys[i] + "}", decoration_token_values[keys[i]]);
      }
      default_decoration = default_decoration.replace(/[\w]*=['"]\{\$[^\}]*\}['"]/g, "").replace(/\s*>/, '>').trim();
    }

    return default_decoration;
  },

  apply: function(token, value) {
    if (token == RESERVED_TOKEN) return value;
    if (!this.isTokenAllowed(token)) return value;

    var method = this.context[token];

    if (!!method) {
      if (typeof method === 'string')
        return method.replace(PLACEHOLDER, value);

      if (typeof method === 'function')
        return method(value);

      if (typeof method === 'object')
        return this.getDefaultDecoration(token, value);

      return value;
    }

    return this.getDefaultDecoration(token, value);
  },

  evaluate: function(expr) {
    if (!(expr instanceof Array)) return expr;

    var token = expr[0];
    expr.shift();
    var self = this;
    var value = [];
    for (var i=0; i<expr.length; i++) {
      value.push(self.evaluate(expr[i]));
    }
    return this.apply(token, value.join(''));
  },

  substitute: function(tokens, options) {
    this.context = tokens || {};
    this.options = options || {};

    // fix broken HTML tags
    var result = this.evaluate(this.parse());
    result = result.replace('[/tml]', '');
    return result;
  }

};


module.exports = DecorationTokenizer;
},{"../configuration":31,"../utils":54}],47:[function(require,module,exports){
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

var utils     = require("../utils");
var config    = require("../configuration");

var DomTokenizer = function(doc, context, options) {
  this.doc = doc;
  this.context = context || {};
  this.tokens = [];
  this.options = options || {};
};

DomTokenizer.prototype = {

  translate: function() {
    return this.translateTree(this.doc);
  },

  translateTree: function(node) {
    if (this.isNonTranslatableNode(node)) {
      //if (node.childNodes.length == 1)
      //  return node.childNodes[0].nodeValue;
      return node.innerHTML;
    }

    if (node.nodeType == 3)
      return this.translateTml(node.nodeValue);

    var html = "";
    var buffer = "";

    for(var i=0; i<node.childNodes.length; i++) {
      var child = node.childNodes[i];

      //    console.log("Translating: " + child.nodeType + " " + child.nodeName);

      if (child.nodeType == 3) {
        buffer = buffer + child.nodeValue;
      } else if (this.isInlineNode(child) && this.hasInlineOrTextSiblings(child) && !this.isBetweenSeparators(child)) {  // inline nodes - tml
        buffer = buffer + this.generateTmlTags(child);
      } else if (this.isSeparatorNode(child)) {    // separators:  br or hr
        if (buffer !== '')
          html = html + this.translateTml(buffer);
        html = html + this.generateHtmlToken(child);
        buffer = "";
      } else {
        if (buffer !== '')
          html = html + this.translateTml(buffer);

        var containerValue = this.translateTree(child);
        if (this.isIgnoredNode(child)) {
          html = html + containerValue;
        } else {
          html = html + this.generateHtmlToken(child, containerValue);
        }

        buffer = "";
      }
    }

    if (buffer !== '') {
      html = html + this.translateTml(buffer);
    }

    return html;
  },

  isNoTranslate: function(node) {
    if (node.attributes) {
      for (var i = 0; i < node.attributes.length; i++) {
        if (node.attributes[i].name == 'notranslate')
          return true;
        if (node.attributes[i].name == 'class' && node.attributes[i].value.indexOf("notranslate") != -1)
          return true;
      }
    }

    return false;
  },

  isNonTranslatableNode: function(node) {
    if (!node) return false;

    if (node.nodeType == 8) return true;

    if (node.nodeType == 1) {
      if (this.getOption("nodes.scripts").indexOf(node.nodeName.toLowerCase()) != -1)
        return true;

      if (node.childNodes.length === 0 && node.nodeValue === '')
        return true;

      if (this.isNoTranslate(node))
        return true;
    }

    return false;
  },

  translateTml: function(tml) {
    if (this.isEmptyString(tml)) return tml;

    tml = this.generateDataTokens(tml);

    var current_language = this.options.current_language || config.currentLanguage;

    if (this.getOption("split_sentences")) {
      sentences = utils.splitSentences(tml);
      translation = tml;
      var self = this;
      sentences.forEach(function(sentence) {
        var sentenceTranslation = self.getOption("debug") ? self.debugTranslation(sentence) : current_language.translate(sentence, self.tokens, self.options);
        translation = translation.replace(sentence, sentenceTranslation);
      });
      this.resetContext();
      return translation;
    }

    tml = tml.replace(/[\n]/g, '').replace(/\s\s+/g, ' ').trim();

    //console.log(tml);
    //console.log(this.tokens);

    translation = this.getOption("debug") ? this.debugTranslation(tml) : current_language.translate(tml, this.tokens, this.options);
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
    var buffer = "";
    var self = this;

    if (this.isNoTranslate(node)) {
      var tokenName = this.contextualize(this.adjustName(node), node.innerHTML);
      return "{" + tokenName + "}";
    }

    var name = node.tagName.toLowerCase();
    if (name == 'var') {
      return this.registerDataTokenFromVar(node);
    }

    for(var i=0; i<node.childNodes.length; i++) {
      var child = node.childNodes[i];
      if (child.nodeType == 3)                    // text node
        buffer = buffer + child.nodeValue;
      else
        buffer = buffer + self.generateTmlTags(child);
    }
    var tokenContext = self.generateHtmlToken(node);
    var token = this.contextualize(this.adjustName(node), tokenContext);

    var value = this.sanitizeValue(buffer);

    if (this.isSelfClosingNode(node))
      return '{' + token + '}';

    if (this.isShortToken(token, value))
      return '[' + token + ': ' + value + ']';

    return '[' + token + ']' + value + '[/' + token + ']';
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

  hasInlineOrTextSiblings: function(node) {
    if (!node.parentNode) return false;

    for (var i=0; i < node.parentNode.childNodes.length; i++) {
      var child = node.parentNode.childNodes[i];
      if (child != node) {
        if (this.isInlineNode(child) || this.isValidTextNode(child))
          return true;
      }
    }

    return false;
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
      if (this.hasInlineOrTextSiblings(node))
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
},{"../configuration":31,"../utils":54}],48:[function(require,module,exports){
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

var utils           = require('../utils');
var logger          = require('../logger');
var config          = require('../configuration');
var decorator       = require('../decorators/html');

/**
 * Tokens.Data
 *
 * @description
 * Data token
 *
 * @constructor
 * @param name
 * @param label
 */

var DataToken = function(name, label) {
  if (!name) return;
  this.full_name = name;
  this.label = label;
  this.parseElements();
};

DataToken.prototype = {

  /**
   *  parseElements
   */
  parseElements: function() {
    var name_without_parens = this.full_name.replace(/[%\{\}]/g, "").trim();
    var name_without_case_keys = name_without_parens.split('::')[0].trim();
  
    this.short_name = name_without_parens.split(':')[0].trim();
    this.case_keys = [];

    var keys = name_without_parens.match(/(::\s*\w+)/g) || [];
    for (var i=0; i<keys.length; i++) {
      this.case_keys.push(keys[i].replace(/[:]/g, "").trim());
    }

    this.context_keys = [];
    keys = name_without_case_keys.match(/(:\s*\w+)/g) || [];
    for (i=0; i<keys.length; i++) {
      this.context_keys.push(keys[i].replace(/[:]/g, "").trim());
    }
  },

  /**
   * getContextForLanguage
   *
   * @param language
   * @returns {*}
   */
  getContextForLanguage: function(language) {
    if (this.context_keys.length > 0)
      return language.getContextByKeyword(this.context_keys[0]);
  
    return language.getContextByTokenName(this.short_name);
  },

  /**
   * tokenObject
   *
   * @param tokens
   * @param name
   * @returns {*}
   */
  getTokenObject: function(tokens, name) {
    if (!tokens) return null;

    name = name || this.short_name;

    var object = tokens[name];
    if (utils.isArray(object))
      return object[0];
  
    return object && object.object || object;
  },

  /**
   * error
   *
   * @param msg
   * @returns {*}
   */
  error: function(msg) {
    // console.log(this.full_name + " in \"" + this.label + "\" : " + msg);
    return this.full_name;
  },
  
  /**
   * getTokenValueFromArrayParam
   *
   * @description
   * gets the value based on various evaluation methods
   *
   * @example
   *
   * tr("Hello {user}", {user: [{name: "Michael", gender: "male"}, "Michael"]}}
   * tr("Hello {user}", {user: [{name: "Michael", gender: "male"}, function(text) { return tr(text); }]}}
   *
   */
  
  getTokenValueFromArrayParam: function(arr, language, options) {
    options = options || {};
    if (arr.length === 0)
      return this.error("Invalid number of params of an array");
  
    var object = arr[0];
    var method = arr.length > 1 ? arr[1] : null;

    if (utils.isArray(object))
      return this.getTokenValueFromArray(arr, language, options);

    if (method && utils.isFunction(method)) {
      return this.sanitize(method(object), object, language, utils.extend(options, {safe: true}));
    }

    if (!method)
      return this.sanitize("" + object, object, language, utils.extend(options, {safe: false}));

    return this.sanitize(method.toString(), object, language, utils.extend(options, {safe: true}));
  },
  
  
  /**
   * getTokenValueFromHashParam
   *
   * @example
   *
   * tr("Hello {user}", {user: {value: "Michael", gender: "male"}}}
   * tr("Hello {user}", {user: {object: {gender: "male"}, value: "Michael"}}}
   * tr("Hello {user}", {user: {object: {name: "Michael", gender: "male"}, property: "name"}}}
   * tr("Hello {user}", {user: {object: {name: "Michael", gender: "male"}, attribute: "name"}}}
   * tr("Hello {user}", {user: {object: {name: "Michael", gender: "male"}, method: ()}}}
   *
   */
  
  getTokenValueFromHashParam: function(hash, language, options) {
    options = options || {};
    var value = hash.value || hash.name || hash.first_name || hash.username;
    var method = hash.method;
    var object = hash.object;

    if (method && utils.isFunction(method)) {
      return this.sanitize(method(object), object, language, utils.extend(options, {safe: true}));
    }

    if (value)
      return this.sanitize(value, object || hash, language, utils.extend(options, {safe: true}));

    if (!object)
      return this.sanitize(hash.toString(), object, language, utils.extend(options, {safe: false}));

    var attr = hash.attribute;
  
    if (!attr) return this.error("Missing value for hash token");
  
    return this.sanitize(object[attr], object, language, utils.extend(options, {safe: false}));
  },
  
  
  /**
   * getTokenValueFromArray
   *
   * @description
   * first element is an array, the rest of the elements are similar to the
   * regular tokens lambda, symbol, string, with parameters that follow
   *
   * if you want to pass options, then make the second parameter an array as well
   *
   * @example
   *
   * tr("Hello {user_list}!", {user_list: [[user1, user2, user3], "{$0}", {}]}}
   * tr("{users} joined the site", {users: [[user1, user2, user3], "@name"]})
   * tr("{users} joined the site", {users: [[user1, user2, user3], function(user) { return tr(user.name); }]})
   * tr("{users} joined the site", {users: [[user1, user2, user3], {attribute: "name"})
   * tr("{users} joined the site", {users: [[user1, user2, user3], {attribute: "name", value: "<strong>{$0}</strong>"})
   * tr("{users} joined the site", {users: [[user1, user2, user3], "<strong>{$0}</strong>")

   var user_func = function(user) {}

   tokens = {users: [someArr]}

   <p tml-tr users="someArr" users-format='{attribute: "name"}' users-options=''>
      {users} joined the site
   </p>

   * tr("{count || message}", {user: [1234, function(value) { return tml_localize(value); }]})
   *
   * tr("{users} joined the site", {users: [[user1, user2, user3], "@name", {
   *   limit: 4,
   *   separator: ', ',
   *   joiner: 'and',
   *   remainder: function(elements) { return tr("{count||other}", count: elements.size); },
   *   expandable: true,
   *   collapsable: true
   * })
   *
   */
  
  getTokenValueFromArray: function(params, language, options) {
    var list_options = {
      description: "List joiner",
      limit: 4,
      separator: ", ",
      joiner: 'and',
      less: '{laquo} less',
      translate: false,
      expandable: false,
      collapsable: true
    };

    options = options || {};
    var objects = params[0];
    var method = (params.length > 1 ? params[1] : null);
  
    if (params.length > 2)
      list_options = utils.extend(list_options, params[2]);
  
    if (options.skip_decorations)
      list_options.expandable = false;

    var target_language = options.target_language || language;

    var values = [];
    var value;
    for (var i=0; i<objects.length; i++) {
      var obj = objects[i];
      if (method === null) {
        value = this.getTokenValueFromHashParam(obj, language, options);

        if (list_options.translate && target_language)
          value = target_language.translate(value, '', {}, options);

        values.push(decorator.decorateElement(this, value, options));
      } else if (utils.isFunction(method)) {
        values.push(decorator.decorateElement(this, this.sanitize(method(obj), obj, language, utils.extend(options, {safe: true})), options));

      } else if (typeof method === "string") {
        if (method.match(/^@/)) {
          var attr = method.replace(/^@/, "");
          value = obj[attr] || obj[attr]();

          if (list_options.translate && target_language)
            value = target_language.translate(value, '', {}, options);

          values.push(decorator.decorateElement(this, this.sanitize(value, obj, language, utils.extend(options, {safe: false})), options));
        } else {
          value = "" + obj;

          if (list_options.translate && target_language)
            value = target_language.translate(value, '', {}, options);

          values.push(decorator.decorateElement(this, method.replace("{$0}", this.sanitize(value, obj, language, utils.extend(options, {safe: false}))), options));
        }
      } else if (utils.isObject(method)) {
        var attribute = method.attribute || method.property;

        if (attribute && obj[attribute]) {
          attribute = this.sanitize(obj[attribute], obj, language, utils.extend(options, {safe: false}));

          if (list_options.translate && target_language)
            attribute = target_language.translate(attribute, '', {}, options);

          if (method.value)
            values.push(decorator.decorateElement(this, method.value.replace("{$0}", attribute), options));
          else
            values.push(decorator.decorateElement(this, attribute || "" + obj, options));
        } else {
          value = this.getTokenValueFromHashParam(obj, language, options);

          if (list_options.translate && target_language)
            value = target_language.translate(value, '', {}, options);

          values.push(decorator.decorateElement(this, value, options));
        }
      }
    }
  
    if (values.length == 1)
      return values[0];
  
    if (!list_options.joiner || list_options.joiner === "")
      return values.join(list_options.separator);

    var joiner = target_language.translate(list_options.joiner, list_options.description, {}, options);
  
    if (values.length <= list_options.limit) {
      var last = values.pop();
      return values.join(list_options.separator) + " " + joiner + " " + last;
    }
  
    var displayed_values = values.slice(0, list_options.limit);
    var remaining_values = values.slice(list_options.limit);

    var result = displayed_values.join(list_options.separator);
    var other_values = target_language.translate("{count || other}", list_options.description, {count: remaining_values.length}, options);
  
    if (!list_options.expandable) {
      result = result + " " + joiner + " ";
      if (utils.isFunction(list_options))
        return result + list_options.remainder(remaining_values);
      return result + other_values;
    }
  
    var key = list_options.key ? list_options.key : utils.generateKey(this.label, values.join(","));
  
    result = result + '<span id="tml_other_link_' + key + '"> ' + joiner + ' ';
    result = result + '<a href="#" class="tml_other_list_link" onClick="' + "document.getElementById('tml_other_link_" + key + "').style.display='none'; document.getElementById('tml_other_elements_" + key + "').style.display='inline'; return false;" + '">';
  
    if (list_options.remainder && typeof list_options.remainder === "function")
      result = result + list_options.remainder(remaining_values);
    else
      result = result + other_values;
  
    result = result + "</a></span>";
  
    result = result + '<span id="tml_other_elements_' + key + '" style="display:none">' + list_options.separator;
    var last_remaining = remaining_values.pop();
    result = result + remaining_values.join(list_options.separator);
    result = result + " " + joiner + " " + last_remaining;
  
    if (list_options.collapsable) {
      result = result + ' <a href="#" class="tml_other_less_link" style="font-size:smaller;white-space:nowrap" onClick="' + "document.getElementById('tml_other_link_" + key + "').style.display='inline'; document.getElementById('tml_other_elements_" + key + "').style.display='none'; return false;" + '">';
      result = result + target_language.translate(list_options.less, list_options.description, {}, options);
      result = result + "</a>";
    }
  
    result = result + "</span>";
    return result;
  },
  
  getTokenValue: function(tokens, language, options) {
    tokens = tokens || {};
    options = options || {};

    var hasToken = (this.short_name in tokens);

    var object = hasToken ? tokens[this.short_name] : config.getDefaultToken(this.short_name);
    if (typeof object === 'undefined' || object === null) return this.error("Missing token value");

    if (typeof object == "string")
      return this.sanitize(object.toString(), object, language, utils.extend(options, {safe: true}));

    if (utils.isArray(object))
      return this.getTokenValueFromArrayParam(object, language, options);

    if (utils.isObject(object))
      return this.getTokenValueFromHashParam(object, language, options);

    return this.sanitize(object.toString(), object, language, utils.extend(options, {safe: false}));
  },
  
  applyCase: function(key, value, object, language, options) {
    var lcase = language.getLanguageCaseByKeyword(key);
    if (!lcase) return value;
    return lcase.apply(value, object, options);
  },
  
  sanitize: function(value, object, language, options) {
    options = options || {};
    value = "" + value;

    if (!options.safe) value = utils.escapeHTML(value);

    if (this.case_keys.length > 0) {
      for (var i=0; i<this.case_keys.length; i++) {
        value = this.applyCase(this.case_keys[i], value, object, language, options);
      }
    }
  
    return value;
  },
  
  substitute: function(label, tokens, language, options) {
    return label.replace(this.full_name, decorator.decorateToken(this, this.getTokenValue(tokens, language, options), options));
  },

  getDecorationName: function() {
    return 'data';
  }
  
};

module.exports = DataToken;
},{"../configuration":31,"../decorators/html":32,"../logger":39,"../utils":54}],49:[function(require,module,exports){
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

var utils           = require('../utils');
var decorator       = require('../decorators/html');

var DataToken       = require('./data');

var MethodToken = function(name, label) {
  if (!name) return;
  this.full_name = name;
  this.label = label;
  this.parseElements();
  this.initObject();
};

MethodToken.prototype = new DataToken();
MethodToken.prototype.constructor = MethodToken;

MethodToken.prototype.initObject = function() {
  var parts = this.short_name.split('.');
  this.short_name = parts[0];
  this.object_method = parts[1];
};

MethodToken.prototype.getTokenValue = function(tokens, language, options) {
  tokens = tokens || {};

  var object = tokens[this.short_name];
  if (!object) return this.error("Missing token value");

  var value;
  if (utils.isFunction(object[this.object_method])) {
    value = object[this.object_method]();
  }
  else {
    value = object[this.object_method];
  }

  return value;
};

MethodToken.prototype.substitute = function(label, tokens, language, options) {
  return label.replace(this.full_name,
    decorator.decorateToken(this, this.sanitize(
        this.getTokenValue(tokens),
        this.getTokenObject(tokens),
        language,
        utils.extend(options, {safe: false})
      ),
      options
    )
  );
};

MethodToken.prototype.getDecorationName = function() {
  return 'method';
};

module.exports = MethodToken;


},{"../decorators/html":32,"../utils":54,"./data":48}],50:[function(require,module,exports){
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

/**
 * Piped Token Form
 *
 * {count:number || one: message, many: messages}
 * {count:number || one: сообщение, few: сообщения, many: сообщений, other: много сообщений}
 * in other case the number is not displayed*
 *
 * {count | message}   - will not include {count}, resulting in "messages" with implied {count}
 * {count | message, messages}
 *
 * {count:number | message, messages}
 *
 * {user:gender | he, she, he/she}
 *
 * {user:gender | male: he, female: she, other: he/she}
 *
 * {now:date | did, does, will do}
 * {users:list | all male, all female, mixed genders}
 *
 * {count || message, messages}  - will include count:  "5 messages"
 *
 * Dear {user} => {user <- Дорогой, Дорогая}
 * {user} uploaded => {user -> загрузил, загрузила}
 *
 */

var utils           = require('../utils');
var decorator       = require('../decorators/html');

var DataToken       = require('./data');

var PipedToken = function(name, label) {
  if (!name) return;
  this.full_name = name;
  this.label = label;
  this.parseElements();
};

PipedToken.prototype = new DataToken();
PipedToken.prototype.constructor = PipedToken;

PipedToken.prototype.parseElements = function() {
  var name_without_parens = this.full_name.replace(/[%\{\}]/g, "").trim();

  var parts = name_without_parens.split('|');
  var name_without_pipes = parts[0].trim();

  this.short_name = name_without_pipes.split(':')[0].trim();

  this.case_keys = [];
  var keys = name_without_pipes.match(/(::\s*\w+)/g) || [];
  for (var i=0; i<keys.length; i++) {
    this.case_keys.push(keys[i].replace(/[:]/g, "").trim());
  }

  this.context_keys = [];
  var name_without_case_keys = name_without_pipes.split('::')[0].trim();
  keys = name_without_case_keys.match(/(:\s*\w+)/g) || [];
  for (i=0; i<keys.length; i++) {
    this.context_keys.push(keys[i].replace(/[:]/g, "").trim());
  }

  this.separator = (this.full_name.indexOf("||") != -1 ? '||' : '|');

  this.parameters = [];
  parts = name_without_parens.split(this.separator);
  if (parts.length > 1) {
    parts = parts[1].split(',');
    for (i=0; i<parts.length; i++) {
      this.parameters.push(parts[i].trim());
    }
  }
};

PipedToken.prototype.isValueDisplayedInTranslation = function() {
  return (this.separator == '||');
};

/**
* token:      {count|| one: message, many: messages}
* results in: {"one": "message", "many": "messages"}
*
* token:      {count|| message}
* transform:  [{"one": "{$0}", "other": "{$0::plural}"}, {"one": "{$0}", "other": "{$1}"}]
* results in: {"one": "message", "other": "messages"}
*
* token:      {count|| message, messages}
* transform:  [{"one": "{$0}", "other": "{$0::plural}"}, {"one": "{$0}", "other": "{$1}"}]
* results in: {"one": "message", "other": "messages"}
*
* token:      {user| Dorogoi, Dorogaya}
* transform:  ["unsupported", {"male": "{$0}", "female": "{$1}", "other": "{$0}/{$1}"}]
* results in: {"male": "Dorogoi", "female": "Dorogaya", "other": "Dorogoi/Dorogaya"}
*
* token:      {actors:|| likes, like}
* transform:  ["unsupported", {"one": "{$0}", "other": "{$1}"}]
* results in: {"one": "likes", "other": "like"}
*
*
*/

PipedToken.prototype.generateValueMapForContext = function(context) {
  var values = {}, i, j;

  if (this.parameters[0].indexOf(':') != -1) {
    for (i=0; i<this.parameters.length; i++) {
      var name_value = this.parameters[i].split(":");
      values[name_value[0].trim()] = name_value[1].trim();
    }
    return values;
  }

  var token_mapping = context.token_mapping;

  if (!token_mapping) {
    this.error("The token context " + context.keyword + "does not support transformation for unnamed params");
    return null;
  }

  // "unsupported"
  if (typeof token_mapping === "string") {
    this.error("The token mapping " + token_mapping + " does not support the parameters.");
    return null;
  }

  // ["unsupported", {}]
  if (utils.isArray(token_mapping)) {
    if (this.parameters.length > token_mapping.length) {
      this.error("The token mapping " + token_mapping + " does not support " + this.parameters.length + " parameters");
      return null;
    }

    token_mapping = token_mapping[this.parameters.length-1];

    if (typeof token_mapping === "string") {
      this.error("The token mapping " + token_mapping + " does not support " + this.parameters.length + " parameters");
      return null;
    }
  }

  // {}
  var keys = utils.keys(token_mapping);

  for (i=0; i<keys.length; i++) {
    var key = keys[i];
    var value = token_mapping[key];

    values[key] = value;

    // token form {$0::plural} - number followed by language cases

    var internal_keys = value.match(/{\$\d(::[\w]+)*\}/g) || [];

    for (j=0; j<internal_keys.length; j++) {
      var token = internal_keys[j];
      var token_without_parens = token.replace(/[\{\}]/g, '');
      var parts = token_without_parens.split('::');
      var index = parseInt(parts[0].replace(/[$]/, ''));

      if (this.parameters.length < index) {
        this.error("The index inside " + token_mapping + " is out of bound: " + this.full_name);
        return null;
      }

      var val = this.parameters[index];

      parts.shift();
      for (var k=0; k<parts.length; k++) {
        var language_case = context.language.getLanguageCaseByKeyword(parts[k]);
        if (language_case) val = language_case.apply(val);
      }

      values[key] = values[key].replace(internal_keys[j], val);
    }
  }

  return values;
};

PipedToken.prototype.substitute = function(label, tokens, language, options) {
  if (!(this.short_name in tokens)) {
    this.error("Missing value");
    return label;
  }

  var object = this.getTokenObject(tokens);

  if (this.parameters.length === 0) {
    this.error("Piped params may not be empty");
    return label;
  }

  var context = this.getContextForLanguage(language);

  var piped_values = this.generateValueMapForContext(context);

  if (!piped_values) return label;

  var rule = context.findMatchingRule(object);

  if (rule === null) return label;

  var value = piped_values[rule.keyword];
  if (!value) {
    var fallback_rule = context.getFallbackRule();
    if (fallback_rule && piped_values[fallback_rule.keyword]) {
      value = piped_values[fallback_rule.keyword];
    } else {
      this.error("No matching context rule found and no fallback provided");
      return label;
    }
  }

  var token_value = [];
  var decorated_token = decorator.decorateToken(this, this.getTokenValue(tokens, language, options), options);

  if (this.isValueDisplayedInTranslation()) {
    token_value.push(decorated_token);
    token_value.push(" ");
  } else {
    value = value.replace("#" + this.short_name + "#", decorated_token);
  }
  token_value.push(value);

  return label.replace(this.full_name, token_value.join(""));
};

PipedToken.prototype.getDecorationName = function() {
  return 'piped';
};

module.exports = PipedToken;


},{"../decorators/html":32,"../utils":54,"./data":48}],51:[function(require,module,exports){
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

var utils           = require('./utils');

var DataToken       = require('./tokens/data');

/**
 * Translation
 *
 * @constructor
 * @param {object} attrs - options
 */
var Translation = function(attrs) {
  utils.extend(this, attrs);
  if (attrs.language)
    this.locale = attrs.language.locale;
};

Translation.prototype = {

  hasContextRules: function() {
    return (this.context && utils.keys(this.context).length > 0);
  },

  isValidTranslation: function(tokens) {
    if (!this.hasContextRules())
      return true;

    var token_names = utils.keys(this.context);
    for(var i=0; i<token_names.length; i++) {
      var token_name = token_names[i];
      var rules = this.context[token_name];
      var object = DataToken.prototype.getTokenObject(tokens, token_name);

      if (!object) return false;

      var rule_keys = utils.keys(rules);

      for(var j=0; j<rule_keys.length; j++) {
        var context_key = rule_keys[j];
        var rule_key = rules[rule_keys[j]];

        if (rule_key != "other") {
          var context = this.language.getContextByKeyword(context_key);
          if (!context) return false; // unsupported context type

          var rule = context.findMatchingRule(object);
          if (!rule || rule.keyword != rule_key)
            return false;
        }
      }
    }

    return true;
  }

};

module.exports = Translation;



},{"./tokens/data":48,"./utils":54}],52:[function(require,module,exports){
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

var utils     = require("./utils");
var config    = require("./configuration");

var Translation         = require("./translation");
var HTMLDecorator       = require("./decorators/html");
var DataTokenizer       = require("./tokenizers/data");
var DecorationTokenizer = require("./tokenizers/decoration");

/**
 * Translation Key
 *
 * @constructor
 * @param {object} attrs - options
 */
var TranslationKey = function(attrs) {
  utils.extend(this, attrs);

  this.key = this.key || utils.generateKey(this.label, this.description);

  if (!this.locale && this.application)
      this.locale = this.application.default_locale;

  if (!this.language && this.application)
    this.language = this.application.getLanguage(this.locale);

  this.translations = {};
  this.addTranslations(attrs.translations || {});
};

TranslationKey.prototype = {

  addTranslations: function(translations_by_locale) {
    var locales = utils.keys(translations_by_locale);
    for (var i=0; i<locales.length; i++) {
      var locale = locales[i];
      var translations = translations_by_locale[locale];
      for (var j=0; j<translations.length; j++) {
        var translation = translations[j];
        this.addTranslation(new Translation(utils.extend(translation, {
          language: this.application.getLanguage(translation.locale),
          translation_key: this
        })));
      }
    }
  },

  addTranslation: function(translation) {
    var translations = this.translations[translation.locale];
    if (!translations) translations = [];
    translations.push(translation);
    this.translations[translation.locale] = translations;
  },

  setTranslations: function(locale, translations) {
    this.translations[locale] = [];

    for (var i=0; i<translations.length; i++) {
      var translation = translations[i];
      translation.translation_key = this;
      translation.language = this.application.getLanguage(translation.locale);
      this.translations[locale].push(translation);
    }
  },

  resetTranslations: function() {
    this.translations = {};
  },

  getTranslationsForLanguage: function(language) {
    if (!this.translations) return [];
    return (this.translations[language.locale] || []);
  },

  findFirstValidTranslation: function(language, tokens) {
    var translations = this.getTranslationsForLanguage(language);

    for(var i=0; i<translations.length; i++) {
      if (translations[i].isValidTranslation(tokens))
        return translations[i];
    }

    return null;
  },

  translate: function(language, tokens, options) {
    options = options || {};

    if (config.isDisabled())
      return this.substituteTokens(this.label, tokens, language, options);

    var translation = this.findFirstValidTranslation(language, tokens);
    var decorator = HTMLDecorator;

    if (translation) {
      options.locked = translation.locked;
      return decorator.decorate(
        this.substituteTokens(translation.label, tokens, translation.language, options),
        translation.language,
        language,
        this,
        options
      );
    }

    // if translation key has sub-translations, they should use the target language
    // like in the case of list joiners, etc...
    options.target_language = language;

    return decorator.decorate(
      this.substituteTokens(this.label, tokens, this.language || language, options),
      this.language || language,
      language,
      this, options
    );
  },

  getDataTokens: function() {
    if (!this.data_tokens) {
      var tokenizer = new DataTokenizer(this.label);
      this.data_tokens = tokenizer.tokens;
    }
    return this.data_tokens;
  },

  getDataTokenNames: function() {
    if (!this.data_token_names) {
      this.data_token_names = [];
      for (var token in this.getDataTokens())
        this.data_token_names.push(token.full_name);
    }
    return this.data_token_names;
  },

  getDecorationTokenNames: function() {
    if (!this.decoration_tokens) {
      var tokenizer = new DecorationTokenizer(this.label);
      tokenizer.parse();
      this.decoration_tokens = tokenizer.tokens;
    }
    return this.decoration_tokens;
  },

  substituteTokens: function(label, tokens, language, options) {
    var tokenizer;

    if (label.indexOf('[') != -1 || label.indexOf('<') != -1) {
      tokenizer = new DecorationTokenizer(label);
      label = tokenizer.substitute(tokens, utils.extend(options, {allowed_tokens: this.getDecorationTokenNames()}));
    }

    if (label.indexOf('{') != -1) {
      tokenizer = new DataTokenizer(label);
      label = tokenizer.substitute(language, tokens, utils.extend(options, {allowed_tokens: this.getDataTokenNames()}));
    }

    return label;
  }

};

module.exports = TranslationKey;


},{"./configuration":31,"./decorators/html":32,"./tokenizers/data":45,"./tokenizers/decoration":46,"./translation":51,"./utils":54}],53:[function(require,module,exports){
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

var utils = require('./utils');

/**
 * Translator
 *
 * @constructor
 * @param {object} attrs - options
 */
var Translator = function(attrs) {
  utils.extend(this, attrs);
};

Translator.prototype = {

  isFeatureEnabled: function (name) {
    return (this.features && this.features[name]);
  }

};

module.exports = Translator;

},{"./utils":54}],54:[function(require,module,exports){
(function (Buffer){
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

var md5 = require('./md5');

module.exports = {

  /**
   * hashValue
   *
   * @param {object} hash - hash to look for data
   * @param {string} key - dot separated nested key
   * @param {string} default_value - value to be returned if nothing is found
   */
  hashValue: function(hash, key, default_value) {
    default_value = default_value || null;
    var parts = key.split(".");
    for(var i=0; i<parts.length; i++) {
      var part = parts[i];
      if (typeof hash[part] === "undefined") return default_value;
      hash = hash[part];
    }
    return hash;
  },
  
  stripTags: function(input, allowed) {
    allowed = (((allowed || '') + '')
      .toLowerCase()
      .match(/<[a-z][a-z0-9]*>/g) || [])
      .join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
      commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '')
      .replace(tags, function($0, $1) {
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
      });
  },

  escapeHtml: function(label) {
    return label
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  sanitizeString: function(string) {
    if (!string) return "";
    return string.replace(/^\s+|\s+$/g,"");
  },

  splitSentences: function(text) {
    var sentenceRegex = /[^.!?\s][^.!?]*(?:[.!?](?![\'"]?\s|$)[^.!?]*)*[.!?]?[\'"]?(?=\s|$)/g;
    return text.match(sentenceRegex);
    //return this.stripTags(text).match(sentenceRegex);
  },
  
  unique: function(elements) {
    return elements.reverse().filter(function (e, i, arr) {
      return arr.indexOf(e, i+1) === -1;
    }).reverse();
  },
  
  clone: function(obj) {
    if(obj === null || typeof obj == 'undefined' || typeof(obj) != 'object')
      return obj;
  
    var temp = obj.constructor(); // changed
  
    for(var key in obj)
      temp[key] = clone(obj[key]);
    return temp;
  },
  
  keys: function(obj) {
  //  var keys = []; for (k in obj) {keys.push(k)}
  //  return keys;
    return Object.keys(obj);
  },

  generateSourceKey: function(label) {
    if (this.isFunction(label)){
      label = label();
    }
    return md5(label);
  },

  generateKey: function(label, description) {
    description = description || "";
    return md5(label + ";;;" + description);
  },

  escapeHTML: function(str) {
    return str.replace(/[&<>]/g, function(tag) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
      }[tag] || tag;
    });
  },

  encode: function(params) {
    if (!params) return null;
    var data = new Buffer(JSON.stringify(params), 'utf-8').toString('base64');
    return encodeURIComponent(data);
  },

  decode: function(data) {
    if (!data) return null;
    try {
      return JSON.parse(new Buffer(decodeURIComponent(data), 'base64').toString('utf-8'));
    } catch (err) {
      // for backwards compatibility - some SDKs were doing double encoding
      return JSON.parse(new Buffer(decodeURIComponent(decodeURIComponent(data)), 'base64').toString('utf-8'));
    }
  },

  normalizeSource: function(url) {
    var parts = url.split("?");
    return parts[0];
  },

  normalizeParams: function(label, description, tokens, options) {
    if (typeof label === "object") {
      return label;
    }

    if (typeof description !== "string") {
      options     = tokens || {};
      tokens      = description || {};
      description = '';
    }

    options = options || {};

    return {
      label: label,
      description: description,
      tokens: tokens,
      options: options
    };
  },

  normalizePath: function(path) {
    return (path[0] == '/' ? '' : '/') + path;
  },

  assign: function(destination, source, deep) {  
    for (var key in source) {
      if (hasOwnProperty.call(source, key)) {
        if (deep && key in destination && typeof(destination[key]) == 'object' && typeof(source[key]) == 'object') {
          this.assign(destination[key], source[key], deep);
        } else {
          destination[key] = source[key];
        }
      }
    }
    return destination;
  },

  extend: function(destination) {
    for(var i=1; i<arguments.length; i++) {
      destination = this.assign(destination, arguments[i]);
    }
    return destination;
  },

  merge: function(destination) {
    for(var i=1; i<arguments.length; i++) {
      destination = this.assign(destination, arguments[i], true);
    }
    return destination;
  },

  addCSS: function(doc, value, inline) {
    var css = null;
    if (inline) {
      css = doc.createElement('style'); css.type = 'text/css';
      if (css.styleSheet) css.styleSheet.cssText = value;
      else css.appendChild(document.createTextNode(value));
    } else {
      css = doc.createElement('link'); css.setAttribute('type', 'text/css');
      css.setAttribute('rel', 'stylesheet'); css.setAttribute('media', 'screen');
      css.setAttribute('href', value);
    }
    doc.getElementsByTagName('head')[0].appendChild(css);
    return css;
  },

  addJS: function(doc, id, src, onload) {
    var script = doc.createElement('script');
    script.setAttribute('id', id); script.setAttribute('type', 'application/javascript');
    script.setAttribute('src', src);
    script.setAttribute('charset', 'UTF-8');
    if (onload) script.onload = onload;
    doc.getElementsByTagName('head')[0].appendChild(script);
    return script;
  },

  getCookieName: function(key) {
    return "trex_" + key;
  },

  getCookie: function(key) {
    var cname = this.getCookieName(key);
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1);
      if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
    }
    return "";
  },

  setCookie: function(key, data) {
    var cname = this.getCookieName(key);
    document.cookie = cname + "=" + data + "; path=/";
  },

  // Simple JavaScript Templating
  // John Resig - http://ejohn.org/ - MIT Licensed
  /* jshint ignore:start */
  templateCache: {},
  template: function(str, data) {
    var cache = this.templateCache;
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
      this.template(document.getElementById(str).innerHTML) :

      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +

          // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +

          // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
        + "');}return p.join('');");

    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  },
  /* jshint ignore:end */

  element: function(element_id) {
    if (typeof element_id == 'string') return document.getElementById(element_id);
    return element_id;
  },

  isNumber: function(str) {
    return str.search(/^\s*\d+\s*$/) != -1;
  },

  isArray: function(obj) {
    if (obj === null || typeof obj == 'undefined') return false;
    return (obj.constructor.toString().indexOf("Array") !== -1);
  },

  isObject: function(obj) {
    if (obj === null || typeof obj == 'undefined') return false;
    return (typeof obj == 'object');
  },

  isFunction: function(object) {
    return (typeof object === "function");
  },

  isString: function(obj) {
    return (typeof obj === 'string');
  },

  isURL: function(str) {
    str = "" + str;
    return (str.indexOf("http://") != -1) || (str.indexOf("https://") != -1);
  },

  toQueryParams: function (obj) {
    if (typeof obj == 'undefined' || obj === null) return "";
    if (typeof obj == 'string') return obj;

    var qs = [];
    for(var p in obj) {
      qs.push(p + "=" + encodeURIComponent(obj[p]));
    }
    return qs.join("&");
  },

  parallel: function(funcs, callback) {
    var k,i,l=0,c=0,r={},e = null;
    var cb = function(k){
      funcs[k](function(err, data){
        if(err) return callback(err);
        if(data) r[k] = data;
        c++;
        if(c == l) {
          callback(null, r);
        }
      });
    };
    for(k in funcs) l++;
    if(!l) callback(null,r);
    for(k in funcs) {cb(k);}
  },

  localizeDate: function(date, format) {
    return date;
  }

};

}).call(this,require("buffer").Buffer)
},{"./md5":40,"buffer":8}],55:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"./lib":60,"dup":12}],56:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"asap/raw":64,"dup":13}],57:[function(require,module,exports){
arguments[4][14][0].apply(exports,arguments)
},{"./core.js":56,"dup":14}],58:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"./core.js":56,"dup":15}],59:[function(require,module,exports){
arguments[4][16][0].apply(exports,arguments)
},{"./core.js":56,"dup":16}],60:[function(require,module,exports){
arguments[4][17][0].apply(exports,arguments)
},{"./core.js":56,"./done.js":57,"./es6-extensions.js":58,"./finally.js":59,"./node-extensions.js":61,"./synchronous.js":62,"dup":17}],61:[function(require,module,exports){
arguments[4][18][0].apply(exports,arguments)
},{"./core.js":56,"asap":63,"dup":18}],62:[function(require,module,exports){
arguments[4][19][0].apply(exports,arguments)
},{"./core.js":56,"dup":19}],63:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"./raw":64,"dup":20}],64:[function(require,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"dup":21}]},{},[6]);
