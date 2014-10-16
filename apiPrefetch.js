(function (XHR) {
  'use strict';

  var XHR = XMLHttpRequest;

  var phonyXHR = function FakeXMLHttpRequest () {
    var self = this;

    self.xhr = new XHR();

    self.getAllResponseHeaders = function () {};
    self.getResponseHeader = function () {};
    self.setRequestHeader = function () {};

    /* Add getter+setter passthroughs */
    [
      'onload', 'onerror', 'onprogress', 'onabort', 'ontimeout',
      'onreadystatechange', 'upload', 'withCredentials',
      'timeout', 'readyState'
    ].forEach(function (prop) {
      Object.defineProperty(self, prop, {
        set: function (val) {
          self.xhr[prop] = val;
        },
        get: function () {
          return self.xhr[prop];
        }
      });
    });
  };


  window.XMLHttpRequest = phonyXHR;

  phonyXHR.prototype.apiPrefetchOptions = XHR.prototype.apiPrefetchOptions || {
    variable: 'apiPrefetchData'
  };

  phonyXHR.prototype.open = function (method, url, async) {
    var self = this;
    var prefetchVar = window[this.apiPrefetchOptions.variable];

    self.apiPrefetchExecuting = method.toUpperCase() === 'GET' &&
      async !== false &&
      prefetchVar &&
      (typeof prefetchVar === 'string' || prefetchVar[url]);

    if (!self.apiPrefetchExecuting) {
      self.getAllResponseHeaders = self.xhr.getAllResponseHeaders.bind(self.xhr);
      self.getResponseHeader = self.xhr.getResponseHeader.bind(self.xhr);
      self.setRequestHeader = self.xhr.setRequestHeader.bind(self.xhr);
      self.xhr.open.apply(self.xhr, arguments);
    } else if (typeof prefetchVar === 'string') {
      assignResponse(self, prefetchVar);
      delete window[this.apiPrefetchOptions.variable];
    } else {
      assignResponse(self, prefetchVar[url]);
      delete prefetchVar[url];
    }
  };

  phonyXHR.prototype.send = function () {
    var self = this;

    if (!self.apiPrefetchExecuting) {
      return self.xhr.send.apply(self.xhr, arguments);
    }

    self.apiPrefetchExecuting = false;
    self.apiPrefetchExecuted = true;

    /* Don't call onload right away, it might be set after send is called */
    setTimeout(function () {
      if (self.responseType === 'json') {
        self.response = JSON.parse(self.responseText);
      }
      if (typeof self.onload === 'function') self.onload();
    }, 0);
  };

  function assignResponse(xhr, value) {
    xhr.status = 200;
    xhr.statusText = '200 OK';

    if (typeof value === 'string') {
      xhr.response = xhr.responseText = value;
    } else {
      xhr.response = xhr.responseText = JSON.stringify(value);
    }
  }

})(XMLHttpRequest);
