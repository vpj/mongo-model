// Generated by CoffeeScript 1.7.1
(function() {
  var Database, Model, mongo;

  mongo = require('mongodb');

  Database = (function() {
    function Database(dbName, models, host, port) {
      var c, _i, _len, _ref;
      this.dbName = dbName;
      this.models = models;
      this.host = host != null ? host : 'localhost';
      this.port = port != null ? port : 27017;
      this.collection = {};
      this.collectionList = (function() {
        var _results;
        _results = [];
        for (c in models) {
          _results.push(c);
        }
        return _results;
      })();
      _ref = this.collectionList;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        this.collection[c] = null;
      }
      this._error.bind(this);
    }

    Database.prototype._error = function(err) {
      throw new Error(err);
    };

    Database.prototype._createCollections = function(callback) {
      var create, n, self;
      n = 0;
      self = this;
      create = function() {
        var name;
        if (n >= self.collectionList.length) {
          callback();
          return;
        }
        name = self.collectionList[n];
        n++;
        return self.database.collection(name, function(err, collection) {
          if (err != null) {
            throw new Error(err);
          }
          self.collection[name] = collection;
          return create();
        });
      };
      return create();
    };

    Database.prototype.setup = function(callback) {
      var self;
      this.server = new mongo.Server(this.host, this.port, {});
      this.database = new mongo.Db(this.dbName, this.server, {
        safe: true
      });
      this.database.addListener('error', this._error);
      self = this;
      return this.database.open(function() {
        return self._createCollections(function() {
          self.ready = true;
          return callback();
        });
      });
    };

    Database.prototype.load = function(type, params, callback) {
      var self;
      if (!this.ready) {
        throw new Error('Database not ready');
      }
      self = this;
      return this.collection[type].find(params, function(e1, cursor) {
        if (e1 != null) {
          return callback(e1, null);
        }
        return cursor.toArray(function(e2, dbObjs) {
          var dbObj, o, objs, _i, _len;
          if (e2 != null) {
            return callback(e2, null);
          }
          objs = [];
          for (_i = 0, _len = dbObjs.length; _i < _len; _i++) {
            dbObj = dbObjs[_i];
            if (self.models[dbObj.model] != null) {
              o = new self.models[dbObj.model](dbObj, {
                db: self
              });
              objs.push(o);
            } else {
              return callback("Unidentified model: " + (JSON.stringify(dbObj)), null);
            }
          }
          return callback(null, objs);
        });
      });
    };

    Database.prototype.save = function(model, callback) {
      return this.collection[model.model].save(model.toJSON(), callback);
    };

    return Database;

  })();

  Model = (function() {
    Model.prototype.model = 'Model';

    Model.prototype._reserved = ['model', 'id', 'get', 'set', 'save', 'toJSON'];

    function Model() {
      this._init.apply(this, arguments);
    }

    Model.prototype._initFuncs = [];

    Model.initialize = function(func) {
      var old;
      old = this.prototype._initFuncs;
      this.prototype._initFuncs = [];
      for (func in old) {
        this.prototype._initFuncs.push(func);
      }
      return this.prototype._initFuncs.push(func);
    };

    Model.prototype._init = function() {
      var init, _i, _len, _ref, _results;
      _ref = this._initFuncs;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        init = _ref[_i];
        _results.push(init.apply(this, arguments));
      }
      return _results;
    };

    Model.include = function(obj) {
      var k, v, _results;
      _results = [];
      for (k in obj) {
        v = obj[k];
        if (this.prototype[k] == null) {
          _results.push(this.prototype[k] = v);
        }
      }
      return _results;
    };

    Model.prototype._defaults = {};

    Model.defaults = function(defaults) {
      var k, old, v, _fn, _i, _len, _ref;
      for (k in defaults) {
        if (k.length === 0 || k[0] === '_') {
          throw new Error("Invalid data model key: " + k);
        }
      }
      _ref = this.prototype._reserved;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        k = _ref[_i];
        if (defaults[k] != null) {
          throw new Error("Reserved data model key: " + k);
        }
      }
      old = this.prototype._defaults;
      this.prototype._defaults = {};
      for (k in old) {
        v = old[k];
        this.prototype._defaults[k] = v;
      }
      _fn = (function(_this) {
        return function(k) {
          _this.prototype.__defineGetter__(k, function() {
            return this._values[k];
          });
          return _this.prototype.__defineSetter__(k, function(x) {
            return this._values[k] = x;
          });
        };
      })(this);
      for (k in defaults) {
        v = defaults[k];
        this.prototype._defaults[k] = v;
        _fn(k);
      }
      this.prototype._defaults.id = null;
      this.prototype._defaults._id = null;
      return this.prototype._defaults.model = this.prototype.model;
    };

    Model.prototype.__defineGetter__('id', function() {
      return this._values.id;
    });

    Model.initialize(function(values, options) {
      var k, v, _ref;
      this._db = options.db;
      if (this._db == null) {
        throw new Error("No database for model");
      }
      this._values = {};
      if (values == null) {
        values = {};
      }
      _ref = this._defaults;
      for (k in _ref) {
        v = _ref[k];
        if (values[k] != null) {
          this._values[k] = values[k];
        } else {
          this._values[k] = v;
        }
      }
      if (values._id != null) {
        this._isNew = false;
      } else {
        this._isNew = true;
      }
      if (this._isNew) {
        this._values._id = new mongo.ObjectID();
        return this._values.id = this._values._id.toHexString();
      }
    });

    Model.prototype.toJSON = function() {
      var k, v, values, _ref;
      values = {};
      _ref = this._values;
      for (k in _ref) {
        v = _ref[k];
        values[k] = v;
      }
      return values;
    };

    Model.prototype.get = function(key) {
      return this._values[key];
    };

    Model.prototype.set = function(obj) {
      var k, v, _results;
      _results = [];
      for (k in obj) {
        v = obj[k];
        if (k in this._defaults) {
          _results.push(this._values[k] = v);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Model.prototype.save = function(callback) {
      return this._db.save(this, callback);
    };

    return Model;

  })();

  exports.Database = Database;

  exports.Model = Model;

}).call(this);
