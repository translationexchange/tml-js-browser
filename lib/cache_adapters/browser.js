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

    return self.getRequest().get(cache_path, {})
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