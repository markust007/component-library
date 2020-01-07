<template>
<div class="elevation-1" style="overflow-x:auto;position:relative;">
    <table class="occupancy-table" v-if="headers.length && items.length">
        <thead>
            <!-- <v-tooltip v-model="show_tooltip" top>
                <template v-slot:activator="{ on }">
                    <tr>
                        <th class="left-column">Event/Holiday</th>
                        <th :id="'header' + index" class="headers" v-for='(header, index) in headers' :key="header.date" :style="{background: header.event ? 'yellow' : 'transparent', cursor: header.event ? 'pointer' : 'auto'}" colspan="1" @click="header.event ? showEvent(header) : null">
                        </th>
                    </tr>
                </template>
                <span>{{tooltip.date}}: {{tooltip.event}}</span>
                <span><v-btn small icon @click="show_tooltip = false" color="error" style="margin:0 0 0 10px;"><v-icon>close</v-icon></v-btn></span>
            </v-tooltip> -->
            <tr>
                <th class="left-column">Dates</th>
                <th class="headers" v-for="header in headers" :key="header.date" @click="goToTapeChart(header.date)" style="cursor:pointer;">
                    {{ header.date }}
                </th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="left-column"><span class="text-capitalize">{{type}}</span><span v-if="type == 'occ'"> %</span> on {{date_as_of}}</td>
                <td v-for="item in items" :style="dateAsOfStyle(item.date_as_of)">{{item.date_as_of}}<span v-if="type == 'occ'">%</span></td>
            </tr>
            <tr>
                <td class="left-column"><span class="text-capitalize">{{type}}</span><span v-if="type == 'occ'"> %</span> on {{date_compare}}</td>
                <td v-for="item in items">{{item.date_compare}}<span v-if="type == 'occ'">%</span></td>
            </tr>
            <tr>
                <td class="left-column">Pick up <span v-if="type == 'occ'">%</span></td>
                <td v-for="item in items" :style="pickUpStyle(item.pick_up)">{{item.pick_up}}<span v-if="type == 'occ'">%</span></td>
            </tr>
            <tr style="height:32px;">
                <td class="left-column"></td>
                <td v-for="item in items"></td>
            </tr>
            <tr>
                <td class="left-column">Last Year <span class="text-capitalize">{{type}}</span> Pace</td>
                <td v-for="item in items">{{item.last_year_pace}}<span v-if="type == 'occ'">%</span></td>
            </tr>
            <tr>
                <td class="left-column">Reach to LY <span class="text-capitalize">{{type}}</span> Pace</td>
                <td v-for="item in items" :style="reachToLYPaceStyle(item.reach_ly_pace)">{{item.reach_ly_pace}}<span v-if="type == 'occ'">%</span></td>
            </tr>
            <tr style="height:32px;">
                <td class="left-column"></td>
                <td v-for="item in items"></td>
            </tr>
            <tr>
                <td class="left-column">Last Year <span class="text-capitalize">{{type}}</span> Actuals</td>
                <td v-for="item in items">{{item.last_year_actuals}}<span v-if="type == 'occ'">%</span></td>
            </tr>
            <tr>
                <td class="left-column">Reach to LY <span class="text-capitalize">{{type}}</span> Acutals</td>
                <td v-for="item in items">{{item.reach_ly_actuals}}<span v-if="type == 'occ'">%</span></td>
            </tr>
        </tbody>
    </table>
</div>
</template>

<script>
export default {
    props: ['headers', 'items', 'date_as_of', 'date_compare', 'type'],
    data() {
        return {
            show_tooltip: false,
            tooltip: {
                date: '',
                event: 'Some Event'
            }
        };
    },
    methods: {
        showEvent(header) {
            this.tooltip.date = header.date
            this.show_tooltip = true
        },
        dateAsOfStyle(item) {
            if(this.type == 'occ') {
                const newItem = parseInt(item)
                if(newItem < 20) {
                    return 'background:#F44336;color:white;'
                }
                if(newItem >= 80) {
                    return 'background:#4CAF50;'
                }
            }
        },
        pickUpStyle(item) {
            const newItem = parseInt(item)
            if(this.type == 'occ') {
                if(newItem < 0) {
                    return 'background:#F44336;color:white;'
                }
                if(newItem >= 6) {
                    return 'background:#4CAF50;'
                }
            } else {
                if(newItem < 0) {
                    return 'background:#F44336;color:white;'
                }
            }
        },
        reachToLYPaceStyle(item) {
            const newItem = parseInt(item)
            if(newItem < 0) {
                return 'background:#F44336;color:white;'
            }
            if(newItem >= 10) {
                return 'background:#4CAF50;'
            }
        },
        goToTapeChart(date) {

        }
    }
}
</script>

<style scoped>
.occupancy-table {
    border-collapse: collapse;
    border: 1px solid #CCC;
    width: 100%;
}
.occupancy-table th, .occupancy-table td {
    text-align: center;
    padding: 5px;
}
.occupancy-table .headers {
    font-size: 0.8rem;
    min-width: 80px;
    text-transform: uppercase;
}
.occupancy-table .left-column {
    text-align: left;
    min-width: 200px
}
.occupancy-table td {
    border: 1px solid #CCC;
}
</style>
