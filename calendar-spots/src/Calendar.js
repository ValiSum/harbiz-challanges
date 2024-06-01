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
   * @throws {Error} If there is an error when loading the calendar data.
   */
  getCalendarData () {
    try {
      const rawData = fs.readFileSync('./calendars/calendar.' + this.calendarId + '.json')
      return JSON.parse(rawData)
    } catch (error) {
      throw new Error(`Error when loading calendar data: ${error.message}`)
    }
  }

  /**
   * Method to get the available spots for a specific date and duration.
   * @param {string} date - Date in DD-MM-YYYY format.
   * @param {number} duration - Duration of the session in minutes.
   * @returns {Array} Array of available spots.
   * @throws {Error} If there is an error when getting available spots.
   */
  getAvailableSpots (date, duration) {
    try {
      const dateISO = TimeUtils.convertToISODate(date)
      const { durationBefore, durationAfter, slots } = this.data
      const daySlots = slots[date] || []
      const realSpots = this.filterRealSpots(daySlots, date, dateISO)

      return realSpots.flatMap(slot => new Slot(slot, dateISO, durationBefore, duration, durationAfter).miniSlots)
    } catch (error) {
      throw new Error(`Error when getting available spots: ${error.message}`)
    }
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
      if (this.isSlotWithinRange(dateISO, sessionSlot, daySlot)) {
        availableSlots.push(...this.splitSlot(daySlot, sessionSlot))
        hasConflicts = true
      }
    })

    if (!hasConflicts) {
      availableSlots.push(daySlot)
    }

    return availableSlots
  }

  /**
   * Check if a session slot is within a day slot.
   * @param {string} dateISO - Date in ISO format (YYYY-MM-DD).
   * @param {Object} sessionSlot - Session slot object with start and end times.
   * @param {Object} daySlot - Day slot object with start and end times.
   * @returns {boolean} True if the session slot is within the day slot, false otherwise.
   */
  isSlotWithinRange (dateISO, sessionSlot, daySlot) {
    const sessionStart = TimeUtils.getValueFromDateTime(dateISO, sessionSlot.start)
    const sessionEnd = TimeUtils.getValueFromDateTime(dateISO, sessionSlot.end)
    const start = TimeUtils.getValueFromDateTime(dateISO, daySlot.start)
    const end = TimeUtils.getValueFromDateTime(dateISO, daySlot.end)

    return (sessionStart > start && sessionEnd < end) ||
           (sessionStart === start && sessionEnd <= end) ||
           (sessionStart >= start && sessionEnd === end)
  }

  /**
   * Split a day slot based on a session slot.
   * @param {*} daySlot - Day slot object with start and end times.
   * @param {*} sessionSlot - Session slot object with start and end times.
   * @returns {Array} Array of available slots.
   */
  splitSlot (daySlot, sessionSlot) {
    const slots = []
    if (sessionSlot.start > daySlot.start) {
      slots.push({ start: daySlot.start, end: sessionSlot.start })
    }
    if (sessionSlot.end < daySlot.end) {
      slots.push({ start: sessionSlot.end, end: daySlot.end })
    }
    return slots
  }
}

module.exports = Calendar
