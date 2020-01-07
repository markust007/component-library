<template>
  <ul class="container">
    <li class="unit" v-for="(item, index) in units">
      <div class="unit-holder">
        <span class="unit-info" @click="unitDetails(item)">
          <span>{{item.name}}</span>
          <!-- <span style="font-size: 12px;vertical-align: middle;">{{item.bedrooms}}<v-icon small style="margin-left:5px;">fas fa-bed</v-icon><v-icon size="17" color="grey" style="margin-left:10px;">search</v-icon></span> -->
        </span>
        <span class="housekeeping"><v-icon :color="roomStatusColor(item.status)" @click="openStatusDialog(item)">{{roomStatusIcon(item.status)}}</v-icon></span>
      </div>
    </li>

    <v-dialog
    v-model="change_status"
    max-width="300"
    persistent
    >
      <v-card class="pa-2">
        <v-list>
          <v-radio-group v-model="status_radios">
          <v-list-tile
            v-for="(stat, id) in status"
            :key="id"
          >
            <v-radio
              label=""
              @change="newStatus(stat)"
              :value="id"
            >
            <template slot="label">
              <v-list-tile-avatar>
                <v-icon :color="roomStatusColor(stat.name)">{{stat.icon}}</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title>{{ stat.name }}</v-list-tile-title>
              </v-list-tile-content>
            </template>
          </v-radio>
          </v-list-tile>
          </v-radio-group>
        </v-list>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            flat="flat"
            @click="cancelStatus()"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            flat="flat"
            @click="saveStatus()"
          >
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="showDetails"
      max-width="1200"
      persistent
    >
      <v-card>

        <v-layout row wrap class="pa-4">
          <v-flex xs11>
            <h2 class="body-2 grey--text">Complex Name</h2>
            <h2 class="">{{details.name}}</h2>
            <h2 class="body-2">2222 Some Street. Somewhere, ST 12345</h2>
          </v-flex>
          <v-flex xs1 class="text-xs-right">
            <v-icon @click="closeDetails()" color="error">close</v-icon>
          </v-flex>
            <v-flex xs12 md6>
                <v-carousel class="">
                    <v-carousel-item v-for="(photo,i) in photos" :src="photo" :key="i"></v-carousel-item>
                </v-carousel>
            </v-flex>
            <v-flex xs12 md6 class="pb-3 px-3">
              <h2 style="font-size: 16px;">Overview</h2>
              <span>Aliquam erat volutpat. Nam tristique, felis nec porttitor porttitor, ipsum ex interdum arcu, vel convallis quam libero non eros. Quisque eget odio tortor. Nullam quis vehicula mauris, non egestas nulla. Integer urna libero, mollis egestas laoreet in, viverra egestas nisi. Pellentesque ultrices elementum justo.</span>
              <v-data-table
                :items="details_unit"
                class="elevation-1 mt-2"
                hide-actions
                hide-headers
              >
                <template slot="items" slot-scope="props">
                  <td>Bedroom</td>
                  <td class="text-xs-left">{{ props.item.bed }}</td>
                  <td class="text-xs-left">{{ props.item.bath }}</td>
                  <td class="text-xs-left">{{ props.item.ammenities }}</td>
                </template>
              </v-data-table>
              <h2 style="font-size: 16px;margin-top: 13px;">Primary Features</h2>
              <v-layout row wrap>
                <v-flex xs12 sm6 v-for="feature in features" :key="feature">
                  <v-icon color="success">done</v-icon>
                  <span>{{feature}}</span>
                </v-flex>
              </v-layout>
              <h2 style="font-size: 16px;margin-top: 13px;">Booking Policy</h2>
              <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ornare dictum dui, commodo tristique arcu faucibus vel. Vestibulum in purus at mi facilisis tincidunt nec nec metus. Sed ac facilisis nibh. Donec lacus eros, sagittis nec congue nec, eleifend sit amet arcu. Nam quis tellus hendrerit, consequat mauris eu, fringilla arcu. Sed luctus orci enim, at vestibulum diam blandit aliquam. Integer viverra dictum mauris, ac dignissim ex mattis ac.</span>
              <h2 style="font-size: 16px;margin-top: 13px;">House Rules</h2>
              <span>Vivamus ac lorem odio. Duis id porttitor risus, non semper mauris. Etiam efficitur nec augue at malesuada. Morbi in ante ac orci dictum auctor. Vestibulum vel justo facilisis, eleifend lacus ornare, ultricies metus.</span>
              <h2 style="font-size: 16px;margin-top: 13px;">Cancellation Policy</h2>
              <span>In hac habitasse platea dictumst. Vivamus tortor sem, luctus eget neque quis, elementum tempor ipsum. Donec nec condimentum quam. Morbi consectetur tellus et pharetra sollicitudin. Donec risus odio, sodales et consectetur et, viverra et orci.</span>
            </v-flex>
        </v-layout>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            flat="flat"
            @click="closeDetails()"
          >
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </ul>
</template>

<script>
export default {
  name: 'Units',
  data () {
    return {
      status: [
        {name: 'OCCUPIED DIRTY', icon: 'close'},
        {name: 'OCCUPIED CLEAN', icon: 'check_circle'},
        {name: 'READY', icon: 'done'},
        {name: 'DIRTY', icon: 'close'},
        {name: 'CLEAN', icon: 'error'},
        {name: 'OOO/OOS', icon: 'build'},
        {name: 'PICK-UP', icon: 'report'},
      ],
      status_radios: null,
      change_status: false,
      showDetails: false,
      details: {},
      unit: null,
      new_status: null,
      photos: [
          'https://picsum.photos/480/640?image=41',
          'https://picsum.photos/480/640?image=42',
          'https://picsum.photos/480/640?image=43',
          'https://picsum.photos/480/640?image=44'
      ],
      details_unit: [
        {bed: 'Master', bath: 'En-suite', ammenities: 'Air conditioning, Flat screen TV'},
        {bed: '2 Fulls', bath: 'Full Bath', ammenities: 'Air conditioning, Flat screen TV'},
        {bed: '1 Queen Sleeper', bath: 'Full Bath', ammenities: 'Air conditioning, Flat screen TV'}
      ],
      features: ['2 Washer / Dryers', 'Access to unit - with stairs', 'Billiards table', 'Deep Soakng Tub', 'Heated Driveway', 'Home Theatre', 'Mud Room', 'Multiple Private Decks', 'Open Floor Plan'],
    }
  },
  methods: {
    openStatusDialog(unit) {
      this.unit = unit
      this.change_status = true
    },
    cancelStatus() {
      this.unit = null
      this.new_status = null
      this.change_status = false
      this.status_radios = null
    },
    saveStatus() {
      const index = this.units.indexOf(this.unit)
      this.units[index].status = this.new_status.name
      this.unit = null
      this.new_status = null
      this.change_status = false
      this.status_radios = null
    },
    newStatus(stat) {
      this.new_status = stat
    },
    changeStatus(item, stat) {
      item.status = stat.name
    },
    unitDetails(unit) {
      this.details = unit
      this.showDetails = true
    },
    closeDetails() {
      this.details = {}
      this.showDetails = false
    },
    roomStatusIcon(status) {
      switch (status) {
        case 'OCCUPIED DIRTY':
          return 'close'
        case 'OCCUPIED CLEAN':
          return 'check_circle'
        case 'READY':
          return 'done'
        case 'CLEAN':
          return 'error'
        case 'DIRTY':
          return 'close'
        case 'OOO/OOS':
          return 'build'
        case 'PICK-UP':
          return 'report'
        default:
          return
      }
    },
    roomStatusColor(status){
        switch (status)
        {
            case 'READY':
                return '#4CAF50';
            case 'CLEAN':
                return '#FF9800';
            case 'DIRTY':
                return '#F44336';
            case 'OCCUPIED CLEAN':
                return '#4CAF50';
            case 'OCCUPIED DIRTY':
                return '#F44336';
            case 'OOO/OOS':
                return '#F44336';
            case 'PICK-UP':
                return '#FF9800';
            default:
                return 'grey'
        };
    },
  },
  props: ['units']
}
</script>

<style scoped>
ul {
  flex: 1;
  list-style: none;
  padding: 0;
  margin: 0;
  border-right: 1px solid #e1e1e1;
  background: white;
  height: 100%;
}
li {
  display: grid;
  grid-auto-rows: 50px;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.unit-holder {
  border-top: 1px solid #e1e1e1;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 10px;
}
.unit-info {
  flex: 4;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 5px;
  cursor: pointer;
}
.housekeeping {
  flex: 1;
  text-align: right;
}
li:first-child .unit-holder {
  border-top: 0px solid #e1e1e1;
}
</style>
