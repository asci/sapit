sapit
=====

Server API tester

run `node test-server` then open http://127.0.0.1:8080/test.html and look for results in browser

Currently it can test servers via XHR requests, other protocols will be added in future.
Sapit provide one global namespace **sapit**

Sapit have a two dependencies - jQuery and Vow promises:

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
