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
        _isReady,
        _inCanvas,
        _eventTarget;
    
    // Plugin declaration
    $.facebook = function(appId, options) {
        // Ensure FB appId is passed and SDK isnt already initiated
        if(!appId || _isInitd) {
            return;
        } else {
            _isInitd = true;
        }
        
        _settings = $.extend({}, $.facebook.settings, options);
        _eventTarget = $(_settings.eventTarget);
        _inCanvas = (
            (window.location.search.indexOf('fb_sig_in_iframe=1')>-1) ||
            (window.location.search.indexOf('session=')>-1) ||
            (window.location.search.indexOf('signed_request=')>-1) ||
            (window.name.indexOf('iframe_canvas')>-1) ||
            (window.name.indexOf('app_runner')>-1)
        );
        
        _setupPage(function() {
            _initSdk($.extend(_settings.initConfig, {
                appId: appId    // Add the passed in appId to the config object for init
            }));
        });
        
        // Successfully initiated
        return true;
    };
    
    // Expose
    $.extend($.facebook, {
        // Execute code only once FB is ready, with the option to wait till auth
        ensure: _ensureInit,
        // Context check to execute code depending on whether site is in FB Canvas or not
        context: _execContextSwitch,
        // Default options for plugin
        settings: {
            staticPageSize: false,
            eventTarget: document,
            userLogged: undefined,
            locale: 'en_GB',
            initQueue: [],
            initConfig: {
                status: true,
                cookie: true,
                xfbml: true
            },
            onLogout: function() { window.location.reload(); },
            onLogin: function() { window.location.reload(); }
        }
    });
    
    // Private methods
    function _setupPage(loadCallback) {
        // Insert the required DOM elm
        $('body').append('<div id="fb-root" />');
        
        // Asynchronously load in the JS SDK
        $.getScript('//connect.facebook.net/'+ _settings.locale +'/all.js', loadCallback);
        
        // Ensure all external links point to target=_top to avoid nasty placeholder page
        _ensureExternalLinks();
    }
    
    function _initSdk(config) {
        FB.init(config);
        FB.Canvas.scrollTo(0, 0);   // Ensure we are at the top of page on load
        FB.getLoginStatus(_handleUserStateChange);
        
        if(!_settings.staticPageSize) {
            FB.Canvas.setAutoGrow();
        }

        _isReady = true;
        
        _exposeYourself();
        _processInitQueue();
        _initEvents();
        
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
    
    function _ensureInit(callback, waitForAuth) {
        if(!_isReady || (waitForAuth && !_isAuthed)) {
            setTimeout(function() {
                _ensureInit(callback, waitForAuth);
            }, 100);
        } else if(callback) {
            callback();
        }
    }
    
    function _execContextSwitch(canvasCallback, normalCallback) {
        return _inCanvas ? canvasCallback() : normalCallback();
    }
    
    function _ensureExternalLinks() {
        if(_inCanvas) {
            // Only apply to external links
            $('a[href^="http"]').not('[href*="'+ window.location.host +'"], [target]').each(function() {
                $(this).attr('target', '_top');
            });
        }
    }
    
    function _exposeYourself() {
        // Exposing these can be useful
        $.extend($.facebook, {
            inCanvas: _inCanvas,
            isReady: _isReady,
        });
    }
})(jQuery, window, document);