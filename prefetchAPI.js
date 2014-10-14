(function (XHR) {
  'use strict';

  var XHR = XMLHttpRequest;

  var phonyXHR = function FakeXMLHttpRequest () {
    var self = this;

    self.xhr = new XHR();

    self.getAllResponseHeaders = self.xhr.getAllResponseHeaders.bind(self.xhr);
    self.getResponseHeader = self.xhr.getResponseHeader.bind(self.xhr);
    self.setRequestHeader = self.xhr.setRequestHeader.bind(self.xhr);

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
    self.apiPrefetchExecuting = method.toUpperCase() === 'GET' &&
      async !== false &&
      typeof window[this.apiPrefetchOptions.variable] !== 'undefined';

    return self.xhr.open.apply(self.xhr, arguments);
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
      assignResponse(self);
      if (typeof self.onload == 'function') self.onload();
    }, 0);
  };

  function assignResponse(xhr) {
    var apiPrefetchData = window[xhr.apiPrefetchOptions.variable];

    xhr.status = 200;
    xhr.statusText = '200 OK';

    if (typeof apiPrefetchData === 'string') {
      xhr.responseText = apiPrefetchData;
      if (xhr.responseType === 'json') {
        xhr.response = JSON.parse(apiPrefetchData);
      } else {
        xhr.response = xhr.responseText;
      }
    } else {
      xhr.responseText = JSON.stringify(apiPrefetchData);
      if (xhr.responseType === 'json') {
        xhr.response = apiPrefetchData;
      } else {
        xhr.response = xhr.responseText;
      }
    }
  }

})(XMLHttpRequest);
