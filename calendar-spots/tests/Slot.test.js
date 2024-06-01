const moment = require('moment')
const assert = require('assert')
const Slot = require('../src/Slot')

const slot = { start: '12:00', end: '14:00' }
const dateISO = '2024-06-01'
const durationBefore = 10
const duration = 30
const durationAfter = 10

describe('Slot', function () {
  describe('generateMiniSlots', function () {
    it('should generate mini slots correctly', function () {
      const slotObj = new Slot(slot, dateISO, durationBefore, duration, durationAfter)
      const miniSlots = slotObj.generateMiniSlots()

      assert.strictEqual(miniSlots.length, 2)

      assert.strictEqual(miniSlots[0].startHour.valueOf(), moment.utc('2024-06-01T12:00:00.000Z').valueOf())
      assert.strictEqual(miniSlots[0].endHour.valueOf(), moment.utc('2024-06-01T12:50:00.000Z').valueOf())
      assert.strictEqual(miniSlots[0].clientStartHour.valueOf(), moment.utc('2024-06-01T12:10:00.000Z').valueOf())
      assert.strictEqual(miniSlots[0].clientEndHour.valueOf(), moment.utc('2024-06-01T12:40:00.000Z').valueOf())

      assert.strictEqual(miniSlots[1].startHour.valueOf(), moment.utc('2024-06-01T12:50:00.000Z').valueOf())
      assert.strictEqual(miniSlots[1].endHour.valueOf(), moment.utc('2024-06-01T13:40:00.000Z').valueOf())
      assert.strictEqual(miniSlots[1].clientStartHour.valueOf(), moment.utc('2024-06-01T13:00:00.000Z').valueOf())
      assert.strictEqual(miniSlots[1].clientEndHour.valueOf(), moment.utc('2024-06-01T13:30:00.000Z').valueOf())
    })
  })

  describe('getOneMiniSlot', function () {
    it('should return a mini slot correctly', function () {
      const slotObj = new Slot(slot, dateISO, durationBefore, duration, durationAfter)
      const miniSlot = slotObj.getOneMiniSlot(slot.start)

      assert.strictEqual(miniSlot.startHour.valueOf(), moment.utc('2024-06-01T12:00:00.000Z').valueOf())
      assert.strictEqual(miniSlot.endHour.valueOf(), moment.utc('2024-06-01T12:50:00.000Z').valueOf())
      assert.strictEqual(miniSlot.clientStartHour.valueOf(), moment.utc('2024-06-01T12:10:00.000Z').valueOf())
      assert.strictEqual(miniSlot.clientEndHour.valueOf(), moment.utc('2024-06-01T12:40:00.000Z').valueOf())
    })

    it('should return null if the end hour is greater than the end slot', function () {
      const slot = { start: '12:00', end: '13:00' }
      const duration = 50

      const slotObj = new Slot(slot, dateISO, durationBefore, duration, durationAfter)
      const miniSlot = slotObj.getOneMiniSlot(slot.start)

      assert.strictEqual(miniSlot, null)
    })
  })

  describe('calculateEndHour', function () {
    it('should calculate the end hour correctly', function () {
      const slotObj = new Slot(slot, dateISO, durationBefore, duration, durationAfter)
      const endHour = slotObj.calculateEndHour(slot.start)

      assert.strictEqual(endHour, '12:50')
    })
  })

  describe('calculateClientHour', function () {
    it('should calculate the client hour correctly', function () {
      const slotObj = new Slot(slot, dateISO, durationBefore, duration, durationAfter)
      const clientHour = slotObj.calculateClientHour(moment(`2024-06-01 ${slot.start}`), 10)

      assert.strictEqual(clientHour, '12:10')
    })
  })
})
