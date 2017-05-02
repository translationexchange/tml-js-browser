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
var utils = tml.utils;

var helpers = {

  /**
   * Prints welcome message
   *
   * @param version
   */
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

  /**
   * Gets browser preferred languages
   *
   * @returns {*|string|*[]|null}
   */
  getBrowserLanguages: function () {
    var nav = window.navigator;
    return (
      nav.languages ||
      nav.language && [nav.language] ||
      nav.userLanguage && [nav.userLanguage] ||
      nav.browserLanguage && [nav.browserLanguage] ||
      null
    );
  },

  /**
   * Adds language selector to the page
   *
   * @param options
   */
  includeLs: function (options) {
    var node = document.createElement("div");
    if (utils.isObject(options)) {
      for (var propertyName in options) {
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

  /**
   * Adds agent to the page
   *
   * @param app
   * @param options
   * @param callback
   * @returns {*}
   */
  includeAgent: function (app, options, callback) {
    var agent_host = options.host || "https://tools.translationexchange.com/agent/stable/agent.min.js";

    if (options.enabled === false) {
      tml.logger.debug("agent disabled");
      return callback();
    }
    tml.logger.debug("loading agent from " + agent_host);

    utils.addJS(window.document, 'tml-agent', agent_host, function () {
      Trex.init(app.key, options);
      if (callback)
        Trex.ready(callback);
    });
  },

  /**
   * Add CSS to the page
   *
   * @param css
   * @param id
   */
  addCss: function(css, id) {
    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    head.appendChild(style);
  },

  /**
   * Includes CSS for the project and current sources
   *
   * @param app
   */
  includeCss: function (app) {
    if (app.current_locale) {
      var current_language = app.languages_by_locale[app.current_locale];
      if (current_language && current_language.configuration && current_language.configuration.css) {
        tml.logger.debug("Adding language (" + current_language.locale + ") configuration: " + current_language.configuration.css);
        helpers.addCss(current_language.configuration.css);
      }
    }

    if (app.sources_by_key) {
      Object.keys(app.sources_by_key).forEach(function(key) {
        var source = app.sources_by_key[key];
        if (source && source.configuration && source.configuration.css) {
          tml.logger.debug("Adding source (" + source.source + ") configuration: " + source.configuration.css);
          helpers.addCss(source.configuration.css);
        }
      });
    }
  },

  /**ch
   * Returns path fragments
   *
   * @param path
   * @returns {Array.<T>}
   */
  getPathFragments: function (path, remove_prefix) {
    path = path || window.location.pathname;

    if (remove_prefix) {
      tml.logger.debug("removing prefix from path: " + remove_prefix);
      var re = new RegExp('^\/?' + remove_prefix.replace('/', '\/'));
      path = path.replace(re, '');
    }

    return path.split('/').filter(function (n) {
      return n !== '';
    });
  },

  /**
   *
   * @param locale
   */
  isValidLocale: function (locale) {
    if (locale == null) return false;
    return (locale.match(/^[a-z]{2}(-[A-Z]{2})?$/) !== null);
  },

  /**
   * Gets current source from URL path
   *
   * @param options
   * @returns {string}
   */
  getDefaultSource: function (options) {
    var locale_method = options.locale || options.current_locale;

    var current_source = window.location.pathname;
    if (current_source.length > 1) {
      current_source = current_source.replace(/\/$/, '');
    }

    // for pre-path, remove the locale from path, and use the rest as the source
    if (utils.isObject(locale_method)) {
      var fragments = helpers.getPathFragments(current_source, locale_method.prefix);
      if (locale_method.strategy == 'pre-path' && helpers.isValidLocale(fragments[0]))
        fragments.shift();
      current_source = fragments.join('/');
    }

    current_source = current_source.replace(/^\//, '');

    if (current_source.match(/\/$/)) {
      current_source = current_source + 'index';
    }

    if (current_source === '') {
      current_source = 'index';
    }

    return current_source;
  },

  /**
   * Extracts current source from the url
   *
   * @param options
   * @returns {*}
   */
  getCurrentSource: function (options) {
    var source_method = options.source || options.current_source;
    var path = window.location.pathname;
    if (path == '/') path = '/index';

    // current_source can be a function, hash or a string
    if (source_method) {
      if (utils.isString(source_method)) {
        return source_method;
      }

      if (utils.isFunction(source_method)) {
        return source_method(path);
      }

      if (utils.isObject(source_method)) {
        for (var exp in source_method) {
          var re = new RegExp(exp);
          if (path.match(re))
            return source_method[exp];
        }

        return path;
      }
    }

    return helpers.getDefaultSource(options);
  },

  /**
   * Extracts locale from params
   *
   * @param param_name
   * @returns {*}
   */
  getLocaleFromParam: function (param_name) {
    param_name = param_name || 'locale';
    var re = new RegExp("[?&]" + param_name + "=([^&]+)(&|$)");
    return (window.location.search.match(re) || [])[1];
  },

  /**
   * Determines current locale
   *
   * @param options
   * @returns {*}
   */
  getCurrentLocale: function (options) {
    var current_locale = null;
    var locale_method = options.locale || options.current_locale;

    if (locale_method) {

      // locale is set/forced by the user, just use it
      if (utils.isString(locale_method)) {
        return locale_method;
      }

      // locale method is a function, execute it and use the result
      if (utils.isFunction(locale_method)) {
        return locale_method();
      }

      // locale must be extracted from param
      // options: {
      //    default:    'en',
      //    strategy:   'param',
      //    param:      'locale',
      //    cookie:     true,
      //    redirect:   false
      // }
      if (locale_method.strategy == 'param') {
        tml.logger.debug("extracting locale from param");
        current_locale = helpers.getLocaleFromParam(locale_method.param);
        tml.logger.debug("detected locale: " + current_locale);

        // if locale was detected, and cookie is enabled, store it in the cookie
        if (current_locale) {
          if (locale_method.cookie)
            this.updateCurrentLocale(options.key, current_locale);
        } else {
          // if locale is not detected, but the cookie is enabled, pull the locale from the cookie
          if (locale_method.cookie)
            current_locale = this.getCookie(options.key).locale;
        }

        return current_locale;
      }

      // locale must be extracted from pre-path
      // options: {
      //    strategy:  'pre-path',
      //    prefix:    '/wordpress'
      // }
      if (locale_method.strategy == 'pre-path') {
        tml.logger.debug("extracting locale from pre-path");
        var fragments = helpers.getPathFragments(window.location.pathname, locale_method.prefix);
        if (helpers.isValidLocale(fragments[0]))
          return fragments[0];
        return null;
      }

      // options: {
      //    strategy:   'pre-domain'
      // }
      if (locale_method.strategy == 'pre-domain') {
        var subdomains = window.location.hostname.split('.');
        if (helpers.isValidLocale(subdomains[0]))
          return subdomains[0];
        return null;
      }

      // options: {
      //    strategy:   'custom-domain',
      //    mapping: {
      //            'en': 'my-en.lvh.me',
      //            'ru': 'my-ru.lvh.me',
      //            'ko': 'my-ko.lvh.me'
      //    }
      // }
      if (locale_method.strategy == 'custom-domain') {
        var host = window.location.hostname;
        var mapping = utils.swapKeys(locale_method.mapping);
        return mapping[host];
      }

      tml.logger.debug("locale method is provided, but not enough information is supplied");
      return null;
    }

    // default fallback uses the param locale or cookie locale - for backwards compatibility
    current_locale = helpers.getLocaleFromParam();
    if (current_locale) {
      this.updateCurrentLocale(options.key, current_locale);
    } else {
      var cookie = this.getCookie(options.key);
      current_locale = cookie.locale;
    }
    return current_locale;
  },

  /**
   * Updates locale in the cookie
   *
   * @param key
   * @param locale
   */
  updateCurrentLocale: function (key, locale) {
    var data = helpers.getCookie(key);
    data = data || {};
    data.locale = locale;
    this.setCookie(key, data);
  },

  /**
   * Returns cookie
   *
   * @param key
   * @returns {*}
   */
  getCookie: function (key) {
    var cname = utils.getCookieName(key);
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1);
      if (c.indexOf(name) != -1)
        return utils.decode(c.substring(name.length, c.length));
    }
    return {};
  },

  /**
   * Sets the cookie
   *
   * @param key
   * @param data
   */
  setCookie: function (key, data) {
    var cname = utils.getCookieName(key);
    document.cookie = cname + "=" + utils.encode(data) + "; path=/";
  }

};

module.exports = {
  printWelcomeMessage: helpers.printWelcomeMessage,
  getBrowserLanguages: helpers.getBrowserLanguages,
  includeTools: helpers.includeTools,
  getCurrentSource: helpers.getCurrentSource,
  getDefaultSource: helpers.getDefaultSource,
  getCurrentLocale: helpers.getCurrentLocale,
  updateCurrentLocale: helpers.updateCurrentLocale,
  getCookie: helpers.getCookie,
  setCookie: helpers.setCookie,
  includeLs: helpers.includeLs,
  includeCss: helpers.includeCss,
  includeAgent: helpers.includeAgent
};