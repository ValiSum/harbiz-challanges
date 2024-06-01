const moment = require('moment')
const assert = require('assert')
const TimeUtils = require('../src/TimeUtils')

describe('TimeUtils', function () {
  describe('getMoment', function () {
    it('should return a moment object for local time', function () {
      const result = TimeUtils.getMoment('2024-06-01', '12:30')
      assert.strictEqual(result.format('YYYY-MM-DD HH:mm'), '2024-06-01 12:30')
    })

    it('should return a moment object for UTC time', function () {
      const result = TimeUtils.getMoment('2024-06-01', '12:30', true)
      assert.strictEqual(result.format('YYYY-MM-DD HH:mm'), '2024-06-01 12:30')
    })
  })

  describe('getMomentFromHour', function () {
    it('should return a moment object for local time', function () {
      const result = TimeUtils.getMomentFromHour('12:30')
      assert.strictEqual(result.format('HH:mm'), '12:30')
    })

    it('should return a moment object for UTC time', function () {
      const result = TimeUtils.getMomentFromHour('12:30', true)
      assert.strictEqual(result.format('HH:mm'), '12:30')
    })
  })

  describe('addMinutesToHour', function () {
    it('should add 30 minutes to the hour', function () {
      const result = TimeUtils.addMinutesToHour('12:30', 30)
      assert.strictEqual(result, '13:00')
    })

    it('should subtract 30 minutes from the hour', function () {
      const result = TimeUtils.addMinutesToHour('12:30', -30)
      assert.strictEqual(result, '12:00')
    })
  })

  describe('convertToUTCDate', function () {
    it('should convert ISO date and hour to UTC Date object', function () {
      const result = TimeUtils.convertToUTCDate('2024-06-01', '12:30')
      assert.strictEqual(result.toISOString(), moment.utc('2024-06-01 12:30').toDate().toISOString())
    })
  })

  describe('getUTCValueFromHour', function () {
    it('should get the UTC value in milliseconds from an hour', function () {
      const result = TimeUtils.getUTCValueFromHour('12:30')
      assert.strictEqual(result, moment.utc('12:30', 'HH:mm').valueOf())
    })
  })

  describe('formatHourToUTC', function () {
    it('should format an hour to HH:mm in UTC', function () {
      const result = TimeUtils.formatHourToUTC('12:30')
      assert.strictEqual(result, '12:30')
    })
  })

  describe('convertToISODate', function () {
    it('should convert a date from DD-MM-YYYY to ISO format', function () {
      const result = TimeUtils.convertToISODate('01-06-2024')
      assert.strictEqual(result, moment('2024-06-01').format('YYYY-MM-DD'))
    })
  })

  describe('getValueFromDateTime', function () {
    it('should get the value in milliseconds from an ISO date and hour', function () {
      const result = TimeUtils.getValueFromDateTime('2024-06-01', '12:30')
      assert.strictEqual(result, moment('2024-06-01 12:30').valueOf())
    })
  })

  describe('getHourFromDateTime', function () {
    it('should get the hour from an ISO date and hour', function () {
      const result = TimeUtils.getHourFromDateTime('2024-06-01', '12:30')
      assert.strictEqual(result, '12:30')
    })
  })
})
