import Vue from 'vue'

const requireComponent = require.context('./components', false, /[\w]+\.vue$/);
requireComponent.keys().forEach(filename=>{
  const componentConfig = requireComponent(filename);
  Vue.component(componentConfig.default.name, componentConfig.default);
});
