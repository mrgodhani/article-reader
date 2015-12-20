import Vue from 'vue'
import Vuex from 'vuex'
import _ from 'lodash'
var app = require('remote').require('app')
var jetpack = require('fs-jetpack')
var useDataDir = jetpack.cwd(app.getPath("userData") + '/streams/')


var service = require('./services.js')

Vue.use(Vuex)

const ADD_ARTICLE = 'ADD_ARTICLE'
const SET_ARTICLE = 'SET_ARTICLE'
const REMOVE_ARTICLE = 'REMOVE_ARTICLE'
const UPDATE_TAG = 'UPDATE_TAG'
const SET_TAG = 'SET_TAG'

const state = {
  articles : [],
  tags: []
}

const actions = {
  addArticle: ADD_ARTICLE,
  getArticles: SET_ARTICLE,
  getTags: SET_TAG,
  updateTag: UPDATE_TAG,
  removeArticle: REMOVE_ARTICLE
}

const mutations = {
  [ADD_ARTICLE] (state,text){
    service.insertLink(text,function(item){
      state.articles.unshift(item)
    })
  },
  [SET_ARTICLE] (state){
    service.fetchArticles().then(function(item){
      state.articles = item
    })
  },
  [SET_TAG] (state){
    service.fetchTags().then(function(tag){
      state.tags = tag
    })
  },
  [UPDATE_TAG] (state,id,value){
    var current_text = _.pluck(state.tags,"text")
    service.addTag(value,function(item){
      service.updateTag(item,id)
      var index = _.findIndex(state.articles, '_id', id)
      state.articles[index].tags = item
      item.forEach(function(item){
        if(current_text.indexOf(item.text) < 0){
          state.tags.push(item)
        }
      })
    })
  },
  [REMOVE_ARTICLE] (state,id){
    var index = _.findIndex(state.articles, '_id', id);
    service.delete(id,function(item){
      jetpack.remove(useDataDir.path(state.articles[index].file))
      state.articles.splice(index,1)
    })
  }
}

export default new Vuex.Store({
  state,
  actions,
  mutations
})
