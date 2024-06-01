const fs = require('fs')
const TimeUtils = require('./TimeUtils')
const Slot = require('./Slot')

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

    return realSpots.map(slot => new Slot(slot, dateISO, durationBefore, duration, durationAfter).generateMiniSlots()).flat()
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
}

module.exports = Calendar
