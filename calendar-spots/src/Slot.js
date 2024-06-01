const TimeUtils = require('./TimeUtils')

class Slot {
  constructor (slot, dateISO, durationBefore, duration, durationAfter) {
    this.slot = slot
    this.dateISO = dateISO
    this.durationBefore = durationBefore
    this.duration = duration
    this.durationAfter = durationAfter
    this.miniSlots = this.generateMiniSlots()
  }

  /**
   * Generate mini slots based on the given slot and durations.
   * @returns {Array} Array of mini slots.
   */
  generateMiniSlots () {
    const miniSlots = []
    let start = this.slot.start
    let resultSlot

    do {
      resultSlot = this.getOneMiniSlot(start)
      if (resultSlot) {
        miniSlots.push(resultSlot)
        start = TimeUtils.formatHourToUTC(resultSlot.endHour)
      }
    } while (resultSlot)

    return miniSlots
  }

  /**
   * Generate a single mini slot based on the start slot and end slot.
   * @param {*} startSlot - The start time of the slot.
   * @returns {Object|null} The mini slot or null if the end hour is greater than the end slot.
   */
  getOneMiniSlot (startSlot) {
    const startHourFirst = TimeUtils.getMoment(this.dateISO, startSlot)
    const startHour = TimeUtils.getHourFromDateTime(this.dateISO, startSlot)
    const endHour = this.calculateEndHour(startHour)
    const clientStartHour = this.calculateClientHour(startHourFirst, this.durationBefore)
    const clientEndHour = this.calculateClientHour(startHourFirst, this.durationBefore + this.duration)

    if (TimeUtils.getUTCValueFromHour(endHour) > TimeUtils.getUTCValueFromHour(this.slot.end)) {
      return null
    }

    return {
      startHour: TimeUtils.convertToUTCDate(this.dateISO, startHour),
      endHour: TimeUtils.convertToUTCDate(this.dateISO, endHour),
      clientStartHour: TimeUtils.convertToUTCDate(this.dateISO, clientStartHour),
      clientEndHour: TimeUtils.convertToUTCDate(this.dateISO, clientEndHour)
    }
  }

  /**
   * Calculates the end hour of a mini slot.
   * @param {string} startHour - The start hour of the mini slot.
   * @returns {string} The end hour of the mini slot.
   */
  calculateEndHour (startHour) {
    return TimeUtils.addMinutesToHour(startHour, this.durationBefore + this.duration + this.durationAfter)
  }

  /**
   * Calculates the client start or end hour.
   * @param {Object} startHourFirst - The moment object representing the start hour.
   * @param {number} duration - The duration to add.
   * @returns {string} The client start or end hour.
   */
  calculateClientHour (startHourFirst, duration) {
    return TimeUtils.addMinutesToHour(startHourFirst, duration)
  }
}

module.exports = Slot
