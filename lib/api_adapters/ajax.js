/**
 * Copyright (c) 2017 Translation Exchange, Inc.
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
   * @param callback
   */
  get: function(url, params, callback){
    this.request("get", url, params, callback);
  },

  /**
   * Post data to URL
   *
   * @param url
   * @param params
   * @param callback
   */
  post: function(url, params, callback) {
    this.request("post", url, params, callback);
  },

  /**
   * Perform request
   *
   * @param method
   * @param url
   * @param params
   * @param callback
   * @returns {boolean}
   */
  request: function (method, url, params, callback) {
    var t0 = new Date();

    if(!callback) callback = function(){};

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
    } else if (typeof XDomainRequest !== "undefined") {
      xhr = new XDomainRequest();
      xhr.open(method, url);
    } else {
      return false;
    }

    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhr.onload = function() {
      var t1 = new Date();
      tml.logger.debug("call took " + (t1-t0) + " mls");
      var error = xhr.status >= 200 && xhr.status < 400;
      callback(!error, xhr, xhr.responseText);
    };
    xhr.onerror = function(err) {
      callback(err, xhr);
    };
    xhr.send(data);
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