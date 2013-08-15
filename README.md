sapit
=====

Server API tester

Currently it can test servers via XHR requests, other protocols will be added in future.
Sapit provide one global namespace **sapit**
Sapit use _document.body_ as output block for results but you can change it by setting sapit.config.root to desire DOMNode.

Sapit have a two dependenses - jQuery and Vow promises:

http://jquery.com/download/

https://github.com/dfilatov/jspromise

So, you must add it to test page before sapit.

***

sapit.test - main test function.

    sapit.test(
        'Common',                               // Name of test group
        'Get test entity',                      // Title for test
        '/test',                                // URL for request
        'get',                                  // method for request - get, post, delete, put
        {name: 'Jonh', age: 21},                // data, that will be send to server in request
        function (result) {
          return result.info === 'John, 21';    // success test function
        }                                     
    ); 

