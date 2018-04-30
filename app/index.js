import clock from 'clock'
import document from 'document'
import { preferences } from 'user-settings'
import * as util from '../common/utils'
import '../common/polyfill'
import { HeartRateSensor } from 'heart-rate'

// Update the clock every minute
clock.granularity = 'seconds'

// @param unit = h | m | s
// @param line = 0 | 1  
// @param i = number 0 to 3
// getBitEl('h', 0, 1) === <circle class="h0 1" />
const getBitEl = (unit, line, i) =>
  document.getElementsByClassName(`${unit}${line} ${i}`)[0]

// @param nums: Array<number>
// explodeNumbers(12) => [ '1', '2']
const explodeNumber = n =>
  n.toString().split('')

// @param num: string
// toBinary(2) => ['1000']
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
const colorBitTo = color => el => el.style.fill = color
const turnOn = colorBitTo('#00ff00')
const turnOff = colorBitTo('#3b3b3b')

// util to not trigger a function for the same value type arg
const cache = fn => {
  let cached
  return (val, unit) => {
    if (cached && cached === val) return

    cached = val
    fn(val, unit)
  }
}

const digitsToBits = (val, unit) => 
  explodeNumber(val)
    .map(toBinary)
    .forEach((x, i) => 
       refreshBitColAt(unit, i)(x)
    )

clock.ontick = (evt) => {
  const today = evt.date

  let hours = today.getHours()
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = util.zeroPad(hours);
  }
  const mins = util.zeroPad(today.getMinutes())
  const secs = util.zeroPad(today.getSeconds())
  
  cache(digitsToBits)(hours, 'h')
  cache(digitsToBits)(mins, 'm')
  
  digitsToBits(secs, 's')
}


/**
HR MONITOR
**/
// Create a new instance of the HeartRateSensor object
const hrm = new HeartRateSensor()

const getHrPeakByIndex = i => document.getElementById('hrpeakinstance' + i)
const hrPeaks = [0,1,2,3,4,5,6,7].map(getHrPeakByIndex)

let currentIntervalId = null
const refreshInterval = (hr) => {
  let currentHrBeatInstance = 0
  if (currentIntervalId) clearTimeout(currentIntervalId)
  
  currentIntervalId = setInterval(() => {
    hrPeaks[currentHrBeatInstance % 8].animate('enable')                                     
    currentHrBeatInstance++
  }, 60 / hr * 1000)
}

hrm.onreading = function() {
  refreshInterval(hrm.heartRate)
}

// Begin monitoring the sensor
hrm.start()