# PrefetchAPI.js

A generic library for the browser that automatically skips the initial API call that JS makes if the data is already available.

It overrides the browser's default XMLHttpRequest constructor, so it should work with any framework, including jQuery, AngularJS, EmberJS, BackboneJS, etc.

This library works really well with the NodeJS back-end framework [Synth](https://www.synthjs.com/).

## Usage

Load apiPrefetch.js before you load any other JS code, especially any that would access XMLHttpRequest.

Configure your server to preload the results of an initial API get request into a global variable called **apiPrefetchData**.

Voila, now when you go to make the initial API request, if it's there, it's returned without needing to make another round-trip to the server.

After the initial API request, all future requests will actually go out and hit your API as usual.

## Example

This is a raw example, but *hopefully* libraries like jQuery and AngularJS will *just work*. (This has yet to be tested, and they likely won't *just* work)

```html
<html>
  <head>
    <title>Example</title>
    <script>
      window.apiPrefetchData = {
        title: 'Winter is Coming…'
      };
    </script>
  </head>
  <body>
    <div id="title"></div>
    <script src="apiPrefetch.js"></script>
    <script>
      var xhr = new XMLHttpRequest();
      xhr.open('get', '/api/posts');
      xhr.send();
      xhr.responseType = 'json';
      xhr.onload = function () {
        document.getElementById('title').innerText = this.response.title;
      };
    </script>
  </body>
</html>

```

## Limitations

In order for the library to work its magic, the xhr objects it generates only have **open** and **send** methods. More can be added if needed though.

Also, callbacks should be assigned to the xhr's onload property. Support for **addEventListener** isn't in yet.


## FAQ

### Isn't this a huge hack?

Couldn't you say the same for AJAX itself? The X stands for XML and you're fetching JSON. You're already making the browser do things it wasn't originally intended to do :)

## Credit

Created by [Jon Abrams](https://twitter.com/JonathanAbrams)
