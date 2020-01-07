<template>
  <div class="calendar" :class="style" ref="calendar" @scroll="onScroll">
    <div class="calendar__week" v-for="(item, index) in units" :class="style">
      <span v-for="(r, id) in res" v-if="r.unit == item.id && (r.depart >= arrive && r.arrival <= leave)" :style="[leftStyle(r.arrival), widthStyle(r.arrival, r.depart), resColor(r)]" @click="goToRes(r)">
        <p class="text">{{r.customer}}</p>
        <v-icon style="vertical-align:top;padding:0 2px;" color="white" size="17" v-if="r.vip">mood</v-icon>
        <v-icon style="vertical-align:top;padding:0 2px;" color="white" size="17" v-if="r.owner">person_pin</v-icon>
        <v-icon style="vertical-align:top;padding:0 2px;" color="white" size="17" v-if="r.locked">lock</v-icon>
        <v-icon style="vertical-align:top;padding:0 2px;" color="white" size="17" v-if="r.connected">link</v-icon>
        <v-icon style="vertical-align:top;padding:0 2px;" color="white" size="17" v-if="r.group">people</v-icon>
      </span>
      <div class="calendar__day day" v-for="day in days">
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'Chart',
  data () {
    return {

    }
  },
  computed: {
    days() {
      let array = Array(this.size).fill().map((_, i) => moment(this.newDate).clone().add(i, 'days').format('YYYY-MM-DD'))
      return array
    },
    newDate() {
      if(!this.date) {
        return moment().format('YYYY-MM-DD')
      } else {
        return this.date
      }
    },
    arrive() {
      let arrive = moment(this.newDate).format('YYYY-MM-DD')
      return arrive
    },
    leave() {
      let leaving = moment(this.newDate).clone().add(this.size - 1, 'days').format('YYYY-MM-DD')
      return leaving;
    },
    style() {
      if(this.size == 31) {
        return 'large'
      } else if(this.size == 14) {
        return 'medium'
      } else {
        return 'small'
      }
    }
  },
  methods: {
    goToRes(res) {
      console.log(this.leftStyle(res.arrival))
    },
    onScroll(event) {
      this.$emit('scrolling', event)
    },
    headerFormat(day) {
      return moment(day).format('MMM D')
    },
    leftStyle(arrival) {
      let multiplier = 100 / this.size
      let number = 100 / (this.size * 2)
      if(this.size == 31) {
        multiplier = (100 / (this.size * 2)) * 2 //3.2258
      }
      let array = Array(31).fill().map((_, i) => {
        if (i == 0) {
          if(arrival < moment(this.newDate).format('YYYY-MM-DD')) {
            return {left: '0%'}
          }
          if(arrival == moment(this.newDate).format('YYYY-MM-DD')) {
            return {left: number + '%'}
          }
        } else {
          if(arrival == moment(this.newDate).clone().add(i, 'days').format('YYYY-MM-DD')) {
            return {left: (number + (multiplier * i)) + '%'}
          }
        }
      })
      let final = array.filter((item) => item != undefined)
      return final[0]
    },
    widthStyle(arrival, depart) {
      let arr = moment(arrival) //arrival date
      let dep = moment(depart) //departure date
      let first = moment(this.newDate) //current date
      if(arr < first) {
        arr = first
      }
      let duration = moment.duration(dep.diff(arr)); //difference from arrival to departure
      let fromLeft = moment.duration(first.diff(arr)); //difference from arrival to now
      let days = duration.asDays(); //+days between arrival and depart
      let minusDays = fromLeft.asDays(); //-days between arrival and now
      let arrFormat = moment(arrival).format('YYYY, MM, DD')
      let firstFormat = moment(this.newDate).format('YYYY, MM, DD')
      let depFormat = moment(depart).format('YYYY, MM, DD')
      let multiplier = 100 / this.size
      let width = multiplier * days
      let number = 100 / (this.size * 2)
      if(arrFormat < firstFormat && firstFormat == depFormat) {
        return {width: number + '%'}
      } else if(arrFormat < firstFormat) {
        return {width: (width + number) + '%'}
      } else {
        return {width: width + '%'}
      }
    },
    resColor(res) {
      let arrive = moment(res.arrival)
      let depart = moment(res.depart)
      let now = moment()
      // if(res.mobile_check_in) {
      //   return {background: '#FF9800;'}
      // }
      // if(res.checked_out || depart.isSame(now, 'day')) {
      //   return {background: '#F44336;'}
      // }
      // if(res.checked_in && !res.mobile_check_in && !res.checked_out) {
      //   return {background: '#1976d2;'}
      // }
      // if(depart.isBefore(now, 'day')) {
      //   return {background: '#ccc;'}
      // }
      // if(arrive.isSame(now, 'day')) {
      //   return {background: '#4CAF50'}
      // }
      // if(arrive.isAfter(now, 'day')) {
      //   return {background: '#666'}
      // }
      switch(true) {
        case res.mobile_check_in:
          return {background: '#FF9800'}
          break;
        case res.checked_out:
          return {background: '#F44336'}
          break;
        case res.checked_in:
          return {background: '#1976d2'}
          break;
        case depart.isBefore(now, 'day'):
          return {background: '#ccc'}
          break;
        case depart.isSame(now, 'day'):
          return {background: '#F44336'}
          break;
        case arrive.isSame(now, 'day'):
          return {background: '#4CAF50'}
          break;
        case arrive.isAfter(now, 'day'):
          return {background: '#78909C'}
          break;
        default:
          return {background: '#78909C'}
      }
    }
  },
  mounted() {
    //Get dates allowed for datepicker
    let arr = []
    let dep = []
    let usedDates = []
    let datesArray = []
    let dates = this.res.map((item, index) => {
      arr.push(moment(item.arrival))
      dep.push(moment(item.depart))
      let newDates = moment.duration(dep[index].diff(arr[index])).asDays()
      datesArray.push(newDates)
      usedDates.push(moment(item.arrival).format('YYYY, MM, DD'))
      usedDates.push(arr[index].add(datesArray[index], 'days').format('YYYY, MM, DD'))
      datesArray = [...(new Set(usedDates))]
    });
    console.log(datesArray)
  },
  props: ['date', 'units', 'res', 'size']
}
</script>

<style scoped>
.calendar__week,
.calendar__header {
  display: grid;
}
.calendar__week {
  grid-auto-rows: 50px;
  text-align: right;
  position: relative;
  overflow: hidden;
}
.calendar__week.small {
  grid-template-columns: repeat(7, 1fr);
}
.calendar__week.medium {
  grid-template-columns: repeat(14, 1fr);
}
.calendar__week.large {
  grid-template-columns: repeat(auto-fit, minmax(10px, 1fr));
  /* grid-template-columns: repeat(31, 1fr); */
  /* width: 200%; */
}
.calendar__header {
  grid-auto-rows: 50px;
  align-items: center;
  text-align: center;
}

.calendar__day {
  padding: 16px;
}
.calendar__week.large .calendar__day {
  padding: 0;
}
.calendar {
  flex: 4;
  background-color: white;
  height: 100%;
}
.calendar.small {
  overflow: hidden;
}
.calendar.medium {
  overflow: hidden;
}
.calendar.large {
  overflow: auto;
}

.calendar span {
  position: absolute;
  height: 30px;
  width: 25%;
  top: 10px;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border: 1px solid white;
  cursor: pointer;
  padding: 6px 8px;
  transition: width .3s;
}
.calendar span .text {
  color: white;
  font-size: 0.9rem;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
}

.calendar__header > div {
  text-transform: uppercase;
  font-size: 0.8em;
  font-weight: bold;
}

.calendar__day {
  border-right: 1px solid #e1e1e1;
  border-top: 1px solid #e1e1e1;
}
.calendar__week:first-child .calendar__day {
  border-top: 0px solid #e1e1e1;
}

.calendar__day:last-child {
  border-right: 0;
}
@media only screen and (max-width: 600px) {
  .calendar {
    flex: 2;
  }
  .calendar__week.medium {
    grid-template-columns: repeat(auto-fit, minmax(10px, 1fr));
  }
  .calendar__week.medium .calendar__day {
    padding: 0;
  }
}
</style>
