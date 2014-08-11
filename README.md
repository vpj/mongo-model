#Mongodb wrapper

##Installation

    npm install mongo-model

##[Documentation](http://vpj.github.io/mongo-model/)

##[Example.coffee](http://vpj.github.io/mongo-model/example.html)

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

    db.setup ->
     db.loadFiles 'Fruit', {}, (err, objs) ->
      console.log err, objs

