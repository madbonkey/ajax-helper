//noinspection ThisExpressionReferencesGlobalObjectJS
/**
 * Created by nicoschneider on 07/03/15.
 */

// UMD dance - https://github.com/umdjs/umd
!function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(root.jQuery);
    }
}(this, function ($) {
    'use strict';

    // Default options
    var defaults = {
        selector:       '*[data-ajax="true"]',
        defaultMethod:  'post',
        preventDefault: true,
        namespaces:     [
            'aael',
            'ajax'
        ],
        csrfToken:      $('meta[name="aael-csrf-token"]').attr('content')
    };

    var AjaxHelper = function (context, options) {
        this.context = context;
        this.options = $.extend(true, {}, this.defaults, options);
    };

    // AjaxHelper methods and shared properties
    AjaxHelper.prototype = {

        // Reset constructor - http://goo.gl/EcWdiy
        constructor: AjaxHelper,

        init: function () {
            this.registerHandlers();
        },

        registerHandlers: function () {
            // Make 'em live
            $(this.context).on(
                'click',
                this.options.selector,
                this.handlers.click.bind(this)
            );
        },

        ajaxCallbacks: {

            // our success handler is just a wrapper to fire
            // an event with all the data we have
            // (because we can, right?)
            success: function (context, data) {

                return (function (context, data, response, status, request) {

                    // we'll clone this using Array.slice() to not pollute
                    // the "global" event namespaces for later use
                    var successEventNamespace = context.options.namespaces.slice(0);

                    // the event namespace will also contain
                    // a "success" part
                    successEventNamespace.push(data.namespace, 'success');

                    var eventPayload = {
                        response: response,
                        status:   status,
                        request:  request,
                        target:   data.target,
                        payload:  data.payload
                    };

                    data.target.trigger(successEventNamespace.join('.'), [
                        eventPayload
                    ]);

                }).bind(this, context, data);

            },

            // our error handler is just a wrapper to fire
            // an event with all the data we have
            error:   function (context, data) {

                return (function (context, data, response, status, request) {

                    // we'll clone this using Array.slice() to not pollute
                    // the "global" event namespaces for later use
                    var errorEventNamespace = context.options.namespaces.slice(0);

                    // the event namespace will also contain
                    // an "error" part
                    errorEventNamespace.push(data.namespace, 'error');

                    var eventPayload = {
                        response: JSON.parse(response.responseText),
                        status:   status,
                        request:  request,
                        target:   data.target,
                        payload:  data.payload
                    };

                    data.target.trigger(errorEventNamespace.join('.'), [
                        eventPayload
                    ]);

                }).bind(this, context, data);
            }
        },

        builders: {

            clickData: function (clickEvent) {

                var target = $(clickEvent.target).closest('*[data-ajax="true"]');

                var data = {
                    target: target,
                    method: (typeof target.attr('data-method') != "undefined") ? target.attr('data-method') : this.options.defaultMethod
                };

                if (target.attr('data-url') == "") {
                    throw new DOMException("You MUST set a data-url attribute on your ajax element that contains a valid URL.");
                } else {
                    data.url = target.attr('data-url');
                }

                if (typeof target.attr('data-json-payload') != "undefined") {
                    try {
                        data.payload = JSON.parse(target.attr('data-json-payload'));
                    } catch (exception) {
                        console.warn("The data-json-payload attribute MUST contain a valid JSON string!");
                        console.warn(exception);
                    }
                }

                if (target.attr('data-namespace') !== "") {
                    data.namespace = target.attr('data-namespace');
                } else {
                    throw new DOMException("Please provide an event namespace like myAction via the data-namespace attribute.");
                }

                return data;
            },

            beforeEvent: function (data) {

                // we'll clone this using Array.slice() to not pollute
                // the "global" event namespaces for later use
                var beforeEventNamespace = this.options.namespaces.slice(0);

                // create a "before" event to give users
                // the ability to intervene for the purpose
                // of confirmation dialogs etc
                beforeEventNamespace.push(data.namespace, 'before');

                return new $.Event(beforeEventNamespace.join('.'), {
                    data: data
                });

            },

            ajaxRequestParams: function (data) {
                // we build the ajax request parameters from
                // the data object we get from this.clickData()
                // we use $.extend with an empty object to
                // achieve cloning (neccessary?)
                return $.extend({}, {
                    url:     data.url,
                    type:    data.method.toUpperCase(),
                    data:    data.payload,
                    headers: {
                        "X-CSRF-TOKEN": this.options.csrfToken
                    },
                    success: this.ajaxCallbacks.success.call(this, this, data),
                    error:   this.ajaxCallbacks.error.call(this, this, data)
                });
            }

        },

        fireAjaxRequest: function (data) {
            var ajaxParams = this.builders.ajaxRequestParams.call(this, data);
            $.ajax(ajaxParams);
        },

        handlers: {
            click: function (event) {

                // Configurable default prevention
                if (this.options.preventDefault) {
                    event.preventDefault();
                }

                // gather all data from the event target
                // (or rather, the target's closest ajax
                // element (data-ajax="true"))
                var data = this.builders.clickData.bind(this)(event);

                // build a before event we can fire to give
                // users the chance to interfere with the
                // ajax call (event handlers MUST return a
                // promise for that!)
                var beforeEvent = this.builders.beforeEvent.apply(this, [data]);

                // trigger the before event
                data.target.trigger(beforeEvent);

                // crude check for a jquery promise
                if (beforeEvent.result !== null
                    && typeof beforeEvent.result == "object"
                    && typeof beforeEvent.result.done == "function") {

                    // this handles the case of a promise
                    beforeEvent.result.done(function (passed) {
                        // we check the resolve(value) for a truthy
                        // value and in that case fire
                        // the ajax request
                        if (passed) {
                            this.fireAjaxRequest.apply(this, [data]);
                        }
                    }.bind(this));

                } else if (beforeEvent.result !== false) {
                    // otherwise, we fire the request anyway. boo-hoo.
                    this.fireAjaxRequest.apply(this, [data]);
                }

            }
        }
    };

    $.fn.ajaxHelper = function (options) {
        options = $.extend(true, {}, defaults, options);

        return this.each(function () {
            var $this = $(this);
            var instance = new AjaxHelper($this, options);
            instance.init();
            $this.data('ajaxHelper', instance);
        });
    };

    // Expose defaults and Constructor (allowing overriding of prototype methods for example)
    $.fn.ajaxHelper.defaults = defaults;
    $.fn.ajaxHelper.AjaxHelper = AjaxHelper;

});