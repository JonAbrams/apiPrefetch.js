# PrefetchAPI.js

A generic library for the browser that automatically skips the initial API call that JS makes if the data is already available.

It overrides the browser's default XMLHttpRequest constructor, so it should work with any framework, including jQuery, AngularJS, EmberJS, BackboneJS, etc.

This library works really well with the NodeJS back-end framework [Synth](https://www.synthjs.com/).

[![Build Status](https://travis-ci.org/JonAbrams/apiPrefetch.js.svg?branch=master)](https://travis-ci.org/JonAbrams/apiPrefetch.js)

## Usage

Load apiPrefetch.js before you load any other JS code, especially any that would access XMLHttpRequest.

### Single-API Mode

Configure your server to preload the results of an initial API get request into a global variable called **apiPrefetchData** as a JSON string.

Voila, now when you go to make the initial API request, if it's there, it's returned without needing to make another round-trip to the server.

After the initial API request, all future requests will actually go out and hit your API as usual.

#### Example

```html
<html>
  <head>
    <title>Example</title>
    <script>
      window.apiPrefetchData = "{\"title\":\"Game of Thrones\"}";
    </script>
  </head>
  <body>
    <div id="title"></div>
    <div id="description"></div>
    <script src="apiPrefetch.js"></script>
    <script src="jquery.js"></script>
    <script>
      // First call gets data rendered by the server above
      $.getJSON('/api/title').done(function (res) {
        // Gets called on next tick, seems instantaneous to the user
        $('#title').text(res.title);
      });

      // Second call hits your server
      $.getJSON('/api/description').done(function (res) {
        // Gets called once API call is finished, can be up to 400ms for mobile
        $('#description').text(res.description);
      });
    </script>
  </body>
</html>

```

### Multi-API Mode

If there are multiple API endpoints you want to make available via prefetch, assign an object to **apiPrefetchData** with the keys equal to the endpoint path.

#### Example

```html
<html>
  <head>
    <title>Example</title>
    <script>
      window.apiPrefetchData = {
        "/api/title": "{\"title\":\"Game of Thrones\"}",
        "/api/description": "{\"description\":\"Winter is Coming…\"}"
      };
    </script>
  </head>
  <body>
    <div id="title"></div>
    <div id="description"></div>
    <script src="apiPrefetch.js"></script>
    <script src="jquery.js"></script>
    <script>
      // First call gets data rendered by the server above
      $.getJSON('/api/title').done(function (res) {
        // Gets called on next tick, seems instantaneous to the user
        $('#title').text(res.title);
      });

      // Second call also gets pre-rendered data
      $.getJSON('/api/description').done(function (res) {
        $('#description').text(res.description);
      });
    </script>
  </body>
</html>

```

## An important note on security

Since you will likely be rendering data from users, you need to protect against XSS attacks.

To do so, escape all `/` characters, e.g. `\/`. This prevents users from injecting JS code by closing the script tag the data is rendered into.

## Limitations

If you plan to use the browser's raw XMLHttpRequest class, be aware of the following:

- In order for the library to work its magic, the xhr object it generates currently only has **open** and **send** methods.
- Also, callbacks should be assigned to the xhr's onload property. Support for **addEventListener** and **onreadystatechange** isn't available yet, all the libraries I looked at use **onload**.
- It does work with **responseType**, but only JSON. If you set **responseType** to `"json"`, then `xhr.response` will be an object, not a JSON string.

## FAQ

### Isn't this a huge hack?

Couldn't you say the same for AJAX itself? The X stands for XML and you're fetching JSON. You're already making the browser do things it wasn't originally intended to do :)

## Credit

Created by [Jon Abrams](https://twitter.com/JonathanAbrams)
