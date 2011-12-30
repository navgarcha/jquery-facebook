# jQuery Facebook Plugin v0.1

Plugin allows for quick and easy setup for the Facebook JS SDK within the jQuery wrapper.   
Look at source for config options till I decide to write up a proper guide. ;)

Exposes useful information such as:     
`jQuery.facebook.inCanvas` - Is page within FB Canvas.  
`jQuery.facebook.isReady` - Can access window.FB.

Provides utility functions:     
`jQuery.facebook.ensure( callback [, waitForAuth] )` - Execute code only once FB has been included and initalised, also have the option to wait for user to be authenticaed before executing.   
`jQuery.facebook.context( canvasCallback, normalCallback )` - Execute certain code depending on whether your code is being run within the FB Canvas or normally.


## Example Usage
``` javascript
$.facebook(1234567890);

$.facebook(1234567890, {   
    initQueue: [function() {         
        console.log('1st');    
    }, function() {         
        console.log('2nd');    
    }, function() {         
        console.log('3rd');    
    }]
});
```

## Contact
* Author: Navkaran Garcha
* Mail: nav_garcha@hotmail.co.uk
* Twitter: @Nav_Garcha