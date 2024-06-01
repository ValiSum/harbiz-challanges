const fs = require('fs')
const TimeUtils = require('./TimeUtils')
const Slot = require('./Slot')

class Calendar {
  constructor (calendarId) {
    this.calendarId = calendarId
    this.data = this.getCalendarData()
  }

  /**
   * Method to get the calendar data from the JSON file.
   * @returns {Object} Parsed calendar data.
   */
  getCalendarData () {
    const rawData = fs.readFileSync('./calendars/calendar.' + this.calendarId + '.json')
    const data = JSON.parse(rawData)
    return data
  }

  /**
   * Method to get the available spots for a specific date and duration.
   * @param {string} date - Date in DD-MM-YYYY format.
   * @param {number} duration - Duration of the session in minutes.
   * @returns {Array} Array of available spots.
   */
  getAvailableSpots (date, duration) {
    const dateISO = TimeUtils.convertToISODate(date)
    const { durationBefore, durationAfter, slots } = this.data
    const daySlots = slots[date] || []
    const realSpots = this.filterRealSpots(daySlots, date, dateISO)

    return realSpots.flatMap(slot => new Slot(slot, dateISO, durationBefore, duration, durationAfter).miniSlots)
  }

  /**
   * Get available day slots based on conflicts with sessions.
   * @param {Object} daySlot - Day slot object with start and end times.
   * @param {string} date - Date in DD-MM-YYYY format.
   * @param {string} dateISO - Date in ISO format (YYYY-MM-DD).
   * @returns {Array} Array of available day slots.
   */
  filterRealSpots (daySlots, date, dateISO) {
    return daySlots.flatMap(daySlot => this.getAvailableDaySlots(daySlot, date, dateISO))
  }

  /**
   * Get available day slots based on conflicts with sessions.
   * @param {Object} daySlot - Day slot object with start and end times.
   * @param {string} date - Date in DD-MM-YYYY format.
   * @param {string} dateISO - Date in ISO format (YYYY-MM-DD).
   * @returns {Array} Array of available day slots.
   */
  getAvailableDaySlots (daySlot, date, dateISO) {
    if (!this.data.sessions || !this.data.sessions[date]) {
      return [daySlot]
    }

    const availableSlots = []
    let hasConflicts = false

    this.data.sessions[date].forEach(sessionSlot => {
      const sessionStart = TimeUtils.getValueFromDateTime(dateISO, sessionSlot.start)
      const sessionEnd = TimeUtils.getValueFromDateTime(dateISO, sessionSlot.end)
      const start = TimeUtils.getValueFromDateTime(dateISO, daySlot.start)
      const end = TimeUtils.getValueFromDateTime(dateISO, daySlot.end)
      if (sessionStart > start && sessionEnd < end) {
        availableSlots.push({ start: daySlot.start, end: sessionSlot.start })
        availableSlots.push({ start: sessionSlot.end, end: daySlot.end })
        hasConflicts = true
      } else if (sessionStart === start && sessionEnd < end) {
        availableSlots.push({ start: sessionSlot.end, end: daySlot.end })
        hasConflicts = true
      } else if (sessionStart > start && sessionEnd === end) {
        availableSlots.push({ start: daySlot.start, end: sessionSlot.start })
        hasConflicts = true
      } else if (sessionStart === start && sessionEnd === end) {
        hasConflicts = true
      }
    })

    if (!hasConflicts) {
      availableSlots.push(daySlot)
    }

    return availableSlots
  }
}

module.exports = Calendar
