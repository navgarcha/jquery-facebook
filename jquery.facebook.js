/*
* jQuery Facebook - plugin to assist with the developement
* of Facebook applications using the Facebook JS SDK.
*
* Copyright (c) 2011-2012 Navkaran Garcha <nav_garcha@hotmail.co.uk>
*
* Licensed under the MIT license:
*   http://www.opensource.org/licenses/mit-license.php
*
* Version: 0.1
* Dependencies: jQuery
* Usage: jQuery.facebook( fbAppId [, settings] )
*
*/

(function($, window, document, undefined) {
    // Private variables
    var _settings,
        _isAuthed,
        _isInitd,
        _inCanvas,
        _eventTarget;
    
    // Plugin declaration
    $.facebook = function(appId, options) {
        // Ensure FB appId is passed and SDK isnt already initiated
        if(!appId || _isInitd) return;
        
        _inCanvas = window.top != window;
        _settings = $.extend({}, $.facebook.settings, options);
        _eventTarget = $(_settings.eventTarget);
        
        _setupPage(function() {
            _initSdk($.extend(_settings.sdkInitOpts, {
                appId: appId    // Add the passed in appId to the config object for init
            }));
        });
        
        // Successfully initiated
        return true;
    };
    
    // Default options for plugin
    $.facebook.settings = {
        staticPageSize: false,
        eventTarget: document,
        userLogged: undefined,
        initQueue: [],
        sdkInitOpts: {
            status: true,
            cookie: true,
            xfbml: true
        },
        onLogout: function() { window.location.reload(); },
        onLogin: function() { window.location.reload(); }
    };
    
    // Private methods
    function _setupPage(loadCallback) {
        // Insert the required DOM elm
        $('body').append('<div id="fb-root" />');
        
        // Asynchronously load in the JS SDK
        $.getScript('//connect.facebook.net/en_US/all.js', loadCallback);
    }
    
    function _initSdk(settings) {
        FB.init(settings);
        FB.Canvas.scrollTo(0, 0);   // Ensure we are at the top of page on load
        FB.getLoginStatus(_handleUserStateChange);
        
        if(!_settings.staticPageSize) {
            FB.Canvas.setAutoGrow();
        }
        
        _isInitd = true;
        
        _initEvents();
        _processInitQueue();
        _exposeYourself();
        
        _eventTarget.trigger('ready.facebook');
    }
    
    function _processInitQueue() {
        while(_settings.initQueue.length) {
            var callback = _settings.initQueue.shift();
            if(typeof callback === 'function') {
                callback();
            }
        }
        
        _eventTarget.trigger('clearqueue.facebook');
    }
    
    function _initEvents() {
        FB.Event.subscribe('auth.statusChange', _handleUserStateChange);
        
        if(_settings.userLogged !== undefined) {
            _eventTarget.bind('userlogout.facebook', _settings.onLogout);
            _eventTarget.bind('userlogin.facebook', _settings.onLogin);
        }
    }
    
    function _handleUserStateChange(state) {
        _isAuthed = !!state.authResponse;
        
        if(_settings.userLogged !== undefined) {
            if(!_isAuthed && _settings.userLogged) {
                _eventTarget.trigger('userlogout.facebook');
            } else if(_isAuthed && !_settings.userLogged) {
                _eventTarget.trigger('userlogin.facebook');
            }
        }
    }
    
    function _exposeYourself() {
        // Expose to public 
        $.extend($.facebook, {
            // Exposing these can be useful
            inCanvas: _inCanvas,
            isReady: _isInitd,
            // Execute code only once FB is ready, with the option to wait till auth
            ensure: function(callback, waitForAuth) {
                if(!_isInitd || (waitForAuth && !_isAuthed)) {
                    setTimeout(function() {
                        $.facebook.ensure(callback, waitForAuth);
                    }, 100);
                } else if(callback) {
                    callback();
                }
            },
            // Context check to execute code depending on whether site is in FB Canvas or not
            context: function(canvasCallback, normalCallback) {
                if(_inCanvas && typeof canvasCallback === 'function') {
                    canvasCallback();
                } else if(!_inCanvas && typeof normalCallback === 'function') {
                    normalCallback();
                }
            }
        });
    }
})(jQuery, window, document);