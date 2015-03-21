# Ajax Helper v1.0.0

A simple jQuery AJAX helper plugin that uses HTML5-data attributes.

## Project Status


## Installation

### With Bower

* Just run `bower install --save ajax-helper`

### Manual

Although we strongly recommend an AMD-module loader like Require.js, you can absolutely use `ajax-helper.js` without one:

* Drop the `ajax-helper.js` file in your vendor javascript directory, or wherever.
* Make sure to load jQuery before you load `ajax-helper.js` in your HTML.

## Usage

You can basically attach `ajax-helper.js` to anything. It's just syntactic sugar that frees you from binding i.e. `click` event handlers to stuff and firing XHR requests manually.

### With Require.js

* Configure Require to look for `ajax-helper.js` by adding it to Require's `path` configuration just like any other AMD module.
* Shim Require to make jQuery a dependency.
* Use like this:

```javascript
require['jquery', 'ajaxHelper'], function($) {
	$('selector').ajaxHelper();
}
```

### Manual

You'll have the `.ajaxHelper()` function availiable as a normal jQuery plugin.

## Cookbook

### Confirmation dialogs and the like, or: the `before` event and its adventures.

Follows.

### Result events, or: `success` and `error` events.

Follows.

# Roadmap & Contribution

* Get rid of jQuery dependency
* Maybe use some of the new browser APIs like `fetch`
* Make this more robust and versatile