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

var core          = require('tml-js');
var DomTokenizer  = require('./dom');
var helpers       = require('./helpers');

var config          = core.config;
var utils           = core.utils;
var scripts         = core.scripts;
var logger          = core.logger;
var TranslationKey  = core.TranslationKey;
var Application     = core.Application;
var Translator      = core.Translator;

window.util = utils;

var app = null;

var DEFAULT_HOST = "https://api.translationexchange.com";

var mutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

var tml = {
  version: '0.3.0',

  application:    null,
  block_options:  [],
  root_element:   null,
  options:        {},
  //exposing some APIs
  TranslationKey: TranslationKey,

  init: function(options, callback) {
    options = options || {};

    tml.options   = options;
    config.debug  = (options.debug ? options.debug : config.debug);

    options.preferred_languages = options.preferred_languages || helpers.getBrowserLanguages();

    if (config.debug || options.info)
      helpers.printWelcomeMessage(tml.version);

    tml.initApplication(options, callback);
  },

  initApplication: function(options, callback) {
    var t0 = new Date();

    var cookie = helpers.getCookie(options.key);

    var cache_version = null;

    if (options.cache && options.cache.version)
      cache_version = options.cache.version;

    options = utils.merge(config, {
      delayed_flush:      true,
      api:                "ajax",
      current_source:     helpers.getCurrentSource(options),
      current_locale:     helpers.getCurrentLocale(options.key, options.current_locale),
      current_translator: cookie.translator ? new Translator(cookie.translator) : null,
      accepted_locales:   window.navigator.languages,
      cache: {
        enabled: true,
        adapter: "browser",
        version: cache_version
      }
    }, options);

    options.fetch_version = (options.cache.adapter == 'browser' && !cache_version);

    config.initCache(options.key);
    // console.log(options);

    app = tml.application = new Application({
      key:    options.key,
      token:  options.token,
      host:   options.host || DEFAULT_HOST
    });

    app.init(options, function (err) {
      if (err) {
        throw new Error(err);
      }

      if (options.translateBody && mutationObserver) {
        tml.translateElement(document);
      }

      tml.domReady(function(){
        
        if (options.translateBody && !mutationObserver) {
          tml.translateElement(document.body);
        }

        var t1 = new Date();
        logger.debug("page render took " + (t1 - t0) + " mls");

        tml.updateLanguageSelector();

        if (options.translateTitle && document.title !== "") {
          document.title = tml.translateLabel(document.title);
        }

        if (!options.agent) {
          options.agent = {
            enabled: true,
            version: "latest",
            type:    "agent"
          };
        }

        if (options.agent.enabled) {
          if (options.agent.type == "agent") {
            helpers.includeAgent(app, {
              host:     options.agent.host,
              version:  options.agent.version || "latest",
              domains:  options.agent.domains || {},
              locale:   options.current_locale,
              source:   options.current_source
            }, function () {
              if (callback) callback();
            });
          } else {
            helpers.includeTools(app, options.current_locale, function () {
              if (callback) callback();
            });
          }
        } else {
          if (callback) callback();
        }

        if (typeof(options.onLoad) == "function") {
          options.onLoad(app);
        }
      });

      if (options.fetch_version) {
        setTimeout(function () {
          config.getCache().fetchVersion(function (current_version) {
            app.getApiClient().getReleaseVersion(function (new_version) {
              if (current_version != new_version)
                config.getCache().clear();
            });
          });
        }, 1000);
      }
    });
  },

  domReady: function(fn){
    if (!document.readyState || /ded|te/.test(document.readyState)) {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn, false);
    }
  },

  updateLanguageSelector: function() {
    var languageSelector = document.querySelectorAll("[data-tml-language-selector], [tml-language-selector]");

    if (languageSelector.length === 0) return;
    for (var i=0; i<languageSelector.length; i++) {
      var type = languageSelector[i].getAttribute("data-tml-language-selector");
      type = type || 'popup';
      var element = languageSelector[i].getAttribute("data-tml-language-selector-element");
      element = element || 'div';
      var toggle = languageSelector[i].getAttribute("data-tml-toggle") == 'true';
      var toggle_label = languageSelector[i].getAttribute("data-tml-toggle-label");
      var powered_by = languageSelector[i].getAttribute("data-tml-powered-by") == 'true';
      languageSelector[i].innerHTML = tml.getLanguageSelector(type, {
        element: element,
        container: languageSelector[i],
        toggle: toggle,
        toggle_label: toggle_label,
        powered_by: powered_by
      });
      scripts.language_selector_init(app, type);
    }
  },

  changeLanguage: function(locale) {
    app.changeLanguage(locale, function(language) {
      helpers.updateCurrentLocale(tml.options.key, locale);
      config.currentLanguage = app.getCurrentLanguage();

      if (this.tokenizer)
        this.tokenizer.updateAllNodes();

      tml.updateLanguageSelector();

      if (utils.isFunction(tml.options.onLanguageChange))
        tml.options.onLanguageChange(language);
    }.bind(this));
  },

  translate: function(label, description, tokens, options) {
    if(!app) {
      throw new Error("Invalid application.");
    }

    var params = utils.normalizeParams(label, description, tokens, options);

    params.options = utils.extend({}, {
      current_locale:     app.current_locale,
      current_source:     app.current_source,
      current_translator: app.current_translator,
      block_options:      (tml.block_options || [])
    }, params.options);

    return app.getCurrentLanguage().translate(params);
  },

  translateLabel: function(label, description, tokens, options) {
    var params = utils.normalizeParams(label, description, tokens, options);
    params.options.skip_decorations = true;
    return tml.translate(params);
  },

  translateElement: function(container) {
    container = (typeof container === "string") ? document.getElementById(container) : container;

    config.currentLanguage = app.getCurrentLanguage();

    this.tokenizer = new DomTokenizer(container, {}, {
      debug:              false,
      current_source:     app.current_source || 'index',
      current_translator: app.current_translator
    });

    if(/ded|te/.test(document.readyState)) {
      this.tokenizer.translateDOM(document.body);  
    } else if (mutationObserver) {
      this.translateNow();
    }
  },

  translateNow: function(){
    var observer, self = this;
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
              if(nodeList.indexOf(node) == -1) {
                nodeList.push(node);
              }              
            }
          }
        });

        nodeList.forEach(function(n){
          self.tokenizer.translateDOM(n);
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

  translateTextNode: function(parent_node, text_node, label) {
    // we need to handle empty spaces better
    var sanitized_label = utils.sanitizeString(label);
    if (utils.isNumber(sanitized_label)) return;
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

  translateTextElements: function(element) {
    if (utils.element('tml_status_node')) return;

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

  toggleInlineTranslations: function(flag) {
    
  },

  getApplication: function() {
    return app;
  },

  getCurrentSource: function() {
    return app.current_source;
  },

  getCurrentTranslator: function() {
    return app.current_translator;
  },

  getCurrentLanguage: function() {
    return app.getCurrentLanguage();
  },

  getLanguageSelector: function(type, options) {
    options = utils.merge(options || {}, {
      current_language: tml.getCurrentLanguage(),
      client_side: true
    });
    return scripts.language_selector(app, type, options);
  },

  block: function(options, callback) {
    tml.block_options.unshift(options);
    callback();
    tml.block_options.pop();
  },

  beginBlock:  function(options) {
    tml.block_options.unshift(options);
  },

  endBlock: function() {
    tml.block_options.pop();
  },

  clearCache: function() {
    config.getCache().clear();
  }

};

window.tr                     = tml.translate;
window.trl                    = tml.translateLabel;
window.tre                    = tml.translateElement;

window.tml                    = tml;
window.tml_application        = tml.getApplication;
window.tml_current_source     = tml.getCurrentSource;
window.tml_current_translator = tml.getCurrentTranslator;
window.tml_current_language   = tml.getCurrentLanguage;
window.tml_language_selector  = tml.getLanguageSelector;
window.tml_block              = tml.block;
window.tml_begin_block        = tml.beginBlock;
window.tml_end_block          = tml.endBlock;

