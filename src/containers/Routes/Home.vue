<template>
  <div class="home">
    <div id="nav">
      <router-link to="/tape-chart">Tape Chart</router-link>
    </div>
  </div>
</template>

<script>
  export default {
    routes: [
        { path: '/', name:'home'}
    ],
    methods: {
      save() {
        alert('save')
      }
    }
  }
</script>
