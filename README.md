# Ajax Helper v1.0.0

[![VersionEye](https://www.versioneye.com/user/projects/550d67aca80b5f498900010c/badge.svg?style=flat)](https://www.versioneye.com/user/projects/550d67aca80b5f498900010c)

A simple jQuery AJAX helper plugin that uses HTML5-data attributes.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of Contents

  - [Installation](#installation)
    - [With Bower](#with-bower)
    - [Manually](#manually)
  - [Usage](#usage)
    - [With Require.js](#with-requirejs)
    - [Manual](#manual)
  - [Reference/Cookbook](#referencecookbook)
    - [Options, or: What the hell can I do?](#options-or-what-the-hell-can-i-do)
    - [HTML5 Data Attributes](#html5-data-attributes)
    - [Event callback arguments](#event-callback-arguments)
      - [Getting the original target element](#getting-the-original-target-element)
      - [Getting the request that is being/was made](#getting-the-request-that-is-beingwas-made)
      - [Getting the server's response](#getting-the-servers-response)
    - [Full(y contrived) example with confirmations!](#fully-contrived-example-with-confirmations)
    - [Confirmation dialogs and the like, or: the `before` event and its adventures.](#confirmation-dialogs-and-the-like-or-the-before-event-and-its-adventures)
    - [Result events, or: `success` and `error` events.](#result-events-or-success-and-error-events)
    - [Payloads or: How to get additional data to my backend?](#payloads-or-how-to-get-additional-data-to-my-backend)
- [Roadmap & Contribution](#roadmap-&-contribution)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

### With Bower

* Just run `bower install --save ajax-helper`

### Manually

Although we strongly recommend an AMD-module loader like Require.js, you can absolutely use `ajax-helper.js` without one:

* Drop the `ajax-helper.js` file in your vendor javascript directory, or wherever.
* Make sure to load jQuery before you load `ajax-helper.js` in your HTML.

## Usage

You can basically attach `ajax-helper.js` to anything. It's just syntactic sugar that frees you from binding i.e. `click` event handlers to stuff and firing XHR requests manually.

Initializing `ajax-helper.js`. See Reference/Options for more information.

```javascript
$('body').ajaxHelper({
    selector: '*[data-ajax="true"]'
});
```

This initializes our helper on all elements with `data-ajax="true"` set. Since we most likely want to bind to dynamically created elements as well, you'll want to call `.ajaxHelper()` on an element high in the DOM. The `selector` you can pass will attach events to all elements matched by the passed selector.

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

* `selector`:*`string`* **required**

	Default: `'*[data-ajax="true"]'`

	This option is used to bind the actual `click` event to the elements that match. Let's say you want `ajax-helper.js` to handle clicks on all `<a data-ajax="true"></a>` elements:

	```javascript
		require(['jquery', 'ajaxHelper'], function ($) {
			$(document).ajaxHelper({
				selector: 'a[data-ajax="true"]'
			});
		});
	```

	The reason you can't bind to the `<a>` directly is that you most likely have to deal with dynamically generated elements. We do this with jQuery's `.on()` method by taking the context selector (in this example, `$(document)` and the actual selector you pass into something like `$(context).on('click', selector, callback)`.

* `defaultMethod`:*`string`*

	Default: `'post'`

	Use this option to control with which method the AJAX request will be made (`'get'`, `'post'`).

* `preventDefault`:*`boolean`*

	Default: `true`

	This option controls whether the `click` event receives a `.preventDefault()` call before anything else is done. We don't know if this is useful, but it's in.

* `namespaces`:*`string[]`*

	Default: `['helper', 'ajax']`

	A string array containing the namespace parts for all events that are fired. Will be converted to the jQuery event dot notation (`'helper.ajax'`).

* `csrfToken`:*`string`*

	Default: `$('meta[name="ajax-csrf-token"]').attr('content')`

	Set your CSRF token here. How you get the token is up to you. By default, it looks for a meta tag with the name `ajax-csrf-token` using jQuery.

* `csrfTokenKey`:*`string`* **coming soon**

	Default: `'_token'`

	Set the key under which your CSRF token is sent to the server.

### HTML5 Data Attributes

* `data-url`:*`string`* **required**

	Provide the endpoint URL the AJAX call is made to.

* `data-method`:`'post'|'get'`

	You can override the request method on a per-element basis with this attribute. To set a value globally, use the `defaultMethod` option.

* `data-payload`:*`string`*

	You can pass a JSON string here wich gets sent to the sever under the `payload` key here. `ajax-helper.js` will try to parse the value of this attribute to JSON!

* `data-namespace`:*`string`*

	Provide an additional namespace part for this "action" only. Let's say you have a "delete post" action button which is handled via AJAX. You'll want to set `data-namespace="deletePost"` on your element. This will result in the following event being fired (change the first part of each event name to whatever global namespace you provided the ajax helper with) for you to hook into:

	* `helper.ajax.deletePost.before`
	* `helper.ajax.deletePost.success`
	* `helper.ajax.deletePost.error`

### Event callback arguments

As you can see, a maximum of three events are fired for each AJAX action you choose to handle with our little tool (`success` and `error` won't get fired if your `before` handler resolves its promise with `false`).

All event handlers will have access to an `event` argument as well as a `params` argument, which contain very useful data and objects for you to work with. The quick overview below should cover the most important/useful data. For anything more detailed, please et some breakpoints in your event handlers to see what's availlable.

#### Getting the original target element

You can access the element on which the `click` event originated by accessing the `event.target` property, no matter which selectors you bound to.

#### Getting the request that is being/was made

jQuery's AJAX request is stored in `params.request`. Go nuts.

#### Getting the server's response

The server's response is availlable in `params.response`. Note that it *will try to parse the response as JSON*. This behaviour is historic and will be refactored eventually.

### Full(y contrived) example with confirmations!

To begin, include everything as outlined in the Intallation section. We'll assume you use Require.js in this example. The scenario is a simple "delete action" which we'd like to handle ajaxically (that's a word now). Let's have a button:

```html
	<div class="post-actions">
        <a  href="#"
            data-ajax="true"
            data-url="http://example.com/api/v1/post/delete/1"
            data-namespace="deletePost"
        >
            <i class="icon icon-trash"></i> Delete post
        </a>
    </div>
```

To activate `ajax-helper.js`:

```javascript
    require(['jquery', 'ajaxHelper'], function ($) {
        $(document).ajaxHelper({
        	namespaces: ['myCoolProject', 'ajax']
        });
    });
```

The default options will take care of everything else (the default selector matches `*[data-ajax="true"]`).

Now, to add a confirmation, we bind an event handler. The global namespace is `myCoolProject.ajax`, as defined in the plugin initialisation object. The actual action's namespace is `deletePost`, as defined in the `data-namespace` attribute on our button. This will result in the fully qualified before event name: `myCoolProject.ajax.deletePost.before`:

```javascript
    $(document).on('myCoolProject.ajax.deletePost.before', '.post-actions', function(event, params) {
        var confirm = new $.Deferred();

        // replace with your custom confirmation logic:
        var userResponse = window.confirm('Do you really want to delete that post?');

        confirm.resolve(userResponse);

        return confirm.promise();
    });
```

This will fire the AJAX call depending on the `boolean` value of `userResponse`. Please note that `window.confirm()` is horrible, and used here solely as an example. We like to use Bootbox. More information on the before event can be found in the next chapter.

Now, to handle results, we bind to the `success` and `error` events respectively:

```javascript
	// we made it!
    $(document).on('myCoolProject.ajax.deletePost.success', '.post-actions', function(event, params) {
        window.alert('Post deleted successfully!');
    });

    // whoops ...
    $(document).on('myCoolProject.ajax.deletePost.error', '.post-actions', function(event, params) {
		console.warn("Something went wrong ...");
    });
```

You can obviously do anything you like in these callbacks, like handling notifications or animations. Please note that using `window.alert()` is horrible. Shame on you.

### Confirmation dialogs and the like, or: the `before` event and its adventures.

You will most likely add a confirmation of some sort to some of your AJAX calls. `ajax-helper.js` makes use of jQuery's Deferred/Promise implementation.

Assuming you have everything else set up, bind an event handler to your action's before event (assuming a "delete post" action like in the other examples):

```javascript
	$(document).on('helper.ajax.deletePost.before', '.my-actions', function(event, params) {
		// Confirmation code here ...
	});
```

Note that you bind the event to the `document` object, not the button element itself. This, again, is to allow for dynamically created elements. Pass the selector of the element that *actually receives the click event* as the second parameter (`.my-actions` in this example). Events will bubble as expected, so it's up to you whether you pass the selector for the element that is clicked, or to some sort of container.

Next, you have to create a new Deferred object and use it to resolve your confirmation, and return its Promise object from the event:

```javascript
	$(document).on('helper.ajax.deletePost.before', '.my-action-button', function(event, params) {
		var confirm = new $.Deferred();

		// Confirmation code here ...

		// (We'll assume your user prompt returns a boolean
		// in a variable called "userResponse")

		// Resolve the user's response
		confirm.resolve(userResponse);

		// Return the Deferred's Promise
		return confirm.promise();
	});
```

This might seem somewhat complicated, but it's only three additional lines. Come on, now. Also note that it is *not neccessary* to do all this if your before event handler doesn't handle anything that has to wait for user input. If you just want to start an animation or something like that, you don't need Deferreds and Promises.

**Important:** the Deferred's `.resolve()` method expects a boolean value indicating whether to proceed with the AJAX call (`true`) or cancel it (`false`). We have not tested `ajax-helper.js` with multiple before event handlers for *one* action element, because we couldn't find a valid use case.

### Result events, or: `success` and `error` events.

The `success` and `error` events are different from the before events, as their return values do not have any effect. You can think of these as direct callbacks for jQuery's `$.ajax({success/error: callback})`. Do whatever you like (end animations, hiding, moving, notifications, ...).


### Payloads or: How to get additional data to my backend?

To have `ajax-helper.js` send additional data to your backend, use the `data-payload` attribute. Simply pass in a JSON string with all the information you need, and it will be sent along with the rest under the `payload` key of the request body.

# Roadmap & Contribution

* Get rid of jQuery dependency
* Maybe use some of the new browser APIs like `fetch`
* Make this more robust and versatile
* Support more events/callbacks to hook into processing logic. Yay callbacks!

If you'd like to contribute, feel free to send pull requests. Especially the jQuery dependency should be removed entirely.

Licensed under MIT.