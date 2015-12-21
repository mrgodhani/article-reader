<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h3>{{ title }}</h3>
      <div class="col-md-8 url-input">
        <div class="input-group">
          <input type="text" class="form-control" v-model="link" placeholder="Paste article link">
          <span class="input-group-btn">
            <button class="btn btn-primary" v-on:click="addLink(link)" type="button">Add Article</button>
          </span>
        </div><!-- /input-group -->
      </div><!-- /.col-lg-6 -->
    </div>
    <div class="dashboard-sidebar">
      <div class="sidebar-header">
        <h3 class="sidebar-header-text">Search</h3>
      </div>
      <ul class="dashboard-list">
        <li class="dashboard-list-item search-item">
          <div class="input-group">
            <input type="text" class="form-control input-sm" placeholder="Search for..." v-model="searchQuery">
            <span class="input-group-btn">
              <button class="btn btn-primary btn-sm" type="button"><span class="glyphicon glyphicon-search"></span></button>
            </span>
          </div>
        </li>
      </ul>
      <div class="sidebar-header">
        <h3 class="sidebar-header-text">Articles</h3>
      </div>
      <ul class="dashboard-list">
        <li v-on:click="setAllArticles()" class="dashboard-list-item">
          <span class="glyphicon glyphicon-book"></span>
          All Articles
        </li>
        <li v-on:click="setUntagged()" class="dashboard-list-item">
          <span class="glyphicon glyphicon-tags"></span>
          Untagged Articles
        </li>
      </ul>
      <div class="sidebar-header">
        <h3 class="sidebar-header-text">Tags</h3>
      </div>
      <ul class="dashboard-list">
        <li v-on:click="setTag(tag)" class="dashboard-list-item tag" v-for="tag in tags">
          <span class="glyphicon glyphicon-tag"></span>
          {{ tag.text }}
          <span class="tagged-count">{{ tag.count }}</span>
        </li>
      </ul>
    </div>
    <div class="dashboard-articles">
      <ul class="articles">
        <li v-on:click="redirectTo(article._id)" class="article" v-for="article in articles | filterBy searchQuery in 'title' 'description'">
          <h3 class="article-name">{{ article.title }}</h3>
          <p class="article-description">{{ article.description }}</p>
          <ul class="article-tags">
            <li v-for="tag in article.tags" v-on:click="setTag(tag)">{{ tag.text }}</li>
          </ul>
        </li>
      </ul>
    </div>
    <div class="article-detail">
      <router-view></router-view>
    </div>
  </div>
</template>
<script>
import got from 'got'
import store from '../store'
import jetpack from 'fs-jetpack'
import s from 'underscore.string'
import striptags from 'striptags'
import read from 'node-read'
const app = require('remote').require('app')
const useDataDir = jetpack.cwd(app.getPath("userData") + '/streams/')
const randomstring = require("randomstring")
import he from 'he'
var service = require('../services.js')

const {
  addArticle,
  removeArticle
} = store.actions

export default {
  data(){
    return {
      link: '',
      searchQuery: '',
      state: 'all',
      title: 'All Articles'
    }
  },
  computed: {
    articles() {
      if(this.state !== 'all'){
        var obj = {
          id : this.state.id,
          text : this.state.text,
          _id : this.state._id
        }
        var data = _.where(store.state.articles, { 'tags' : this.state !== 'untagged' ? [obj] : null })
        return data
      }
      return store.state.articles
    },
    tags(){
      var result = store.state.tags.map(function(item){
        var data = _.where(store.state.articles, { 'tags': [item] })
        var obj = {
          id : item.id,
          text : item.text,
          count : data.length,
          _id : item._id
        }
        return obj
      })
      return result
    }
  },
  methods:{
    setUntagged(){
      this.title = "Untagged articles"
      this.state = "untagged"
    },
    setTag(item){
      this.title = item.text
      this.state = item
    },
    setAllArticles(){
      this.title = "All Articles"
      this.state = "all"
    },
    redirectTo(id){
      return this.$route.router.go({path:'/article/' + id ,replace: true})
    },
    addLink(link){
      var self = this;
      read(link,function(err,article,res){
        var fileName = randomstring.generate() + '.html'
        if(article.content){
          var text = striptags(article.content)
          var doc = {
            title: s.prune(he.decode(article.title),70),
            slug: s.slugify(article.title),
            description : s.prune(text,120),
            tags: null,
            file: fileName
          }
          got.stream(link).pipe(useDataDir.createWriteStream(fileName))
          addArticle(doc)
          self.link = ''
        }
      })
    }
  }
}
</script>
