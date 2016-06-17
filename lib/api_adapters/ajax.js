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