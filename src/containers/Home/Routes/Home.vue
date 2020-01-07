<template>
  <div class="home">
    <v-btn depressed outline @click="back"><v-icon left small>arrow_back</v-icon>Back to Website</v-btn>
    <div id="nav">
      <v-layout row wrap>
          <v-flex xs12 sm6 md3 v-for="(link, index) in links" :key="index">
            <v-card :to="link.path" class="ma-1">
              <v-card-title primary-title>
                <v-icon left>{{link.icon}}</v-icon>
                <h2 class="headline mb-0">{{link.name}}</h2>
                <v-icon right color="blue">arrow_forward</v-icon>
              </v-card-title>
            </v-card>
          </v-flex>
      </v-layout>
    </div>
  </div>
</template>

<script>
  export default {
    routes: [
        { path: '/', name:'home'}
    ],
    data() {
      return {
        links: [
          {
            name: "Tape Chart",
            path: "/tape-chart",
            icon: "view_week"
          },
          {
            name: "Unit Features",
            path: "/unit-features",
            icon: "star"
        },
        {
          name: "Occupancy Report",
          path: "/occupancy-report",
          icon: "supervisor_account"
        }
        ]
      }
    },
    methods: {
      save() {
        alert('save')
      },
      back() {
          window.location.href = "http://careyartistry.com"
      }
    }
  }
</script>
