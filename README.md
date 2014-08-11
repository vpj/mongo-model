#Mongodb wrapper

##Installation

    npm install mongo-model

##[Documentation](http://vpj.github.io/mongo-model/)

##[Example.coffee](http://vpj.github.io/mongo-model/example.html)

A basic database model

```coffee
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
```

Initialize database

```coffee
db = new mongodb.Database 'testdata', models
```

Load all objects of model *Fruit*

```coffee
load = ->
 db.load 'Fruit', {}, (err, objs) ->
  obj = objs[0]
  console.log obj.handle
  obj.handle = 'test'
  console.log obj.handle
  console.log err, obj
```

Save an object

```coffee
save = (callback) ->
 f = new Fruit {name: 'Apple', handle: 'apple'}, db: db
 f.save callback
```

```coffee
db.setup ->
 save ->
  console.log "saved"
  load()
```
