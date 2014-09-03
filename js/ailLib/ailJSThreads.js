/*
* *** JS thread library uses web workers.
* Usage example
*
* var p = new Thread('Hello');

 // Spawn a remote job (we'll see more on how to use then later)
 p.spawn(function (data) {
     return data;
 }).then(function (data) {
 console.log(data) // logs Hello
 });
* */

(function () {
    var setImmediate = setImmediate || function (cb) {
        setTimeout(cb, 0);
    };
    var Worker = self.Worker;
    var URL = typeof self !== 'undefined' ? (self.URL ? self.URL : self.webkitURL) : null;
    var _supports = (self.Worker) ? true : false; // node always supports parallel

    function extend(from, to) {
        if (!to) to = {};
        for (var i in from) {
            if (to[i] === undefined) to[i] = from[i];
        }
        return to;
    }

    function Operation() {
        this._callbacks = [];
        this._errCallbacks = [];

        this._resolved = 0;
        this._result = null;
    }

    Operation.prototype.resolve = function (err, res) {
        if (!err) {
            this._resolved = 1;
            this._result = res;

            for (var i = 0; i < this._callbacks.length; ++i) {
                this._callbacks[i](res);
            }
        } else {
            this._resolved = 2;
            this._result = err;

            for (var iE = 0; iE < this._errCallbacks.length; ++iE) {
                this._errCallbacks[iE](res);
            }
        }

        this._callbacks = [];
        this._errCallbacks = [];
    };

    Operation.prototype.then = function (cb, errCb) {
        if (this._resolved === 1) { // result
            if (cb) {
                cb(this._result);
            }

            return;
        } else if (this._resolved === 2) { // error
            if (errCb) {
                errCb(this._result);
            }
            return;
        }

        if (cb) {
            this._callbacks[this._callbacks.length] = cb;
        }

        if (errCb) {
            this._errCallbacks[this._errCallbacks.length] = errCb;
        }
        return this;
    };

    var defaults = {
        evalPath: null,
        maxWorkers: 4,
        synchronous: true,
        env: {},
        envNamespace: 'env'
    };

    function Thread(data, options) {
        this.data = data;
        this.options = extend(defaults, options);
        this.operation = new Operation();
        this.operation.resolve(null, this.data);
        this.requiredScripts = [];
        this.requiredFunctions = [];
    }

    // static method
    Thread.isSupported=function(){ return _supports; }

    Thread.prototype.getWorkerSource = function (cb, env) {
        var that = this;
        var preStr = '';
        var i = 0;
        if (this.requiredScripts.length !== 0) {
            preStr += 'importScripts("' + this.requiredScripts.join('","') + '");\r\n';
        }

        for (i = 0; i < this.requiredFunctions.length; ++i) {
            if (this.requiredFunctions[i].name) {
                preStr += 'var ' + this.requiredFunctions[i].name + ' = ' + this.requiredFunctions[i].fn.toString() + ';';
            } else {
                preStr += this.requiredFunctions[i].fn.toString();
            }
        }

        env = JSON.stringify(env || {});

        var ns = this.options.envNamespace;

            return preStr + 'self.onmessage = function(e) {var global = {}; global.' + ns + ' = ' + env + ';self.postMessage((' + cb.toString() + ')(e.data))}';
    };

    Thread.prototype.require = function () {
        var args = Array.prototype.slice.call(arguments, 0),
            func;

        for (var i = 0; i < args.length; i++) {
            func = args[i];

            if (typeof func === 'string') {
                this.requiredScripts.push(func);
            } else if (typeof func === 'function') {
                this.requiredFunctions.push({ fn: func });
            } else if (typeof func === 'object') {
                this.requiredFunctions.push(func);
            }
        }

        return this;
    };

    Thread.prototype._spawnWorker = function (cb, env) {
        var wrk;
        var src = this.getWorkerSource(cb, env);
            if (Worker === undefined) {
                return undefined;
            }

            try {
                if (this.requiredScripts.length !== 0) {
                    if (this.options.evalPath !== null) {
                        wrk = new Worker(this.options.evalPath);
                        wrk.postMessage(src);
                    } else {
                        throw new Error('Can\'t use required scripts without eval.js!');
                    }
                } else if (!URL) {
                    throw new Error('Can\'t create a blob URL in this browser!');
                } else {
                    var blob = new Blob([src], { type: 'text/javascript' });
                    var url = URL.createObjectURL(blob);

                    wrk = new Worker(url);
                }
            } catch (e) {
                if (this.options.evalPath !== null) { // blob/url unsupported, cross-origin error
                    wrk = new Worker(this.options.evalPath);
                    wrk.postMessage(src);
                } else {
                    throw e;
                }
            }


        return wrk;
    };

    Thread.prototype.spawn = function (cb, env) {
        var that = this;
        var newOp = new Operation();

        env = extend(this.options.env, env || {});

        this.operation.then(function () {
            var wrk = that._spawnWorker(cb, env);
            if (wrk !== undefined) {
                wrk.onmessage = function (msg) {
                    wrk.terminate();
                    that.data = msg.data;
                    newOp.resolve(null, that.data);
                };
                wrk.postMessage(that.data);
            } else if (that.options.synchronous) {
                setImmediate(function () {
                    that.data = cb(that.data);
                    newOp.resolve(null, that.data);
                });
            } else {
                throw new Error('Workers do not exist and synchronous operation not allowed!');
            }
        });
        this.operation = newOp;
        return this;
    };

    Thread.prototype._spawnMapWorker = function (i, cb, done, env) {
        var that = this;
        var wrk = that._spawnWorker(cb, env);
        if (wrk !== undefined) {
            wrk.onmessage = function (msg) {
                wrk.terminate();
                that.data[i] = msg.data;
                done();
            };
            wrk.postMessage(that.data[i]);
        } else if (that.options.synchronous) {
            setImmediate(function () {
                that.data[i] = cb(that.data[i]);
                done();
            });
        } else {
            throw new Error('Workers do not exist and synchronous operation not allowed!');
        }
    };

    Thread.prototype.map = function (cb, env) {
        env = extend(this.options.env, env || {});

        if (!this.data.length) {
            return this.spawn(cb, env);
        }

        var that = this;
        var startedOps = 0;
        var doneOps = 0;
        function done() {
            if (++doneOps === that.data.length) {
                newOp.resolve(null, that.data);
            } else if (startedOps < that.data.length) {
                that._spawnMapWorker(startedOps++, cb, done, env);
            }
        }

        var newOp = new Operation();
        this.operation.then(function () {
            for (; startedOps - doneOps < that.options.maxWorkers && startedOps < that.data.length; ++startedOps) {
                that._spawnMapWorker(startedOps, cb, done, env);
            }
        });
        this.operation = newOp;
        return this;
    };

    Thread.prototype._spawnReduceWorker = function (data, cb, done, env) {
        var that = this;
        var wrk = that._spawnWorker(cb, env);
        if (wrk !== undefined) {
            wrk.onmessage = function (msg) {
                wrk.terminate();
                that.data[that.data.length] = msg.data;
                done();
            };
            wrk.postMessage(data);
        } else if (that.options.synchronous) {
            setImmediate(function () {
                that.data[that.data.length] = cb(data);
                done();
            });
        } else {
            throw new Error('Workers do not exist and synchronous operation not allowed!');
        }
    };

    Thread.prototype.reduce = function (cb, env) {
        env = extend(this.options.env, env || {});

        if (!this.data.length) {
            throw new Error('Can\'t reduce non-array data');
        }

        var runningWorkers = 0;
        var that = this;
        function done(data) {
            --runningWorkers;
            if (that.data.length === 1 && runningWorkers === 0) {
                that.data = that.data[0];
                newOp.resolve(null, that.data);
            } else if (that.data.length > 1) {
                ++runningWorkers;
                that._spawnReduceWorker([that.data[0], that.data[1]], cb, done, env);
                that.data.splice(0, 2);
            }
        }

        var newOp = new Operation();
        this.operation.then(function () {
            if (that.data.length === 1) {
                newOp.resolve(null, that.data[0]);
            } else {
                for (var i = 0; i < that.options.maxWorkers && i < Math.floor(that.data.length / 2); ++i) {
                    ++runningWorkers;
                    that._spawnReduceWorker([that.data[i * 2], that.data[i * 2 + 1]], cb, done, env);
                }

                that.data.splice(0, i * 2);
            }
        });
        this.operation = newOp;
        return this;
    };

    Thread.prototype.then = function (cb, errCb) {
        var that = this;
        var newOp = new Operation();
        this.operation.then(function () {
            var retData = cb(that.data);
            if (retData !== undefined) {
                that.data = retData;
            }
            newOp.resolve(null, that.data);
        }, errCb);
        this.operation = newOp;
        return this;
    };

        self.Thread = Thread;
})();