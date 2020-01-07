<template>
<div>
    <v-layout row wrap>
        <v-flex xs12>
            <v-btn depressed outline to="/"><v-icon left small>arrow_back</v-icon>Back</v-btn>
            <h2 class="headline">Occupancy Report</h2>
        </v-flex>
        <v-flex xs12>
            <v-layout row wrap>
                <v-flex xs12>
                    <p>Start Date is now, choose an end date.</p>
                </v-flex>
                <v-flex xs12>
                    <v-date-picker v-model="date_ranges.end_date" :min="min_date"></v-date-picker>
                </v-flex>
                <!-- <v-flex xs12 sm4>
                    <studeo-date-picker v-model="date_as_of" :dialog="date_as_of_dialog" label="Date as of" id="date_as_of" />
                </v-flex>
                <v-flex xs12 sm4>
                    <studeo-date-picker v-model="date_compare" :dialog="date_compare_dialog" label="Date to compare with" id="date_compare" :max_date="max_date" />
                </v-flex>
                <v-flex xs12 sm4>
                    <studeo-date-range-picker :allow_delete="false" @input="updateDateRange" :allow_past_dates="true" :default_start_date="date_ranges.start_date" :default_end_date="date_ranges.end_date" :prepend_calendar="true" :default_as_month="false"
                        ref="rangePicker" :label="'Date Range'"></studeo-date-range-picker>
                </v-flex> -->
            </v-layout>
            <v-layout row wrap>
                <v-flex xs12>
                    <v-btn color="blue" @click="runReport()" style="color:white;" :disabled="!date_ranges.end_date">
                        Run Report
                        <v-icon right small>arrow_forward</v-icon>
                    </v-btn>
                </v-flex>
            </v-layout>
        </v-flex>
        <v-flex xs12 class="mb-4">
            <v-divider></v-divider>
        </v-flex>

        <v-flex xs12>
            <span class="body-2 grey--text">Date from: </span>
            <span class="body-2 mr-2">{{date_ranges.start_date}}</span>
            <span class="body-2 grey--text">Date to: </span>
            <span class="body-2 mr-2">{{date_ranges.end_date}}</span>
        </v-flex>
        <v-flex xs12>

            <report-table :headers="headers" :items="items" :date_as_of="date_as_of" :date_compare="date_compare" type="occ"></report-table>

            <v-progress-linear :indeterminate="true" :active="progress" height="2" class="mt-0"></v-progress-linear>
        </v-flex>
    </v-layout>
</div>
</template>

<script>
import moment from 'moment'
import ReportTable from '../Components/ReportTable.vue'

export default {
    routes: [{
        path: '/occupancy-report',
        name: 'occupancy-report'
    }],
    components: {
        'report-table': ReportTable
    },
    data() {
        return {
            canManagePermission: 'CanViewJournal',
            pageTitle: 'Occupancy Report',
            routePrefix: 'occupancy-report',
            progress: false,
            date_as_of_dialog: false,
            date_compare_dialog: false,
            panel: [false],
            journal: [],
            details: [],
            date_as_of: moment().format('YYYY-MM-DD'),
            date_compare: moment().subtract(1, 'day').format('YYYY-MM-DD'),
            num_days: null,
            disableOptions: false,
            apply_options: [{
                text: 'Rate Group',
                val: 1
            }, {
                text: 'Units/Room Type',
                val: 2
            }],
            apply_option: null,
            rate_groups: null,
            rate_group: [],
            bedMap: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            groupings: [
                {title: 'No Grouping', value: 1},
                {title: 'Group by Division', value: 2},
                {title: 'Group by Building', value: 3}
            ],
            grouping: 1,
            date_ranges: {
                start_date: moment().format('YYYY-MM-DD'),
                end_date: null,
                id: undefined
            },
            headers: [],
            emptyItems: [],
            items: [],
            selectedUnits: [],
            finalUnits: [],
            pagination: {
                page: 1,
                rowsPerPage: -1,
                sortBy: 'date',
                descending: false
            },
            responsive: {
                xs: 2,
                sm: 3,
                md: 4,
                lg: 10,
                currentColumn: 1,
                lastColumn: null
            }
        };
    },
    computed: {
        min_date() {
            return moment(this.date_ranges.start_date).add(2, 'days').toISOString()
        },
        number_days() {
            let days = new Array(91).fill().map((_, i) => i)
            days = days.filter(i => i > 0)
            return days
        },
        filter_name() {
            const items = []
            if(this.rate_group.length) {
                this.rate_group.map(num => {
                    const match = this.rate_groups.filter(item => item.id == num)[0]
                    console.log(match)
                    if(match)
                        items.push(match.name)
                })
                return items.join().replace(/,/g, ', ')
            }
            if(this.finalUnits.length) {
                this.finalUnits.map(item => {
                    items.push(item.name)
                })
                return items.join().replace(/,/g, ', ')
            }
        },
        grouping_name() {
            if(this.grouping) {}
                return this.groupings.filter(item => item.value == this.grouping)[0].title
            return
        }
    },
    methods: {
        removeChip(item) {
            this.finalUnits.splice(this.finalUnits.indexOf(item), 1)
        },
        selectChange() {
            if (this.apply_option == 1) {
                this.selectedUnits = []
                this.finalUnits = []
                this.loadRateGroups()
            } else {
                this.rate_group = []
            }
        },
        updateDateRange(obj) {
            if (!this.date_ranges) {
                this.date_ranges = {}
            }
            this.date_ranges = obj;
            this.date_ranges.start_date = this.localMoment(this.date_ranges.start_date).format('YYYY-MM-DD')
            this.date_ranges.end_date = this.localMoment(this.date_ranges.end_date).format('YYYY-MM-DD')
        },
        runReport() {
            const start = moment(this.date_ranges.start_date)
            const end = moment(this.date_ranges.end_date)
            const numDays = end.diff(start, 'days')
            console.log(numDays)

            const startDate = moment(this.date_ranges.start_date).clone().startOf('day');
            const endDate = moment(this.date_ranges.end_date).clone().startOf('day');
            const dates = []
            while (startDate.add(1, 'days').diff(endDate) < 0) {
                dates.push(startDate.clone().format('ddd MMM D'));
            }
            dates.unshift(moment(this.date_ranges.start_date).format('ddd MMM D'))
            dates.push(moment(this.date_ranges.end_date).format('ddd MMM D'))
            console.log(dates)
            this.headers = []
            this.items = []
            dates.map(item => {
                // this.headers.push(
                //     {
                //         text: item,
                //         align: 'left',
                //         sortable: true,
                //         value: item
                //     }
                // )
                this.headers.push({
                    date: item,
                    event: Math.floor(Math.random() * 2)
                })
                // this.headers.push(item)
                this.items.push({
                    date_as_of: Math.floor(Math.random() * 101),
                    date_compare: Math.floor(Math.random() * 101),
                    pick_up: Math.floor(Math.random() * 101),
                    last_year_pace: Math.floor(Math.random() * 101),
                    reach_ly_pace: Math.floor(Math.random() * 101),
                    last_year_actuals: Math.floor(Math.random() * 101),
                    reach_ly_actuals: Math.floor(Math.random() * 101)
                })
            })
        },
    }
}
</script>

<style scoped>
.occupancy-table {
    border-collapse: collapse;
    border: 1px solid #CCC;
}

.occupancy-table td {
    border: 1px solid #CCC;
}

.unit-list-headers {
    color: #999;
    font-size: 1rem;
    text-transform: uppercase;
    border-bottom: 1px solid #999;
    margin-bottom: 5px;
    margin-top: 10px;
    letter-spacing: 1px;
}
</style>
