
// entry point for browserify

var tml         = require('tml-js');

var config      = tml.config;
var utils       = tml.utils;
var helpers     = tml.scripts;
var logger      = tml.logger;
var Application = tml.Application;
var Translator  = tml.Translator;

var DomTokenizer  = require('./dom');

//var config      = require('../configuration');
//var utils       = require('../utils');
//var helpers     = require('../helpers/scripts');
//var logger      = require('../logger');
//
//var Application = require('../application');
//var Translator  = require('../translator');
//var DomTokenizer  = require('./dom');

var app = null;

var DEFAULT_HOST = "https://api.translationexchange.com";


var mutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

var includeTools = function(app, callback) {
  utils.addCSS(window.document, app.tools.stylesheet, false);
  utils.addCSS(window.document, app.css, true);      

  utils.addJS(window.document, 'tml-jssdk', app.tools.javascript, function() {
    Tml.app_key = app.key;
    Tml.host = app.tools.host;
    Tml.current_source = app.current_source;
    Tml.default_locale = app.default_locale;
    Tml.page_locale = config.current_locale;
    Tml.locale = config.current_locale;

    var shortcutFn = function(sc){
      return function(){
        eval(app.shortcuts[sc]); // jshint ignore:line
      };
    };

    if (app.isFeatureEnabled("shortcuts")) {
      for (var sc in app.shortcuts) {
        shortcut.add(sc, shortcutFn(sc));
      }
    }

    if (callback) callback();

  });
};

var tml = {
  version: '0.2.17',

  application:null,
  block_options:[],
  root_element: null,
  options: {},

  init: function(token, options, callback) {
    options = options || {};
    tml.options = options;
    tml.options.token = token;
    config.debug = (options.debug ? options.debug : config.debug);

    options.preferred_languages = options.preferred_languages || this.getBrowserLanguages();

    if (config.debug || options.info) {
      console.log([
        " _______                  _       _   _             ______          _",
        "|__   __|                | |     | | (_)           |  ____|        | |",
        "   | |_ __ __ _ _ __  ___| | __ _| |_ _  ___  _ __ | |__  __  _____| |__   __ _ _ __   __ _  ___",
        "   | | '__/ _` | '_ \\/ __| |/ _` | __| |/ _ \\| '_ \\|  __| \\ \\/ / __| '_ \\ / _` | '_ \\ / _` |/ _ \\",
        "   | | | | (_| | | | \\__ \\ | (_| | |_| | (_) | | | | |____ >  < (__| | | | (_| | | | | (_| |  __/",
        "   |_|_|  \\__,_|_| |_|___/_|\\__,_|\\__|_|\\___/|_| |_|______/_/\\_\\___|_| |_|\\__,_|_| |_|\\__, |\\___|",
        "                                                                                       __/ |",
        "                                                                                      |___/",
        "   version " + tml.version,
        "",
        "   We are hiring! http://translationexchange.com/jobs ",
        " "
      ].join("\n"));
    }

    tml.initApplication(token, options, callback);
  },

  getBrowserLanguages: function(){ 
    var nav = window.navigator;
    return (
      nav.languages || 
      nav.language && [nav.language] || 
      nav.userLanguage && [nav.userLanguage] || 
      nav.browserLanguage && [nav.browserLanguage] || 
      null
    );
  },

  //var app_locales = (self.languages||[]).map(function(l){return l.locale;}).join(',');
  //(app_locales.match(new RegExp(locale +"|"+locale.replace(/-\w+$/,'')))[0])

  initApplication: function(token, options, callback) {
    window.util = utils;

    // if (options.translateElement || options.translateBody) {
    //   tml.root_element = (typeof options.translateElement === "string") ? document.getElementById(options.translateElement) : options.translateElement;
    //   if (options.translateBody) tml.root_element = document.body;
    // }

    var t0 = new Date();

    var current_source = null;
    var current_source_method = options.current_source || options.source;

    // current_source can be a function, hash or a string
    if (current_source_method) {
      if (typeof current_source_method === "function") {
        current_source = current_source_method();
      } else {
        current_source = current_source_method;
      }
    }

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

    var host = options.host || DEFAULT_HOST;

    var cookie = utils.decode(utils.getCookie(token));
    cookie = cookie || {};

    var current_locale = null;

    if (options.current_locale) {
      if (typeof options.current_locale === "function") {
        current_locale = options.current_locale(req);
      } else {
        current_locale = options.current_locale;
      }
    } else {
      current_locale = (window.location.search.match(/[?&]locale=([^&]+)(&|$)/) ||[])[1];
      if (current_locale) {
        cookie.locale = current_locale;
        utils.setCookie(token, utils.encode(cookie));
      }
      current_locale = cookie.locale;
    }

    options = utils.merge(config, {
      delayed_flush:      true,
      api:                "ajax",
      current_source:     current_source,
      current_locale:     current_locale,
      current_translator: cookie.translator ? new Translator(cookie.translator) : null,
      accepted_locales:   window.navigator.languages,
      translator_options: {
        ignored_classes: options.ignoreClasses || config.translator_options.ignored_classes
      },
      cache: {
        enabled: true,
        adapter: "browser",
        version: options.version
      }
    }, options);

    config.initCache(token);

    // logger.log(config);

    app = tml.application = new Application({
      access_token: token,
      host: host
    });

    app.init(options, function (err) {
      if (err) {
        throw new Error(err);
      }

      if (tml.options.translateBody && mutationObserver) {
        tml.translateElement(document);
      }

      tml.domReady(function(){
        
        if (tml.options.translateBody && !mutationObserver) {
          tml.translateElement(document.body);
        }

        var t1 = new Date();
        logger.debug("page render took " + (t1 - t0) + " mls");

        tml.updateLanguageSelector();

        if (options.translateTitle && document.title !== "") {
          document.title = tml.translateLabel(document.title);
        }

        // This should be optional
        // Maybe tools and tml should be separate for now?
        includeTools(app, function () {
          if (callback) callback();
        });

        if (typeof(tml.options.initialized) == "function") {
          tml.options.initialized(app);
        }

      });

      // check version in cache, change version to the latest from api
      // reset cache if they are different
      setTimeout(function() {
        config.getCache().fetchVersion(function(current_version) {
          app.getApiClient().getReleaseVersion(function(new_version) {
            if (current_version != new_version)
              config.getCache().clear();
          });
        });
      }, 1000);
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
      helpers.language_selector_init(app, type);
    }
  },

  changeLanguage: function(locale) {
    app.changeLanguage(locale, function(language) {
      var cookie = utils.decode(utils.getCookie(tml.options.token));
      cookie = cookie || {};
      cookie.locale = locale;
      utils.setCookie(tml.options.token, utils.encode(cookie));

      //if (tml.root_element) {
      config.currentLanguage = app.getCurrentLanguage();

      if (this.tokenizer) {
        this.tokenizer.updateAllNodes();
      }

      //}
      tml.updateLanguageSelector();
      if (typeof(tml.options.languageChanged) == "function")
        tml.options.languageChanged(language);
    }.bind(this));
  },

  translate: function(label, description, tokens, options) {
    if(!app) {
      throw new Error("Invalid application.");
    }

    if (typeof description !== "string") {
      options = tokens || {};
      tokens  = description || {};
      description = "";
    }

    options = utils.extend({}, {
      current_locale: app.current_locale,
      current_source: app.current_source,
      current_translator: app.current_translator,
      block_options: (tml.block_options || [])
    }, options);

    return app.getCurrentLanguage().translate(label, description, tokens, options);
  },

  translateLabel: function(label, description, tokens, options) {
    if (typeof description !== "string") {
      options = tokens || {};
      tokens  = description || {};
      description = "";
    }

    options = utils.extend({}, {
      skip_decorations: true
    }, options);

    return tml.translate(label, description, tokens, options);
  },

  translateElement: function(container) {
    container = (typeof container === "string") ? document.getElementById(container) : container;

    config.currentLanguage = app.getCurrentLanguage();

    this.tokenizer = new DomTokenizer(container, {}, {
      debug: false,
      current_source: app.current_source || 'index',
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

    // no empty strings
    if (sanitized_label === null || sanitized_label.length === 0) return;

    var translation = this.translate(sanitized_label);
//    var translation = sanitized_label;

//    console.log(translation);

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

//      if (disable_sentences || sentences.length == 1) {
        this.translateTextNode(parent_node, current_node, label);

//      } else {
//        var node_replaced = false;
//
//        for (j=0; j<sentences.length; i++) {
//          var sanitized_sentence = utils.sanitizeString(sentences[j]);
//          if (sanitized_sentence.length === 0) continue;
//
//          sanitized_sentence = sanitized_sentence + ".";
//          var translated_node = document.createElement("span");
//          translated_node.style.border = '1px dotted green';
//          translated_node.innerHTML = sanitized_sentence; //this.translateLabel(sanitized_sentence);
//
//          if (node_replaced) {
//            parent_node.appendChild(translated_node);
//          } else {
//            parent_node.replaceChild(translated_node, current_node);
//            node_replaced = true;
//          }
//          parent_node.appendChild(document.createTextNode(" "));
//
//        }
//      }
    }
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
    return helpers.language_selector(app, type, options);
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

window.tml = tml;

window.tr   = tml.translate;
window.trl  = tml.translateLabel;
window.tre  = tml.translateElement;

window.tml_application = tml.getApplication;
window.tml_current_source = tml.getCurrentSource;
window.tml_current_translator = tml.getCurrentTranslator;
window.tml_current_language = tml.getCurrentLanguage;
window.tml_language_selector = tml.getLanguageSelector;
window.tml_block = tml.block;
window.tml_begin_block = tml.beginBlock;
window.tml_end_block = tml.endBlock;
