const app = require('remote').require('app')
const jetpack = require('fs-jetpack').cwd(app.getAppPath())
const Vue = require('vue')
const Router = require('vue-router')
const App = require('./components/App.vue')
const Article = require('./components/Article.vue')
const Default = require('./components/Default.vue')
const useDataDir = jetpack.cwd(app.getPath("userData"))
const fs = require('fs')
const store = require('./store')
const $ = require('jquery')
const select2 = require('select2')

var dirYes = jetpack.exists(useDataDir.path('streams'))
if(!dirYes){
    fs.mkdir(useDataDir.path('streams'))
}

Vue.use(Router);

Vue.directive('select', {
  twoWay: true,
  priority: 1000,

  params: ['options'],

  bind: function () {

    var self = this
    $(this.el)
      .select2({
      	multiple:true,
        tags: true,
        data: this.params.options
      })
      .on('change', function () {
        self.set(_.pluck($(this).select2('data'),'text'))
      })
  },
  update: function (value) {
    $(this.el).val(value).trigger('change')
  },
  unbind: function () {
    $(this.el).off().select2('destroy')
  }
})

var router = new Router({
    hashbang:false,
    abstract:true
})

router.map({
  '/':{
    component: Default
   },
   '/article/:slug':{
    component: Article
   }
})

store.actions.getArticles()
store.actions.getTags()

router.start(App,'#app')
