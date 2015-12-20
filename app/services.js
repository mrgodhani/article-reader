const DB = require('./db.js')
var db = new DB(window.env)
var connect = db.init()
var article = connect.article
var tag = connect.tag
import { Promise } from 'es6-promise'

export default {
  insertLink(data,callback){
    article.insert(data,function(err,docs){
      return callback(docs)
    })
  },
  fetchTags(){
    return new Promise((resolve,reject) => {
      tag.find({}).sort({id : 1}).exec(function(err,docs){
        resolve(docs)
      })
    });
  },
  addTag(value,callback){

    _.mixin({
      'findByValues': function(collection, property, values) {
        return _.filter(collection, function(item) {
          return _.contains(values, item[property]);
        });
      }
    });

    tag.find({},function(err,docs){

      // Tags already exists
      if(docs.length > 0){

        var current_text = _.pluck(docs,'text')
        var exists = _.findByValues(docs,"text",value)
        var result = _.remove(value, function(n) {
          return current_text.indexOf(n) < 0
        })

        //check rejected result
        if(result.length > 0){

          var tags = result.map(function(obj,index){
            var id = (_.last(_.sortBy(docs,'id')).id + index) + 1

            var newObj = {
              id : id,
              text : obj
            }
            return newObj
          })

          tag.insert(tags,function(err,newdocs){
            newdocs.forEach(function(item){
              exists.push(item)
            })
            return callback(exists)
          })

        } else {

          // Tag already exists

          tag.find({ text: { $in: value }}, function (err, docs) {
            return callback(docs)
          });

        }

      } else {

        //If there is no tags in database

        var value_tags = value.map(function(obj,index){
          var newObj = {
            id : index + 1,
            text : obj
          }
          return newObj
        })

        tag.insert(value_tags,function(err,docs){
          return callback(docs)
        })

      }

    })

  },
  fetchArticles(){
    return new Promise((resolve,reject) => {
      article.find({},function(err,docs){
        resolve(docs)
      })
    });
  },
  fetchOne(slug){
    return new Promise((resolve,reject) => {
      article.findOne({ _id: slug }, function (err, doc) {
        return resolve(doc)
      });
    })
  },
  updateTag(value,id){
    article.update({_id : id},{ $set: { tags : value} },function(err,num){

    })
  },
  delete(id,callback){
    article.remove({ _id: id }, {}, function (err, numRemoved) {
      return callback(numRemoved)
    });
  }
}
