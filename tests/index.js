describe('prefetchAPI', function () {
  describe('prefetchData loaded', function () {
    beforeEach(function () {
      window.apiPrefetchData = { loaded: true };
    });
    afterEach(function () {
      delete window.apiPrefetchData;
    });

    it('loads prefetched data', function (done) {
      var xhr = new XMLHttpRequest();
      xhr.open('get', '/api/test');
      xhr.send();
      xhr.onload = function () {
        this.response.should.eql('{"loaded":true}');
        done();
      };
    });

    it('loads prefetched data with onload declared earlier', function (done) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        this.response.should.eql('{"loaded":true}');
        done();
      };
      xhr.open('get', '/api/test');
      xhr.send();
    });

    it('loads prefetched data as parsed JSON', function (done) {
      var xhr = new XMLHttpRequest();
      xhr.open('get', '/api/test');
      xhr.send();
      xhr.responseType = 'json';
      xhr.onload = function () {
        this.response.should.eql({ loaded: true });
        done();
      };
    });

    it('trys the real API after the second time', function (done) {
      var xhr = new XMLHttpRequest();
      xhr.open('get', '/api/test');
      xhr.send();
      xhr.responseType = 'json';
      xhr.onload = function () {
        this.response.should.eql({ loaded: true });
        xhr.send.should.throw();
        done();
      };
    });
  })
});
