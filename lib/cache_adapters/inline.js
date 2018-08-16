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
   * @param callback
   */
  fetch: function(key, def, callback) {
    var parts = key.split("/");
    var val = this.cache;

    parts.forEach(function(part) {
      if (tml.utils.isObject(val))
        val = val[part];
    });

    if (val) {
      this.info("cache hit " + key);
      val = JSON.stringify(val);
      if (callback) callback(null, val);
      return;
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