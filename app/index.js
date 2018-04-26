import clock from 'clock'
import document from 'document'
import { preferences } from 'user-settings'
import * as util from '../common/utils'
import '../common/polyfill'
import { HeartRateSensor } from "heart-rate"

// Update the clock every minute
clock.granularity = 'seconds'

// @param unit = h | m | s
// @param line = 0 | 1
// @param i = number 0 to 3
// getBitEl('h', 0, 1) === <circle class="h0 1" />
const getBitEl = (unit, line, i) =>
  document.getElementsByClassName(`${unit}${line} ${i}`)[0]

// @param nums: Array<number>
// explodeNumbers([12, 2]) => [ "1", "2", "2" ]
const explodeNumbers = nums =>
  nums.reduce((acc, n) => 
    acc = [...acc, ...n.toString().split('')], [])

// @param num: string
// toBinary(2) => ['0001']
const toBinary = num =>
  parseInt(num, 10).toString(2).padStart(4, '0').split('')

// @param unit: string
// @param line: number
// @returns (bits: []): void 
const refreshBitColAt = (unit, line) => bits =>
  bits.forEach((bit, i) => {
      const el = getBitEl(unit, line, i)
      if (!el) return
    
      if (bit === '1') {
        turnOn(el)
      } else {
        turnOff(el)
      }
  })

// util to toggle bit display
const colorBit = color => el => el.style.fill = color
const turnOn = colorBit('green')
const turnOff = colorBit('#3b3b3b')

clock.ontick = (evt) => {

  const today = evt.date
  // 12h format
  const hours = util.zeroPad(today.getHours() % 12 || 12)
  const mins = util.zeroPad(today.getMinutes())
  const secs = util.zeroPad(today.getSeconds())
  
  // assign each column
  const [hour0Bits, hour1Bits, min0Bits, min1Bits, sec0Bits, sec1Bits] = explodeNumbers([hours, mins, secs]).map(toBinary)
  refreshBitColAt('h', 0)(hour0Bits)
  refreshBitColAt('h', 1)(hour1Bits)
  
  refreshBitColAt('m', 0)(min0Bits)
  refreshBitColAt('m', 1)(min1Bits)
  
  refreshBitColAt('s', 0)(sec0Bits)
  refreshBitColAt('s', 1)(sec1Bits)
}


/**
HR MONITOR
**/
const getHrPeakByIndex = i => document.getElementById('hrpeakinstance' + i)
// Create a new instance of the HeartRateSensor object
const hrm = new HeartRateSensor()


let currentIntervalId = null
const refreshInterval = (hr) => {
  let currentHrBeatInstance = 0
  if (currentIntervalId) clearTimeout(currentIntervalId)
  
  currentIntervalId = setInterval(() => {
    const el = getHrPeakByIndex(currentHrBeatInstance % 8)
    el.animate('enable')                                     
    currentHrBeatInstance++
  }, 60 / hr * 1000)
}

hrm.onreading = function() {
  refreshInterval(hrm.heartRate)
}

// Begin monitoring the sensor
hrm.start()

