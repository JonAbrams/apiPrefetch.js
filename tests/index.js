describe('prefetchAPI', function () {
  describe('single prefetchData loaded', function () {
    beforeEach(function () {
      window.apiPrefetchData = JSON.stringify({ loaded: true });
    });

    describe('raw XHR', function () {
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

      it('hits the real API the second time');

      it('hits the real API the first time with a post call');
    });

    describe('jquery $.get', function () {
      it('loads prefetched data', function () {
        return $.getJSON('/api/test')
        .done(function (res) {
          res.should.eql({ loaded: true});
        });
      });

      it('hits the real API the second time');

      it('hits the real API the first time with a post call');
    });

    describe('angular $http', function () {
      it('loads prefetched data');

      it('hits the real API the second time');

      it('hits the real API the first time with a post call');
    });
  });

  describe('single prefetchData loaded', function () {
    beforeEach(function () {
      window.apiPrefetchData = {
        '/api/test': { data: 'abc' },
        '/api/test2': JSON.stringify({ data: 123 })
      };
    });

    it('loads both', function () {
      return $.getJSON('/api/test')
      .done(function (res) {
        res.should.eql({ data: 'abc' });
        return $.getJSON('/api/test2')
        .done(function (res) {
          res.should.eql({ data: 123 });
        });
      });
    });
  });
});
