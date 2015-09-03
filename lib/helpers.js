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
      "   We are hiring! http://translationexchange.com/jobs ",
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

  includeTools: function(app, locale, callback) {
    utils.addCSS(window.document, app.tools.stylesheet, false);
    utils.addCSS(window.document, app.css, true);

    utils.addJS(window.document, 'tml-jssdk', app.tools.javascript, function() {
      Tml.app_key = app.key;
      Tml.host = app.tools.host;
      Tml.current_source = app.current_source;
      Tml.default_locale = app.default_locale;
      Tml.page_locale = locale;
      Tml.locale = locale;

      var shortcutFn = function(sc){
        return function() {
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
  },

  includeAgent: function(app, options, callback) {
    var agent_host = options.host || "https://cdn.translationexchange.com/tools/agent/" + options.version + "/agent.min.js";
    utils.addJS(window.document, 'tml-agent', agent_host, function() {
      Trex.init(app.key, options);
      if (callback)
        Trex.ready(callback);
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
  includeAgent:         helpers.includeAgent
};