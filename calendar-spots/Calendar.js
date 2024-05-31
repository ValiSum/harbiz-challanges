const moment = require('moment')
const fs = require('fs')

function getAvailableSpots (calendar, date, duration) {
  // Read and parse the calendar file (convert it to a object)
  const rawdata = fs.readFileSync('./calendars/calendar.' + calendar + '.json')
  const data = JSON.parse(rawdata)

  // Get the date in ISO format
  const dateISO = moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD')

  // Get the duration before and after the session
  const durationBefore = data.durationBefore
  const durationAfter = data.durationAfter

  // Get the slots for the day
  let daySlots = []
  for (const key in data.slots) {
    if (key === date) {
      daySlots = data.slots[key]
    }
  }

  // Filter the slots and get only the available spots (without conflicts with reserved sessions)
  const realSpots = []
  daySlots.forEach(daySlot => {
    // Check if the slot has a session and if it has conflicts with the session
    if (data.sessions && data.sessions[date]) {
      let noConflicts = true
      data.sessions[date].forEach(sessionSlot => {
        const sessionStart = moment(dateISO + ' ' + sessionSlot.start).valueOf()
        const sessionEnd = moment(dateISO + ' ' + sessionSlot.end).valueOf()
        const start = moment(dateISO + ' ' + daySlot.start).valueOf()
        const end = moment(dateISO + ' ' + daySlot.end).valueOf()
        if (sessionStart > start && sessionEnd < end) {
          // If the session is in the middle of the slot, the slot is divided into two spots (before and after the session)
          realSpots.push({ start: daySlot.start, end: sessionSlot.start })
          realSpots.push({ start: sessionSlot.end, end: daySlot.end })
          noConflicts = false
        } else if (sessionStart === start && sessionEnd < end) {
          // If the session starts at the beginning of the slot, the spot is added after the session ends (after the session)
          realSpots.push({ start: sessionSlot.end, end: daySlot.end })
          noConflicts = false
        } else if (sessionStart > start && sessionEnd === end) {
          // If the session ends at the end of the slot, the spot is added before the session starts (before the session)
          realSpots.push({ start: daySlot.start, end: sessionSlot.start })
          noConflicts = false
        } else if (sessionStart === start && sessionEnd === end) {
          noConflicts = false
        }
      })
      if (noConflicts) {
        realSpots.push(daySlot)
      }
    } else {
      realSpots.push(daySlot)
    }
  })

  // Create the mini slots for the available spots based on the duration of the session and the duration before and after the session
  const arrSlot = []
  realSpots.forEach(function (slot) {
    let init = 0
    let startHour
    let endHour
    let clientStartHour
    let clientEndHour

    function getMomentHour (hour) {
      const finalHourForAdd = moment(dateISO + ' ' + hour)
      return finalHourForAdd
    }
    function addMinutes (hour, minutes) {
      const result = moment(hour).add(minutes, 'minutes').format('HH:mm')
      return result
    }
    function removeMinutes (hour, minutes) {
      const result = moment(hour).subtract(minutes, 'minutes').format('HH:mm')
      return result
    }

    // Function to get the mini slot based on the start and end of the slot and the duration of the session
    function getOneMiniSlot (startSlot, endSlot) {
      const startHourFirst = getMomentHour(startSlot)

      startHour = startHourFirst.format('HH:mm')
      endHour = addMinutes(
        startHourFirst,
        durationBefore + duration + durationAfter
      )
      clientStartHour = addMinutes(startHourFirst, durationBefore)
      clientEndHour = addMinutes(startHourFirst, duration)

      // Check if the end of the slot is reached (if the end of the mini slot is greater than the end of the slot)
      if (
        moment.utc(endHour, 'HH:mm').valueOf() >
        moment.utc(endSlot, 'HH:mm').valueOf()
      ) {
        return null
      }
      const objSlot = {
        startHour: moment.utc(dateISO + ' ' + startHour).toDate(),
        endHour: moment.utc(dateISO + ' ' + endHour).toDate(),
        clientStartHour: moment.utc(dateISO + ' ' + clientStartHour).toDate(),
        clientEndHour: moment.utc(dateISO + ' ' + clientEndHour).toDate()
      }
      console.log('objSlot', objSlot)
      init += 1
      return objSlot
    }

    let start = slot.start
    let resultSlot

    // Create the mini slots for the available spots until the end of the slot is reached
    do {
      resultSlot = getOneMiniSlot(start, slot.end)
      if (resultSlot) {
        arrSlot.push(resultSlot)
        start = moment.utc(resultSlot.endHour).format('HH:mm')
      }
    } while (resultSlot)

    return arrSlot
  })

  // Return the available spots
  return arrSlot
}

module.exports = { getAvailableSpots }
