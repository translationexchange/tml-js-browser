/**
 * Copyright (c) 2018 Translation Exchange, Inc.
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
   * @param callback
   */
  fetchFromPath: function(key, fallback, callback) {
    if (key === 'current_version') {
      this.fetchDefault(key, fallback, callback);
      return;
    }

    var cache_path = this.config.path + "/" + this.config.version + "/" + key + ".json";
    var self = this;

    self.getRequest().get(cache_path, {}, function(err, xhr, data) {
      if (err || xhr.status !== 200 || data === null) {
        self.fetchDefault(key, fallback, callback);
      } else {
        self.store(key, data, function () {
          callback(null, data);
        });
      }
    });
  },

  /**
   * Fetch data from browser cache
   *
   * @param key
   * @param fallback
   * @param callback
   */
  fetch: function(key, fallback, callback) {
    var val = this.cache.getItem(this.getVersionedKey(key));
    if (val) {
      this.info("cache hit " + key);
      callback(null, val);
    } else {
      this.info("cache miss " + key);
      if (this.config.path) {
        this.fetchFromPath(key, fallback, callback);
      } else {
        this.fetchDefault(key, fallback, callback);
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
   * @param callback
   */
  store: function(key, value, callback) {
    var versionedKey = this.getVersionedKey(key);
    this.info("cache store " + key);
    this.cache.setItem(versionedKey, this.stripExtensions(value));
    if(callback) callback(null, value);
  },

  /**
   * Delete data from browser cache
   *
   * @param key
   * @param callback
   */
  del: function(key, callback) {
    this.info("cache del " + key);
    this.cache.removeItem(this.getVersionedKey(key));
    if(callback) callback(null);
  },

  /**
   * Check if data exists in browser cache
   *
   * @param key
   * @param callback
   */
  exists: function(key, callback){
    var val = this.cache.getItem(this.getVersionedKey(key));
    if (callback) callback(!!val);
  },

  /**
   * Clear browser cache
   *
   * @param callback
   */
  clear: function(callback) {
    for (var key in this.cache){
      if (key.match(/^tml_/))
        if (!key.match(/current_version/))
          this.cache.removeItem(key);
    }
    if (callback) callback(null);
  }

});

module.exports = Browser;