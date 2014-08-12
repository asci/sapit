var sapit = require("./lib/index.js");
// Handle passed tests
sapit.on(sapit.PASSED, function (e, data) {
    console.log('<p class="good">' + data.title + ' (' + data.time + ' ms)</p>');
});

// Handle failed tests
sapit.on(sapit.FAILED, function (e, data) {
    console.log('<p class="bad">' + data.title + '<sup>' + data.reason + '</sup></p>');
});

// Add custom header
sapit.beforeRequest(function (xhr) {
    xhr.headers['x-user-token'] = Math.random().toString(35).substr(2, 30);
});

// Add custom params
sapit.beforeRequest(function (xhr, params) {
    params.secret = 'k345hjs345djh56sk6j2ks626jhdf6kjhs';
});

var conds = sapit.conds;

// One test
sapit.test('Simple', 'Should return 404 statusCode', 'https://sapit-c9-asci.c9.io/v1/error', 'get', {}, null, conds.propertyShouldBeEqual('statusCode', 404));

// Serial tests
sapit.test({
        group: 'Entity',
        title: 'Create test entity',
        url: 'https://sapit-c9-asci.c9.io/v1/test',
        method: 'post',
        params: {title: 'Test1'},
        successTest: conds.propertyShouldBeEqual('title', 'Test1')
})
.then(function (test) {
    return sapit.test('Entity', 'Getting test entity', 'https://sapit-c9-asci.c9.io/v1/test/' + test.id, 'get', {}, conds.propertyShouldBeEqual('title', 'Test1'));
})
.then(function (test) {
    return sapit.test('Entity', 'Update test entity', 'https://sapit-c9-asci.c9.io/v1/test/' + test.id, 'put', {title: 'New title'}, conds.propertyShouldBeEqual('title', 'New title'));
})
.then(function (test) {
    return sapit.test('Entity', 'Delete test entity', 'https://sapit-c9-asci.c9.io/v1/test/' + test.id, 'delete', {}, conds.propertyShouldBeEqual('status', 'ok'));
});