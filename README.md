sapit
=====
#####Sapit is a library for testing servers API via http protocol in browser. 
It have 2 dependencies:


* jQuery for requests to server, you can download it here http://jquery.com/download/


* Vow for promise-like interface, you can download it here https://github.com/dfilatov/jspromise


Sapit provides one global object `sapit`. It assumes you test a server responsible in JSON-format, if not - test will be failed.

`sapit` provides function for testing and fire events when starts, failed or passed with a test id as event data.

`sapit.test` function returns promise then will be fulfilled with server response. So, you can chain tests.

Also, `sapit.conds` provides some test function.


### Examples

    // We test server for creation entity
    sapit.test({
      group: 'User', // Test group, default "Common"
      title: 'Create user', // Test title
      url: '/somewhere/user', // resource URL
      method: 'post', // Request method, default GET
      params: {name: 'John'}, // Requset params
      successTest: function (user) {return user.name === 'John'} // Successful response test function
    })

    // #2 Second test - getting created entity
    .then(function (test /* previous test response from server */) {
      return sapit.test({
               group: 'User',
               title: 'Get user',
               url: '/somewhere/user' + test.id,
               successTest: function (user) {return (user.name === 'John' && user.id === test.id)}
             })
    })

### Arguments
You can pass arguments directly:
    `sapit.test('User', 'Delete user', '/somewhere/user' + test.id, method: 'delete', null, function (resp) {return resp.status === 'ok'});`

### Helpers

`sapit.conds` contains some functions which return context-free testing functions

    sapit.conds.propertyShouldBeEqual('name', 'John') // Returns functions which return true if testing object have `name` property and it equals to 'John'
    sapit.conds.equalValuesForKeys(['name', 'age'], {name: 'John', age: 21}) // Returns function which return true if if all keys values (from test object) in first argument are equals to second object keys values. Or, if you pass only one argument and it is object - returns true if all keys values from test and passed objects are equals

Object testing are not deep, so you can't equal objects or arrays as properties

### Handle event

Sapit fire 3 events:
* when you add test - `sapit.PENDING`
* when test passed - `sapit.PASSED`
* when test failed - `sapit.FAILED`

So, you can add handlers for these events in this way:
    sapit.on(sapit.PENDING, function (e, data) {
      data.id // unique test id
    })

For remove handler use `sapit.un`

### For quick demo
run `node test-server` then open http://127.0.0.1:8080/test.html look for results in browser and for sample code at public/test.html

________________________________________________________________________________________________________________________________________

Сапит 
=====
#####библиотека для тестирования серверного API через http протокол в браузере.

У библиотеки 2 зависимости:

* jQuerу - для запросов к серверу, вы можете скачать ее отсюда http://jquery.com/download/
* Vow — для promise-like интерфейса библиотеки, вы можете скачать ее отсюда https://github.com/dfilatov/jspromise

После подключения на страницу библиотека добавляет глобальный объект sapit, через который и отсуществляется тестирование. Sapit предполагает, что севрвер всегда отвечает в JSON, если это не так — тест будет провален. Этот объект предоставляет функцию для создания тестов, а так же генерирует события связанные с этим тестом — добавление запроса, успех и провал тестирования. Эти события можно использовать для визуализации процесса тестирования.

Функция тестирования sapit возвращает promise, в который будет передан ответ от сервера, таким образом можно легко делать цепочки.

Кроме этого, так же доступен объект sapit.conds — который предоставляет набор функций облегчающих тестирование.

### Пример

    // Простой пример на тестирование создания сущности:
    sapit.test({
      group: 'User', // Группа тестов — по умолчанию "Common"
      title: 'Create user', // Название теста
      url: '/somewhere/user', // URL ресурса
      method: 'post', // Метод — по умолчанию GET
      params: {name: 'John'}, // Параметры, передаваемые в запросе
      successTest: function (user) {return user.name === 'John'} // Функция тестирование в случае успешного ответа с сервера
    })

    // Второй тест на получение сущности
    .then(function (test /* результат выполнения предыдущего запроса к серверу */) {
      return sapit.test({
               group: 'User',
               title: 'Get user',
               url: '/somewhere/user' + test.id,
               successTest: function (user) {return (user.name === 'John' && user.id === test.id)}
             })
    })

### Аргументы
Так же можно передавать аргументы напрямую:
    `sapit.test('User', 'Delete user', '/somewhere/user' + test.id, method: 'delete', null, function (resp) {return resp.status === 'ok'});`

### Вспомогательные функции
В объекте conds содержатся такие функции, которые возвращают контексто-независимые функции тестирования — для сокращения количества написанного кода:

    sapit.conds.propertyShouldBeEqual('name', 'John') // Возвращает функцию, которая возвращает true, если у объекта ответа есть свойство name и его значение установлено в John
    sapit.conds.equalValuesForKeys(['name', 'age'], {name: 'John', age: 21}) // Возвращает функцию, которая вернет true если у объекта ответа будут свойства перечисленные в первом аргументе и их значения будут такие же, как у объекта переданного вторым аргументом, а остальные значения будут проигнорированны. Если же будет передан 1 аргумент и он будет объектом, то тестируемый объект будет сравниваться со всеми свойствами эталонного. Если же будет передано 2 массива, то превый массив будет ключами, второй — значениями
    
Тестирование по свойствам происходит неглубокое, то есть если в качестве свойства будет выступать массив или объект, и их значения будут совпадать с тестируемым объектом, то тест все равно будет провален.

### События
Sapit создает три события
* Когда вы добавили тест - `sapit.PENDING`
* Когда тест пройден - `sapit.PASSED`
* Когда тест провален - `sapit.FAILED`

Вы можете добавить слушатели:

    sapit.on(sapit.PENDING, function (e, data) {
      data.id // unique test id
    })
    
Что бы убрать слушатель нужно использовать функцию `sapit.un`

### Запуск тестового примера
запустите `node test-server` из каталога с проектом и откройте страницу http://127.0.0.1:8080/test.html в браузере, чтобы увидеть результат тестирование. Описания тестов находятся в файле public/test.html

