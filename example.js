// Generated by CoffeeScript 1.7.1
(function() {
  var Fruit, db, load, models, mongodb, save,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  mongodb = require('./index');

  Fruit = (function(_super) {
    __extends(Fruit, _super);

    function Fruit() {
      return Fruit.__super__.constructor.apply(this, arguments);
    }

    Fruit.prototype.model = 'Fruit';

    Fruit.defaults({
      handle: '',
      name: '',
      price: 0.00,
      description: '',
      images: []
    });

    return Fruit;

  })(mongodb.Model);

  models = {
    Fruit: Fruit
  };

  db = new mongodb.Database('testdata', models);

  load = function() {
    return db.load('Fruit', {}, function(err, objs) {
      var obj;
      obj = objs[0];
      console.log(obj.handle);
      obj.handle = 'test';
      console.log(obj.handle);
      return console.log(err, obj);
    });
  };

  save = function(callback) {
    var f;
    f = new Fruit({
      name: 'Apple',
      handle: 'apple'
    }, {
      db: db
    });
    return f.save(callback);
  };

  db.setup(function() {
    return save(function() {
      console.log("saved");
      return load();
    });
  });

}).call(this);
