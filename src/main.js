import Vue from 'vue'
import App from './App.vue'
// import router from './router'
import VueRouter from 'vue-router'
import store from './store'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
// import 'font-awesome/css/font-awesome.min.css'

Vue.config.productionTip = false

//import common components and register with Vue
require('@/common/_components.js')

// if you want to add a new route just add it in a 'Routes' folder somewhere in the tree
import routes from './_routes.js';

Vue.use(VueRouter);
Vue.use(Vuetify)

var router = new VueRouter({
	mode: 'history',
	base: '/components/'
});
router.addRoutes(routes);

new Vue({
	router: router,
	store,
	render: h => h(App)
}).$mount('#app')
