    mongo = require 'mongodb'

#Database

    class Database
     constructor: (@dbName, @models, @host = 'localhost', @port = 27017) ->
      @collection = {}
      @collectionList = (c for c of models)
      @collection[c] = null for c in @collectionList
      @_error.bind this

     _error: (err) ->
      throw new Error err

     _createCollections: (callback) ->
      n = 0
      self = this

      create = ->
       if n >= self.collectionList.length
        callback()
        return

       name = self.collectionList[n]
       n++

       self.database.collection name, (err, collection) ->
        if err?
         throw new Error err

        self.collection[name] = collection
        create()

      create()

###Setup database

     setup: (callback) ->
      @server = new mongo.Server @host, @port, {}
      @database = new mongo.Db @dbName, @server, safe: true
      @database.addListener 'error', @_error

      self = this
      @database.open ->
       self._createCollections ->
        self.ready = true
        callback()

     load: (type, params, callback) ->
      if not @ready
       throw new Error 'Database not ready'

      self = this
      @collection[type].find params, (e1, cursor) ->
       if e1?
        return callback e1, null

       cursor.toArray (e2, dbObjs) ->
        if e2?
         return callback e2, null

        objs = []
        for dbObj in dbObjs
         if self.models[dbObj.model]?
          o = new self.models[dbObj.model] dbObj, db: self
          objs.push o
         else
          return callback "Unidentified model: #{JSON.stringify dbObj}", null

        callback null, objs

     save: (model, callback) ->
      @collection[model.model].save model.toJSON(), callback



##Model class

    class Model
     constructor: ->
      @_init.apply @, arguments

     _initFuncs: []

####Register initialize functions.
All initializer funcitons in subclasses will be called with the constructor
arguments.

     @initialize: (func) ->
      old = @::_initFuncs
      @::_initFuncs = []
      for func of old
       @::_initFuncs.push func
      @::_initFuncs.push func

     _init: ->
      for init in @_initFuncs
       init.apply @, arguments

####Include objects.
You can include objects by registering them with @include. This solves
the problem of single inheritence.

     @include: (obj) ->
      for k, v of obj when not @::[k]?
       @::[k] = v


     model: 'Model'

     _defaults: {}

####Register default key value set.
Subclasses can add to default key-values of parent classes

     @defaults: (defaults) ->
      old = @::_defaults
      @::_defaults = {}
      for k, v of old
       @::_defaults[k] = v
      for k, v of defaults
       @::_defaults[k] = v
      @::_defaults.id = null
      @::_defaults._id = null
      @::_defaults.model = @::model

Build a model with the structure of defaults. `options.db` is a reference
to the `Database` object, which will be used when updating the object.
`options.file` is the path of the file, which will be null if this is a
new object.

     @initialize (values, options) ->
      @db = options.db
      if not @db?
       throw new Error "No database for model"

      @values = {}
      values ?= {}
      for k, v of @_defaults
       if values[k]?
        @values[k] = values[k]
       else
        @values[k] = v

      if values._id?
       @isNew = false
      else
       @isNew = true

      if @isNew
       @values._id = new mongo.ObjectID()
       @values.id = @values._id.toHexString()

####Returns key value set

     toJSON: ->
      values = {}
      for k, v of @values
       values[k] = v

      return values

####Get value of a given key

     get: (key) -> @values[key]

####Set key value combination

     set: (obj) ->
      for k, v of obj
       @values[k] = v if k of @_defaults

###Save the object

     save: (callback) ->
      @db.save this, callback


#Exports

    exports.Database = Database
    exports.Model = Model
