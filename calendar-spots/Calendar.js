const fs = require('fs')
const TimeUtils = require('./TimeUtils')

class Calendar {
  constructor (calendarId) {
    this.calendarId = calendarId
    this.data = this.getCalendarData()
  }

  // Method to read and parse the calendar file (convert it to a object)
  getCalendarData () {
    const rawData = fs.readFileSync('./calendars/calendar.' + this.calendarId + '.json')
    const data = JSON.parse(rawData)
    return data
  }

  getAvailableSpots (date, duration) {
    // Get the date in ISO format
    const dateISO = TimeUtils.convertToISODate(date)

    // Get the duration before and after the session
    const durationBefore = this.data.durationBefore
    const durationAfter = this.data.durationAfter
    // Get the slots for the day
    const daySlots = this.data.slots[date] || []
    // Filter the slots and get only the available spots (without conflicts with reserved sessions)
    const realSpots = this.filterRealSpots(daySlots, date, dateISO)

    // Create the mini slots for the available spots based on the duration of the session and the duration before and after the session
    const arrSlot = []
    realSpots.forEach(slot => {
      let start = slot.start
      let resultSlot

      // Create the mini slots for the available spots until the end of the slot is reached
      do {
        resultSlot = this.getOneMiniSlot(start, slot.end, dateISO, durationBefore, duration, durationAfter)
        if (resultSlot) {
          arrSlot.push(resultSlot)
          start = TimeUtils.formatHourToUTC(resultSlot.endHour)
        }
      } while (resultSlot)
    })

    // Return the available spots
    return arrSlot
  }

  // Method to filter the slots and get only the available spots (without conflicts with reserved sessions)
  filterRealSpots (daySlots, date, dateISO) {
    const realSpots = []
    daySlots.forEach(daySlot => {
      // Check if the slot has a session and if it has conflicts with the session
      if (this.data.sessions && this.data.sessions[date]) {
        let noConflicts = true
        this.data.sessions[date].forEach(sessionSlot => {
          const sessionStart = TimeUtils.getValueFromDateTime(dateISO, sessionSlot.start)
          const sessionEnd = TimeUtils.getValueFromDateTime(dateISO, sessionSlot.end)
          const start = TimeUtils.getValueFromDateTime(dateISO, daySlot.start)
          const end = TimeUtils.getValueFromDateTime(dateISO, daySlot.end)
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

    return realSpots
  }

  // Method to get the mini slot based on the start and end of the slot and the duration of the session
  getOneMiniSlot (startSlot, endSlot, dateISO, durationBefore, duration, durationAfter) {
    const startHourFirst = TimeUtils.getMoment(dateISO, startSlot)

    const startHour = startHourFirst.format('HH:mm')
    const endHour = TimeUtils.addMinutesToHour(startHour, durationBefore + duration + durationAfter)
    const clientStartHour = TimeUtils.addMinutesToHour(startHourFirst, durationBefore)
    const clientEndHour = TimeUtils.addMinutesToHour(startHourFirst, durationBefore + duration)

    // Check if the end of the slot is reached (if the end of the mini slot is greater than the end of the slot)
    if (TimeUtils.getUTCValueFromHour(endHour) > TimeUtils.getUTCValueFromHour(endSlot)) {
      return null
    }

    return {
      startHour: TimeUtils.convertToUTCDate(dateISO, startHour),
      endHour: TimeUtils.convertToUTCDate(dateISO, endHour),
      clientStartHour: TimeUtils.convertToUTCDate(dateISO, clientStartHour),
      clientEndHour: TimeUtils.convertToUTCDate(dateISO, clientEndHour)
    }
  }
}

module.exports = Calendar
