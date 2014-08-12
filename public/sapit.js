(function (global) {
    var sapit = {

        FAILED: 'failed',

        PASSED: 'passed',

        PENDING: 'pending',

        _groups: {},

        _ids: 0,

        _callbacks: {},

        _beforeRequest: [],

        /**
         * Get promise for test function
         * @returns {promise}
         * @protected
         */
        _getPromise: function _getPromise() {
            return Vow.promise();
        },

        /**
         * Add function to before request queue
         * @param func
         */
        beforeRequest: function (func) {
            this._beforeRequest.push(func);
        },

        /**
         * Remove function from before request queue
         * @param func
         */
        removeBeforeRequest: function (func) {
            var ind = this._beforeRequest.indexOf(func);
            if (ind !== -1) {
                this._beforeRequest.splice(ind, 1);
            }
        },
        /**
         * Add event handler
         * @param {String} event - event name
         * @param {Function} func - callback
         */
        on: function (event, func) {
            if (func.constructor === Function) {
                if (!this._callbacks[event]) {
                    this._callbacks[event] = [];
                }
                this._callbacks[event].push(func);
            }
        },

        /**
         * Remove event handler
         * @param {String} event - event name
         * @param {Function} func - callback
         */
        off: function (event, func) {
            if (this._callbacks[event]) {
                var ind = this._callbacks[event].indexOf(func);
                if (-1 !== ind) {
                    this._callbacks[event].splice(ind, 1);
                }
            }
        },

        /**
         * Fire event with data
         * @param {String} event - event name
         * @param {Object} data - event data
         */
        trigger: function (event, data) {
            if (this._callbacks[event] && this._callbacks[event].length) {
                this._callbacks[event].forEach(function (func) {
                    func(event, data);
                })
            }
        },

        _addPending: function (group, title) {
            var index;
            if (!this._groups[group]) {
                this._groups[group] = [];
            }

            this._ids++;
            this._groups[group].push({
                title: title,
                id:    this._ids
            });
            index = this._groups[group].length - 1;

            this.trigger(this.PENDING, {
                group: group,
                index: index,
                title: title,
                id:    this._ids
            });

            // Return id
            return index;
        },

        _addResult: function (group, title, passed, reason, ts, index) {
            this._groups[group][index].passed = passed;
            this._groups[group][index].reason = reason;
            this._groups[group][index].time = ts;
            if (passed) {
                this.trigger(this.PASSED, {
                    title: title,
                    group: group,
                    time:  ts,
                    id:    this._groups[group][index].id
                });
            } else {
                this.trigger(this.FAILED, {
                    title:  title,
                    group:  group,
                    time:   ts,
                    reason: reason,
                    id:     this._groups[group][index].id
                });
            }

        },
        /**
         *
         * @param {String|Object} group - name of tests group
         * @param {String} [title] for test
         * @param {String} [url] for request
         * @param {String} [method] for request: 'get', 'post', 'put', 'delete'
         * @param {Object} [params] that will send to server
         * @param {Function} [successTest] - boolean-typed function to test successful response]
         * @param {Function} [errorTest] - boolean-typed function to test error response]
         * @returns {Promise}
         * @returns {Promise} promise.fulfill.arguments[0] - received response from server
         */
        test: function (group, title, url, method, params, successTest, errorTest) {
            var ts,
                promise = this._getPromise(),
                index,
                _this = this,
                testError = 'Test didn\'t pass testing function!';

            if (typeof group === 'object' && arguments.length === 1) {
                title = group.title;
                url = group.url;
                method = group.method;
                params = group.params;
                successTest = group.successTest;
                errorTest = group.errorTest;
                group = group.group;
            }

            method = method || 'get';
            group = group || 'Common';

            index = this._addPending(group, title);

            $.ajax({
                url: url,
                method: method.toUpperCase(),
                data: params,
                beforeSend: function (xhr, params) {
                    ts = Date.now();
                    _this._beforeRequest.forEach(function (before) {
                        try {
                            before(xhr, params);
                        } catch (err) {
                            _this._addResult(group, title, false, "Failed before request " + err.message, 0, index);
                        }
                    });
                },
                success: function (resp) {
                    var time = Date.now() - ts;
                    try {
                        resp = JSON.parse(resp);
                        var passed = successTest(resp); //error if successTest is not a Function
                        if (title) {
                            _this._addResult(group, title, passed, !passed ? testError : '', time, index);
                        }
                        if (passed) {
                            promise.fulfill(resp);
                        } else {
                            promise.reject();
                        }
                    } catch (err) {
                        _this._addResult(group, title, false, err.message, time, index);
                        promise.reject();
                    }
                },
                error: function (err) {
                    var time = Date.now() - ts;
                    if (errorTest) {
                        var passed = errorTest(err);
                        _this._addResult(group, title, passed, !passed ? testError : '', time, index);
                        if (passed) {
                            promise.fulfill(err);
                        } else {
                            promise.reject();
                        }
                    } else {
                        _this._addResult(group, title, false, err.responseText, time, index);
                        promise.reject();
                    }
                }
            });
            return promise;
        },
        conds: {
            /**
             * Returns test function that receive response object and equals it with etalon object by defined keys
             * Fail if any of defined properties are unequal
             * @param {Array} keys like ['width', 'height', 'id']
             * @param {Object|Array} [etalon] values
             * @returns {Function}
             */
            equalValuesForKeys: function (keys, etalon) {
                if (arguments.length === 1) {
                    etalon = keys;
                    keys = Object.keys(keys);
                }

                if (Array.isArray(etalon)) {
                    return function (testObj) {
                        return !keys.some(function (key, ind) {
                            return etalon[ind] !== testObj[key];
                        })
                    }
                }

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
    global['sapit'] = sapit;
}(this));
