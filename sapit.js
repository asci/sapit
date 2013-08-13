/**
 * User: artem
 * Date: 13.08.13
 * Email: asci@yandex.ru
 * File description:
 */
(function (window, $, Vow) {
  var sapit;
  if (typeof $ !== 'function' || !$().jquery) {
    console.error('Please, check your jQuery version!\n ' +
      'You can download it at http://jquery.com/download/\n' +
      'sapit will work with any version of jQuery.\n' +
      ' If not - contact me https://github.com/asci');
    return;
  }
  if (typeof Vow === 'undefined') {
    console.error('Please, check your Vow promise version!\n ' +
      'You can download it at https://github.com/dfilatov/jspromise\n' +
      'sapit will work with any version of Vow.\n' +
      'If not - contact me https://github.com/asci');
    return;
  }
  sapit = {
    /**
     * Create and store group elems
     * Change whitespace chars to underscore
     * @param {String} group - name of tests group
     * @returns {HTMLElement}
     * @private
     */
    _getGroup: function () {
      var _groups = {};
      return function (group) {
        var _group = group.replace(/\s/g, '_').toLowerCase(),
          elem = _groups[group];

        if (!elem) {
          elem = document.createElement('div');
          $(elem).attr('id', _group);
          $(elem).addClass('test-group');
          $(elem).append('<h3>' + group + '</h3><ul></ul>');
          $(document.body).append(elem);
          _groups[group] = elem;
        }
        return elem;
      }
    }(),
    /**
     * Add pending test string to DOM
     * @param {String} group - name of tests group
     * @param {String} title for test
     * @returns {HTMLElement}
     * @private
     */
    _addPending: function (group, title) {
      var groupElem = this._getGroup(group),
        elem = document.createElement('li');

      $(elem).addClass('pending');
      $(elem).text(title);
      $(groupElem).find('ul').append(elem);
      return elem;
    },
    /**
     * Add result string to DOM
     * @param {String} group - name of tests group
     * @param {String} title for test
     * @param {Boolean} passed test or not
     * @param {String} [reason] if fails will be add as description
     * @param {Number} [ts] duration of request
     * @private
     */
    _addResult: function (group, title, passed, reason, ts, elem) {
      $(elem).removeClass('pending');
      $(elem).addClass(passed ? 'good' : 'bad');
      $(elem).append(ts ? '<sup class="' + (ts < 50 ? 'good' : 'bad') + '"> ' + ts + 'ms</sup>' : '');
      $(elem).append(reason ? '<p>' + reason + '</p>' : '');
    },
    /**
     *
     * @param {String} group - name of tests group
     * @param {String} title for test
     * @param {String} url for request
     * @param {String} method for request: 'get', 'post', 'put', 'delete'
     * @param {Object} params that will send to server
     * @param {Function} successTest - boolean-typed function to test successful response
     * @param {Function} errorTest - boolean-typed function to test error response
     * @returns {Promise}
     * @returns {Promise} promise.fulfill.arguments[0] - received response from server
     */
    test: function (group, title, url, method, params, successTest, errorTest) {
      var ts,
        promise = Vow.promise(),
        elem,
        testError = 'Test didn\'t pass testing function!';

      elem = this._addPending(group, title);

      $.ajax({
        url: url,
        method: method.toUpperCase(),
        data: params,
        beforeSend: function () {
          ts = Date.now();
        },
        success: function (resp) {
          var time = Date.now() - ts;
          try {
            resp = JSON.parse(resp);
            var passed = successTest(resp); //error if successTest is not a Function
            if (title) {
              this._addResult(group, title, passed, !passed ? testError : '', time, elem);
            }
            if (passed) {
              promise.fulfill(resp);
            } else {
              promise.reject();
            }
          } catch (err) {
            this._addResult(group, title, false, err.message, time, elem);
            promise.reject();
          }
        }.bind(this),
        error: function (err) {
          var time = Date.now() - ts;
          if (errorTest) {
            var passed = errorTest(err);
            this._addResult(group, title, passed, !passed ? testError : '', time, elem);
            if (passed) {
              promise.fulfill(err);
            } else {
              promise.reject();
            }
          } else {
            this._addResult(group, title, false, err.responseText, time, elem);
            promise.reject();
          }
        }.bind(this)
      });
      return promise;
    },
    conds: {
      /**
       * Returns test function that receive response object and equals it with etalon object by defined keys
       * Fail if any of defined properties are unequal
       * @param {Array} keys like ['width', 'height', 'id']
       * @param {Object} etalon object
       * @returns {Function}
       */
      equalValuesForKeys: function (keys, etalon) {
        return function (testObj) {
          return !keys.some(function (key) {
            return etalon[key] !== testObj[key];
          })
        }
      },
      /**
       * Returns test function that receive response object and equals it property 'prop' with value 'val'
       * Fail if unequal
       * @param {String} prop
       * @param {String|Number|Boolean} val
       * @returns {Function}
       */
      propertyShouldBeEqual: function (prop, val) {
        return function (testObj) {
          return testObj[prop] === val;
        }
      }
    }
  };
  window['sapit'] = sapit;
}(window, $, Vow));