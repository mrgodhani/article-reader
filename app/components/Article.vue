<template>
  <div class="manage-article">
    <div class="edit-article-tags">
      <button class="toggle-tag-editor" v-on:click="showTag()">Edit Tags</button>
      <div v-if="showModal" class="tags-dropdown">
        <select v-select="selected" :options="options">
        </select>
        <button type="button" class="btn btn-block btn-success" v-on:click="saveTags(id,selected)">Save</button>
      </div>
    </div>
    <button class="toggle-tag-editor" v-on:click="deleteLink()">Delete</button>
  </div>
  <div class="article-read">
    <h3>{{ title }}</h3>
    <br/>
    {{{ content }}}
  </div>
</template>
<script>
var service = require('../services.js')
var read = require('node-read')
var app = require('remote').require('app')
var jetpack = require('fs-jetpack')
var useDataDir = jetpack.cwd(app.getPath("userData") + '/streams/')
import store from '../store'
import he from 'he'
import _ from 'lodash'

const {
  removeArticle,
  updateTag
} = store.actions


export default {

  route:{
    data({ to }){
      var self = this
      this.showModal = false
      self.id = to.params.slug
      return service.fetchOne(to.params.slug).then(function(item){
        var data = jetpack.read(useDataDir.path(item.file))
        read(data,function(err,article,res){
          self.title = he.decode(article.title)
          self.content = article.content
        })
      })
    }
  },

  data(){
    return {
      showModal: false,
      id: '',
      title: '',
      content: '',
      file: '',
      selected: []
    }
  },

  computed: {
    options(){
      return store.state.tags
    }
  },

  methods:{
    saveTags(id,selected){
      var self = this
      updateTag(this.id,this.selected)
      this.showModal = false
    },
    showTag(){
      if(this.showModal){
        this.showModal = false
      } else {
        var self = this
        service.fetchOne(this.id).then(function(item){
          self.selected = _.pluck(item.tags,'id')
        })
        this.showModal = true
      }
    },
    deleteLink(){
      removeArticle(this.id)
      this.$route.router.go('/')
    }
  }
}
</script>
