<template>
    <div style="position: relative;">
        <v-expansion-panel expand class="mb-2" v-model="panel">
           <v-expansion-panel-content>
               <div slot="header"><v-icon>filter_list</v-icon> Filters</div>
               <v-card>
                   <v-card-text>
                       <v-container fill-height style="padding-left:0px !important;padding-right:0px !important; margin:0;max-width:100%;" class="component-parameters">
                         <v-layout row wrap>
                             <v-flex xs12>
                             <v-text-field
                               v-model="filters.filter_by_unit"
                               prepend-inner-icon="search"
                               placeholder="Filter By Unit"
                               style="marginTop:0;"
                             >
                             </v-text-field>
                             </v-flex>
                             <v-flex xs12>
                                <v-switch v-model="filters.sort_direction" :label="filters.sort_direction ? 'High to Low' : 'Low to High'"></v-switch>
                             </v-flex>
                         </v-layout>
                       </v-container>
                   </v-card-text>
               </v-card>
           </v-expansion-panel-content>
         </v-expansion-panel>
         <!-- <v-layout>
           <v-btn @click="showResults()" color="blue" style="color:white;">
               <v-icon left small>fas fa-search</v-icon>
               Search
           </v-btn>
         </v-layout> -->

        <v-layout row wrap>
            <v-flex xs12>
              <v-layout row wrap>
                <v-flex xs12 sm3>
                  <!-- <studeo-date-picker v-model="date" :dialog="date_dialog" label="" id="date" :format="true" /> -->
                  <v-menu
                    ref="menu"
                    :close-on-content-click="false"
                    v-model="date_dialog"
                    :nudge-right="40"
                    :return-value.sync="date"
                    lazy
                    transition="scale-transition"
                    offset-y
                    full-width
                    min-width="290px"
                  >
                    <v-text-field
                      slot="activator"
                      v-model="date"
                      label="Date"
                      prepend-icon="event"
                      readonly
                    ></v-text-field>
                    <v-date-picker v-model="date" no-title>
                      <v-spacer></v-spacer>
                      <v-btn flat color="primary" @click="date_dialog = false">Cancel</v-btn>
                      <v-btn flat color="primary" @click="$refs.menu.save(date)">OK</v-btn>
                    </v-date-picker>
                  </v-menu>
                </v-flex>
                <v-flex xs12 sm9 class="text-xs-right pt-3">
                  <v-btn small outline color="primary" @click="size = 7">7 day</v-btn>
                  <v-btn small outline color="primary" @click="size = 14">14 day</v-btn>
                  <v-btn small outline color="primary" @click="size = 31" v-if="$vuetify.breakpoint.smAndUp">31 day</v-btn>
                  <v-btn small outline color="primary" style="padding:0 2px;min-width:auto;margin-right:2px;" @click="left"><v-icon>keyboard_arrow_left</v-icon></v-btn>
                  <v-btn small outline color="primary" style="padding:0 2px;min-width:auto;margin-left:2px;" @click="right"><v-icon>keyboard_arrow_right</v-icon></v-btn>
                </v-flex>
              </v-layout>
              <div class="chart-head">
                <div class="chart-unit"><span>Units/Status</span></div>
                <div class="chart-days-holder" ref="header">
                  <div class="chart-days" :class="style">
                    <div v-for="day in days" style="padding:3px;" :style="{fontSize: size == 31 ? '0.7rem' : '0.8rem'}">{{headerFormat(day)}}</div>
                  </div>
                </div>
              </div>
              <div class="chart">
                <Units :units="filterUnits"></Units>
                <Chart :date="date" :units="filterUnits" :res="reservations" :size="size" @scrolling="onScroll"></Chart>
              </div>
              <v-progress-linear :indeterminate="true" height="2" class="ma-0" :active="loading"></v-progress-linear>
            </v-flex>
        </v-layout>
    </div>
</template>

<script>
    import moment from 'moment'
    import Units from '@/containers/Routes/Components/Units'
    import Chart from '@/containers/Routes/Components/Chart'

    export default {
        routes: [
            { path: '/tape-chart', name: 'tape-chart'},
        ],
        components: {
          Units, Chart
        },
        data: () => ({
          date: null,
          date_dialog: false,
          size: 7,
          panel: [true],
          showAudit: false,
          loading: false,
          channels: null,
          folio_status: [
              {status: 0, text: 'Due In', icon: 'mdi-check'},
              {status: 1, text: 'Queued', icon: 'mdi-close'},
              {status: 3, text: 'Stayovers', icon: 'mdi-close-circle-outline'},
              {status: 4, text: 'Arrived', icon: 'mdi-wrench'},
              {status: 5, text: 'Due Out', icon: 'mdi-wrench'},
              {status: 6, text: 'Late Check-Out', icon: 'mdi-wrench'},
              {status: 7, text: 'Checked Out', icon: 'mdi-close'},
              {status: 8, text: 'Reserved', icon: 'mdi-close'},
              {status: 9, text: 'Cancelled', icon: 'mdi-close'},
              {status: 10, text: 'Mobile Check-In', icon: 'mdi-check'}
          ],
          sort_by: [
              'Name',
              'Bedrooms'
          ],
          sort_by_dir: [
              'High to Low',
              'Low to High'
          ],
          filters: {
            filter_by_unit: "",
            num_bedrooms: null,
            occupancy: null,
            amenities: [],
            connecting_rooms: false,
            folio_status: [],
            guest_types: [],
            sales_channels: [],
            sort_by: '',
            sort_direction: false
          },
          original_filters: {
            venue_id: null,
            area_id: null,
            complex_id: null,
            filter_by_unit: "",
            num_bedrooms: null,
            occupancy: null,
            amenities: [],
            connecting_rooms: false,
            folio_status: [],
            guest_types: [],
            sales_channels: [],
            sort_by: '',
            sort_direction: ''
          },
          units: [],
          reservations: [],
        }),
        created() {
          this.date = moment().format('YYYY-MM-DD')
          this.getData()
        },
        watch: {
          '$vuetify.breakpoint': {
              handler() {
                  if(this.$vuetify.breakpoint.xs) {
                    this.size = 7
                  }
              },
              deep: true,
              immediate: true
          },
        },
        computed: {
          days() {
            let array = Array(this.size).fill().map((_, i) => moment(this.date).clone().add(i, 'days').format('YYYY-MM-DD'))
            return array
          },
          style() {
            if(this.size == 31) {
              return 'large'
            } else if(this.size == 14) {
              return 'medium'
            } else {
              return 'small'
            }
          },
          filterUnits() {
            let list = this.units
            //By Unit
            if (this.filters.filter_by_unit) {
                  list = list.filter(item => {
                      let re = new RegExp(this.filters.filter_by_unit, 'gi');
                      return  (
                          item.name.search(re) >= 0
                      );
                  });
              }

            //Sort Direction
              let compare = ((a, b) => {
                let numA = a.name
                let numB = b.name
                let comparison = 0;

                if (numA > numB) {
                  if(this.filters.sort_direction) {
                    comparison = -1
                  } else {
                    comparison = 1;
                  }
                } else if (numB > numA) {
                  if(this.filters.sort_direction) {
                    comparison = 1
                  } else {
                    comparison = -1;
                  }
                }
                return comparison;
              })
              if(this.filters.sort_direction || !this.filters.sort_direction) {
                list = list.sort(compare)
              }
            return list
          }
        },
        methods: {
          showResults() {
            this.panel.splice(0, 1, false)
            this.original_filters = JSON.parse(JSON.stringify(this.filters));
            this.getData()
          },
          onScroll(e) {
            const header = this.$refs.header
            header.scrollLeft = e.target.scrollLeft;
          },
          headerFormat(day) {
            return moment(day).format('MMM D')
          },
          left() {
            if(!this.date) {
              this.date = moment().subtract(this.size, 'days').format('YYYY-MM-DD')
            } else {
              this.date = moment(this.date).subtract(this.size, 'days').format('YYYY-MM-DD')
            }
            // this.$refs.picker.left()
          },
          right() {
            if(!this.date) {
              this.date = moment().add(this.size, 'days').format('YYYY-MM-DD')
            } else {
              this.date = moment(this.date).add(this.size, 'days').format('YYYY-MM-DD')
            }
            // this.$refs.picker.right()
          },
          getData() {
            this.units = []
            this.reservations = []
            this.loading = true
            new Promise((resolve) => {
              resolve()
            })
            .then(() => {
              this.units = [
                {
                  name: 'Unit 1',
                  bedrooms: 1,
                  status: 'OCCUPIED DIRTY',
                  id: 205
                },
                {
                  name: 'Unit 2',
                  bedrooms: 1,
                  status: 'OCCUPIED DIRTY',
                  id: 82
                },
                {
                  name: 'Unit 3',
                  bedrooms: 1,
                  status: 'OCCUPIED CLEAN',
                  id: 4
                },
                {
                  name: 'Unit 4',
                  bedrooms: 1,
                  status: 'READY',
                  id: 201
                },
                {
                  name: 'Unit 5',
                  bedrooms: 2,
                  status: 'READY',
                  id: 38
                },
                {
                  name: 'Unit 6',
                  bedrooms: 2,
                  status: 'CLEAN',
                  id: 41
                },
                {
                  name: 'Unit 7',
                  bedrooms: 2,
                  status: 'CLEAN',
                  id: 42
                },
                {
                  name: 'Unit 8',
                  bedrooms: 2,
                  status: 'DIRTY',
                  id: 191
                },
                {
                  name: 'Unit 9',
                  bedrooms: 3,
                  status: 'OOO/OOS',
                  id: 28
                },
                {
                  name: 'Unit 10',
                  bedrooms: 3,
                  status: 'OOO/OOS',
                  id: 198
                },
                {
                  name: 'Unit 11',
                  bedrooms: 4,
                  status: 'PICK-UP',
                  id: 62
                },
                {
                  name: 'Unit 12',
                  bedrooms: 4,
                  status: 'OCCUPIED DIRTY',
                  id: 204
                }
              ]
              this.reservations = [
                {
                  id: 1,
                  arrival: moment().add(2, 'days').format('YYYY-MM-DD'),
                  depart: moment().add(4, 'days').format('YYYY-MM-DD'),
                  customer: 'Guest 1',
                  unit: 205,
                  checked_in: false,
                  checked_out: false,
                  mobile_check_in: false,
                  vip: true,
                  owner: false,
                  locked: true,
                  connected: false,
                  group: false
                },
                {
                  id: 2,
                  arrival: moment().format('YYYY-MM-DD'),
                  depart: moment().add(3, 'days').format('YYYY-MM-DD'),
                  customer: 'Guest 2',
                  unit: 82,
                  checked_in: true,
                  checked_out: false,
                  mobile_check_in: false,
                  vip: false,
                  owner: true,
                  locked: false,
                  connected: false,
                  group: false
                },
                {
                  id: 3,
                  arrival: moment().subtract(1, 'days').format('YYYY-MM-DD'),
                  depart: moment().format('YYYY-MM-DD'),
                  customer: 'Guest 3',
                  unit: 4,
                  checked_in: true,
                  checked_out: true,
                  mobile_check_in: false,
                  vip: false,
                  owner: false,
                  locked: false,
                  connected: false,
                  group: true
                },
                {
                  id: 4,
                  arrival: moment().format('YYYY-MM-DD'),
                  depart: moment().add(4, 'days').format('YYYY-MM-DD'),
                  customer: 'Guest 4',
                  unit: 38,
                  checked_in: true,
                  checked_out: false,
                  mobile_check_in: true,
                  vip: false,
                  owner: false,
                  locked: false,
                  connected: false,
                  group: false
                },
                {
                  id: 5,
                  arrival: moment().add(2, 'days').format('YYYY-MM-DD'),
                  depart: moment().add(3, 'days').format('YYYY-MM-DD'),
                  customer: 'Guest 5',
                  unit: 41,
                  checked_in: false,
                  checked_out: false,
                  mobile_check_in: false,
                  vip: true,
                  owner: false,
                  locked: false,
                  connected: false,
                  group: false
                },
                {
                  id: 6,
                  arrival: moment().subtract(1, 'days').format('YYYY-MM-DD'),
                  depart: moment().add(2, 'days').format('YYYY-MM-DD'),
                  customer: 'Guest 6',
                  unit: 62,
                  checked_in: true,
                  checked_out: false,
                  mobile_check_in: false,
                  vip: false,
                  owner: true,
                  locked: false,
                  connected: true,
                  group: false
                },
                {
                  id: 7,
                  arrival: moment().format('YYYY-MM-DD'),
                  depart: moment().add(2, 'days').format('YYYY-MM-DD'),
                  customer: 'Guest 7',
                  unit: 205,
                  checked_in: false,
                  checked_out: false,
                  mobile_check_in: false,
                  vip: true,
                  owner: false,
                  locked: false,
                  connected: false,
                  group: false
                },
                {
                  id: 8,
                  arrival: moment().add(3, 'days').format('YYYY-MM-DD'),
                  depart: moment().add(5, 'days').format('YYYY-MM-DD'),
                  customer: 'Guest 8',
                  unit: 82,
                  checked_in: false,
                  checked_out: false,
                  mobile_check_in: false,
                  vip: false,
                  owner: false,
                  locked: false,
                  connected: false,
                  group: true
                },
                {
                  id: 9,
                  arrival: moment().subtract(1, 'days').format('YYYY-MM-DD'),
                  depart: moment().add(2, 'days').format('YYYY-MM-DD'),
                  customer: 'Guest 9',
                  unit: 198,
                  checked_in: true,
                  checked_out: false,
                  mobile_check_in: false,
                  vip: false,
                  owner: false,
                  locked: false,
                  connected: true,
                  group: false
                },
                {
                  id: 10,
                  arrival: moment().format('YYYY-MM-DD'),
                  depart: moment().add(4, 'days').format('YYYY-MM-DD'),
                  customer: 'Guest 11',
                  unit: 204,
                  checked_in: true,
                  checked_out: false,
                  mobile_check_in: true,
                  vip: false,
                  owner: false,
                  locked: true,
                  connected: false,
                  group: false
                },
                {
                  id: 11,
                  arrival: moment().subtract(5, 'days').format('YYYY-MM-DD'),
                  depart: moment().subtract(3, 'days').format('YYYY-MM-DD'),
                  customer: 'Past Person',
                  unit: 38,
                  checked_in: false,
                  checked_out: false,
                  mobile_check_in: false,
                  vip: false,
                  owner: false,
                  locked: true,
                  connected: false,
                  group: false
                },
                {
                  id: 12,
                  arrival: moment().subtract(6, 'days').format('YYYY-MM-DD'),
                  depart: moment().subtract(2, 'days').format('YYYY-MM-DD'),
                  customer: 'Past Person 2',
                  unit: 41,
                  checked_in: false,
                  checked_out: false,
                  mobile_check_in: false,
                  vip: true,
                  owner: false,
                  locked: false,
                  connected: false,
                  group: false
                }
              ]
            })
            .then(() => {
              this.loading = false
            })
            .catch((err) => {
              this.loading = false
              console.log(err)
            });
          }
        }
    }
</script>

<style scoped>
    .unit-status .subheader {height: auto !important;}
    .unit-status .card__title {padding: 8px !important;}
    .unit-status .card__text {padding: 8px !important;}
    .unit-status .chip__content {line-height: 13px;}
    .unit-status .chip__content .icon {font-size: 18px;}
    .chart-top {
      display: flex;
      justify-content: space-between;
    }
    .chart-top * {
      flex: 1;
    }
    .chart {
      display: flex;
      max-height: 500px;
      overflow-x: hidden;
      overflow-y: auto;
      border-left: 1px solid #e1e1e1;
      border-right: 1px solid #e1e1e1;
      border-bottom: 1px solid #e1e1e1;
    }
    .chart-head {
      display: flex;
      border: 1px solid #e1e1e1;
      background: white;
      text-transform: uppercase;
      font-size: 0.8em;
      font-weight: bold;
    }
    .chart-days-holder {
      flex: 4;
      overflow: hidden;
    }
    .chart-days {
      grid-auto-rows: 50px;
      align-items: center;
      text-align: center;
      display: grid;
    }
    .chart-days.small {
      grid-template-columns: repeat(7, 1fr);
    }
    .chart-days.medium {
      grid-template-columns: repeat(14, 1fr);
    }
    .chart-days.large {
      grid-template-columns: repeat(auto-fit, minmax(10px, 1fr));
      /* grid-template-columns: repeat(31, 1fr); */
      /* width: 200%; */
    }
    .chart-unit {
      flex: 1;
      display: grid;
      align-items: center;
      border-right: 1px solid #e1e1e1;
    }
    .chart-unit span {
      padding-left: 10px;
    }

    @media only screen and (max-width: 600px) {
      .chart-days-holder {
        flex: 2;
      }
      .chart-days.medium {
        grid-template-columns: repeat(auto-fit, minmax(10px, 1fr));
      }
    }

</style>
