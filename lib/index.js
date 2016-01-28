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

var tml           = require('tml-js');
var helpers       = require('./helpers');
var DomTokenizer  = require('./tokenizers/dom');

var DEFAULT_HOST  = "https://api.translationexchange.com";
var mutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

tml = tml.utils.extend(tml, {
  version: '/* @echo VERSION */',

  app:            null,
  block_options:  [],
  root_element:   null,
  options:        {},

  /**
   * Initializes TML library
   * @param options
   * @param callback
   */
  init: function(options, callback) {
    options = options || {};

    tml.options   = options;
    tml.config.debug  = (options.debug ? options.debug : tml.config.debug);

    options.preferred_languages = options.preferred_languages || helpers.getBrowserLanguages();

    if (tml.config.debug || options.info)
      helpers.printWelcomeMessage(tml.version);

    tml.initApplication(options, callback);
  },

  /**
   * Initializes application
   *
   * @param options
   * @param callback
   */
  initApplication: function(options, callback) {
    var t0 = new Date();

    var cookie = helpers.getCookie(options.key);

    var cache_version = null;

    if (options.cache && options.cache.version)
      cache_version = options.cache.version;

    tml.config.registerApiAdapter('ajax', require('./api_adapters/ajax'));
    tml.config.api = 'ajax';

    tml.config.registerCacheAdapters({
      inline:      require('./cache_adapters/inline'),
      browser:     require('./cache_adapters/browser')
    });

    options = tml.utils.merge(tml.config, {
      delayed_flush:      true,
      api:                "ajax",
      current_source:     helpers.getCurrentSource(options),
      current_locale:     helpers.getCurrentLocale(options.key, options.current_locale),
      current_translator: cookie.translator ? new tml.Translator(cookie.translator) : null,
      accepted_locales:   window.navigator.languages,
      cache: {
        enabled: true,
        adapter: "browser",
        version: cache_version
      }
    }, options);

    options.fetch_version = (options.cache.adapter == 'browser' && !cache_version);

    tml.config.initCache(options.key);
    // console.log(options);

    tml.app = new tml.Application({
      key:    options.key,
      token:  options.token,
      host:   options.host || DEFAULT_HOST
    });

    tml.app.init(options, function (err) {
      if (err) {
        throw new Error(err);
      }

      if ((options.translateBody || options.translate_body) && mutationObserver) {
        tml.translateElement(document);
      }

      tml.domReady(function(){
        
        if ((options.translateBody || options.translate_body) && !mutationObserver) {
          tml.translateElement(document.body);
        }

        var t1 = new Date();
        tml.logger.debug("page render took " + (t1 - t0) + " mls");

        if ((options.translateTitle || options.translate_title) && document.title !== "") {
          document.title = tml.translateLabel(document.title);
        }

        if (!options.agent) options.agent = {};

        helpers.includeAgent(tml.app, {
          host:       options.agent.host,
          cache:      options.agent.cache || 864000000,
          domains:    options.agent.domains || {},
          locale:     tml.app.current_locale,
          source:     tml.app.current_source,
          sdk:        options.sdk || 'tml-js v' + tml.version,
          css:        tml.app.css,
          languages:  tml.app.languages
        }, function () {
          if (callback) callback();
        });

        if (typeof(options.onLoad) == "function") {
          options.onLoad(tml.app);
        }
      });

      // if version is hardcoded - don't bother checking the version
      if (options.fetch_version) {
        setTimeout(function () {
          tml.config.getCache().fetchVersion(function (current_version) {
            tml.app.getApiClient().getReleaseVersion(function (new_version) {
              if (current_version != new_version)
                tml.config.getCache().clear();
            });
          });
        }, 1000);
      }
    });
  },

  /**
   * Fires when DOM is ready
   *
   * @param fn
   */
  domReady: function(fn){
    if (!document.readyState || /ded|te/.test(document.readyState)) {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn, false);
    }
  },

  /**
   * Changes language
   *
   * @param locale
   */
  changeLanguage: function(locale) {
    tml.app.changeLanguage(locale, function(language) {
      helpers.updateCurrentLocale(tml.options.key, locale);
      tml.config.currentLanguage = tml.app.getCurrentLanguage();

      if (this.tokenizer)
        this.tokenizer.updateAllNodes();

      if (tml.utils.isFunction(tml.options.onLanguageChange))
        tml.options.onLanguageChange(language);
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
  translate: function(label, description, tokens, options) {
    if(!tml.app) {
      throw new Error("Invalid application.");
    }

    var params = tml.utils.normalizeParams(label, description, tokens, options);
    params.label = params.label.replace(/\s\s+/g, ' ');

    params.options = tml.utils.extend({}, {
      current_locale:     tml.app.current_locale,
      current_source:     tml.app.current_source,
      current_translator: tml.app.current_translator,
      block_options:      (tml.block_options || [])
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
  translateLabel: function(label, description, tokens, options) {
    var params = tml.utils.normalizeParams(label, description, tokens, options);
    params.options.skip_decorations = true;
    return tml.translate(params);
  },

  /**
   * Translates an element
   *
   * @param container
   */
  translateElement: function(container) {
    container = (typeof container === "string") ? document.getElementById(container) : container;

    tml.config.currentLanguage = tml.app.getCurrentLanguage();

    this.tokenizer = new DomTokenizer(container, {}, {
      debug:              false,
      current_source:     tml.app.current_source || 'index',
      current_translator: tml.app.current_translator
    });

    if(/ded|te/.test(document.readyState)) {
      this.tokenizer.translateDOM(document.body);
    } else if (mutationObserver) {
      if(document.body) {
        this.tokenizer.translateDOM(document.body);
      }
      this.translateNow();
    }
  },

  /**
   * Translates DOM
   */
  translateNow: function(){
    var observer, tokenizer = this.tokenizer;
    var moHandler = function(mutations) {
      var nodeList = [];
      if (mutations.length > 0) {
        mutations.forEach(function(mutation) {
          var target = mutation.target;
          var nodes = mutation.addedNodes || [];

          if (nodes.length > 0) {
            for (var i = nodes.length - 1; i > -1; i--) {
              var node = nodes[i];
              if(node.tagName && node.tagName.toLowerCase().indexOf("tml:") != -1) continue;
              if(node.tagName && node.tagName.toLowerCase().indexOf("script") != -1) continue;
              nodeList.push(node);
            }
          }
        });

        nodeList.forEach(function(n){
          tokenizer.translateDOM(n);
        });

        if(document.readyState == "interactive") {
          observer.disconnect();
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
  translateTextNode: function(parent_node, text_node, label) {
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
  translateTextElements: function(element) {
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
  getApplication: function() {
    return tml.app;
  },

  /**
   * Returns current source
   *
   * @returns {*}
   */
  getCurrentSource: function() {
    return tml.app.current_source;
  },

  /**
   * Returns current translator
   *
   * @returns {*}
   */
  getCurrentTranslator: function() {
    return tml.app.current_translator;
  },

  /**
   * Returns current language
   *
   * @returns {*}
   */
  getCurrentLanguage: function() {
    return tml.app.getCurrentLanguage();
  },

  /**
   * Encloses block options
   *
   * @param options
   * @param callback
   */
  block: function(options, callback) {
    tml.block_options.unshift(options);
    callback();
    tml.block_options.pop();
  },

  /**
   * Begins block options
   *
   * @param options
   */
  beginBlock:  function(options) {
    tml.block_options.unshift(options);
  },

  /**
   * Ends block options
   */
  endBlock: function() {
    tml.block_options.pop();
  },

  /**
   * Clears cache
   */
  clearCache: function() {
    tml.config.getCache().clear();
  }

});


/**
 * browser window extensions and helpers
 *
 * @type {Tml.translate|Function}
 */

window.tml                    = tml;
window.tr                     = tml.translate;
window.trl                    = tml.translateLabel;
window.tre                    = tml.translateElement;
window.tml_application        = tml.getApplication;
window.tml_current_source     = tml.getCurrentSource;
window.tml_current_translator = tml.getCurrentTranslator;
window.tml_current_language   = tml.getCurrentLanguage;
window.tml_block              = tml.block;
window.tml_begin_block        = tml.beginBlock;
window.tml_end_block          = tml.endBlock;


window.util = tml.utils; // TODO: is it being used?
