module('core');

asyncTest('initQueue and events', 5, function () {
    var appId = 168676476542854,
        eventTarget = $('body');
    
    eventTarget.bind('ready.facebook', function() {
        ok($.facebook.isReady, 'fired event ready.facebook on custom eventTarget');  
    });
    
     eventTarget.bind('clearqueue.facebook', function() {
        ok(true, 'fired event clearqueue.facebook on custom eventTarget');  
        start();
    });
    
    $.facebook(appId, {
        eventTarget: eventTarget,
        initQueue: [function() {   
            ok(true, 'queue item 1 executed');  
        }, function() {         
            ok(true, 'queue item 2 executed');  
        }, function() {         
            ok(true, 'queue item 3 executed');
        }]
    });
    
    $.facebook(appId, {
        initQueue: [function() {         
            ok(false, 'should not execute as already initd');  
        }]
    });
});

test('fb-root appended', function() {
    ok($('#fb-root').length, 'fb-root in DOM');
});

test('check inCanvas', function() {
    ok(!$.facebook.inCanvas, 'shouldn\'t be in iframe');
});

test('$.facebook.context switch check', function() {
    $.facebook.context(function() {
        ok(false, 'not in Canvas so shouldn\'t be called');
    }, function() {
        ok(true, 'not in Canvas so should be called');
    });
});

test('$.facebook.ensure check', function() {
    $.facebook.ensure(function() {
        ok(true, 'ready to go');
    })
});

test('external link modifications', function() {
    equals($('a[target="_top"]').length, 2, 'target="_top" assigned to 2 links');
});