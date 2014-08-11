    mongodb = require './index'

A basic database model

    class Fruit extends mongodb.Model
     model: 'Fruit'

     @defaults
      handle: ''
      name: ''
      price: 0.00
      description: ''
      images: []

    models =
     Fruit: Fruit

Initialize database

    db = new mongodb.Database 'testdata', models

Load all objects of model *Fruit*

    load = ->
     db.load 'Fruit', {}, (err, objs) ->
      obj = objs[0]
      console.log obj.handle
      obj.handle = 'test'
      console.log obj.handle
      console.log err, obj

Save an object

    save = (callback) ->
     f = new Fruit {name: 'Apple', handle: 'apple'}, db: db
     f.save callback

    db.setup ->
     save ->
      console.log "saved"
      load()
