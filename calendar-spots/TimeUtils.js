const moment = require('moment')

class TimeUtils {
  /**
   * Obtain a moment object based on an ISO date and an hour.
   * @param {string} dateISO - Date in ISO format (YYYY-MM-DD).
   * @param {string} hour - Hour in HH:mm format.
   * @param {boolean} isUTC - Indicates if the result should be in UTC.
   * @returns {object} Moment object.
   */
  static getMoment (dateISO, hour, isUTC = false) {
    return isUTC ? moment.utc(`${dateISO} ${hour}`) : moment(`${dateISO} ${hour}`)
  }

  /**
   * Obtain a moment object based on an hour.
   * @param {string} hour - Hour in HH:mm format.
   * @param {boolean} isUTC - Indicates if the result should be in UTC.
   * @returns {object} Moment object.
   */
  static getMomentFromHour (hour, isUTC = false) {
    return isUTC ? moment.utc(hour, 'HH:mm') : moment(hour, 'HH:mm')
  }

  /**
   * Add minutes to a specific hour.
   * @param {string} hour - Hour in HH:mm format.
   * @param {number} minutes - Minutes to add.
   * @returns {string} Resulting hour in HH:mm format.
   */
  static addMinutesToHour (hour, minutes) {
    return this.getMomentFromHour(hour).add(minutes, 'minutes').format('HH:mm')
  }

  /**
   * Convert an ISO date and hour to a Date object in UTC.
   * @param {string} dateISO - Date in ISO format (YYYY-MM-DD).
   * @param {string} hour - Hour in HH:mm format.
   * @returns {Date} Date object in UTC.
   */
  static convertToUTCDate (dateISO, hour) {
    return this.getMoment(dateISO, hour, true).toDate()
  }

  /**
   * Obtain the UTC value in milliseconds from an hour.
   * @param {string} hour - Hour in HH:mm format.
   * @returns {number} Value in milliseconds.
   */
  static getUTCValueFromHour (hour) {
    return this.getMomentFromHour(hour, true).valueOf()
  }

  /**
   * Format an hour to HH:mm format in UTC.
   * @param {string} hour - Hour in HH:mm format.
   * @returns {string} Hour in HH:mm format.
   */
  static formatHourToUTC (hour) {
    return this.getMomentFromHour(hour, true).format('HH:mm')
  }

  /**
   * Convert a date in DD-MM-YYYY format to ISO format (YYYY-MM-DD).
   * @param {string} date - Date in DD-MM-YYYY format.
   * @returns {string} Date in ISO format (YYYY-MM-DD).
   */
  static convertToISODate (date) {
    return moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD')
  }

  /**
   * Obtain the value in milliseconds from an ISO date and hour.
   * @param {string} dateISO - Date in ISO format (YYYY-MM-DD).
   * @param {string} hour - Hour in HH:mm format.
   * @returns {number} Value in milliseconds.
   */
  static getValueFromDateTime (dateISO, hour) {
    return this.getMoment(dateISO, hour).valueOf()
  }
}

module.exports = TimeUtils
