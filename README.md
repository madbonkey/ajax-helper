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

## Reference/Cookbook

### Options, or: What the hell can I do?

---

#### `selector: string`

**Default value**: `'*[data-ajax="true"]'`

*Documentation in the works.*

---

#### `defaultMethod: string`

**Default value**: `'post'`

*Documentation in the works.*

---

#### `preventDefault: boolean`

**Default value**: `true`

*Documentation in the works.*

---

#### `namespaces: string[]`

**Default value**: `'['aael', 'ajax']'`

*Documentation in the works.*

---

#### `csrfToken: string`

**Default value**: `$('meta[name="aael-csrf-token"]').attr('content')`

*Documentation in the works.*

---

### Confirmation dialogs and the like, or: the `before` event and its adventures.

*Documentation in the works.*

### Result events, or: `success` and `error` events.

*Documentation in the works.*

### Payloads or: How to get additional data to my backend?

*Documentation in the works.*

# Roadmap & Contribution

* Get rid of jQuery dependency
* Maybe use some of the new browser APIs like `fetch`
* Make this more robust and versatile