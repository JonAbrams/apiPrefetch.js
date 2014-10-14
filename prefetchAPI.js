(function (XHR) {
  'use strict';

  var XHR = XMLHttpRequest;

  var phonyXHR = function FakeXMLHttpRequest () {
    var self = this;

    self.xhr = new XHR();

    self.getAllResponseHeaders = self.xhr.getAllResponseHeaders.bind(self.xhr);
    self.setRequestHeader = self.xhr.setRequestHeader.bind(self.xhr)

    ['onload', 'onerror', 'onprogress', 'onabort'].forEach(function (event) {
      Object.defineProperty(self, event, {
        set: function (func) {
          self.xhr[event] = func;
          self[event + 'Func'] = func; /* Using a different prop to avoid infinite loop */
        },
        get: function () {
          return self.xhr[event];
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

    /* If we're not prefetching, open the xhr request like normal */
    if (!self.apiPrefetchExecuting) {
      return self.originalSelf.open.apply(self.xhr, arguments);
    }
  };

  phonyXHR.prototype.send = function () {
    var self = this;

    if (!self.apiPrefetchExecuting) {
      self.xhr.onload = self.onload;
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
