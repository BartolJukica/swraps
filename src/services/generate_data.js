import moment from 'moment'
import { partOfDay, msToHours, truncateString, getArtistName, getEndTime, getMillisecondsPlayed } from '../utils/index.js'

/**
 * Updates an array by adding new items or updating existing items based on their 'id'.
 * @param {Array} array - Input array containing objects with 'id' and 'ms' properties.
 * @returns {Array} Updated array.
 */
function addOrUpdate (array) {
  const result = []

  for (const item of array) {
    const { id, ms } = item

    const existingItem = result.find(e => e.id === id)
    if (existingItem) {
      existingItem.ms += ms
      existingItem.hrs = msToHours(existingItem.ms)
    } else {
      result.push(item)
    }
  }

  return result
}

/**
 * Generates a sorted list of top artists by hours streamed.
 * @param {Array} data - Input data.
 * @returns {Array} Sorted list of artists.
 */
function topArtistsByHours (data) {
  const input = data.map(item => ({
    id: truncateString(getArtistName(item), 17),
    ms: getMillisecondsPlayed(item)
  }))

  const filtered = addOrUpdate(input)
  filtered.sort((a, b) => b.ms - a.ms)

  return filtered
}

/**
 * Aggregates the total hours streamed by hour of the day.
 * @param {Array} data - Input data.
 * @param {number} day - Day of the week (optional).
 * @returns {Array} Aggregated hours streamed by hour.
 */
function topHoursStreamed (data, day) {
  const modifiedData = day ? data.filter(item => moment(getEndTime(item)).isoWeekday() === day) : data

  const input = modifiedData.map(item => ({
    id: moment(getEndTime(item)).hour(),
    ms: getMillisecondsPlayed(item)
  }))

  // Add missing hours with zero streaming time
  for (let i = 0; i < 24; i++) {
    if (!input.some(item => item.id === i)) {
      input.push({ id: i, ms: 0, hrs: 0 })
    }
  }

  const filtered = addOrUpdate(input)
  filtered.sort((a, b) => a.id - b.id)

  return filtered
}

/**
 * Aggregates hours streamed by each part of the day.
 * @param {Array} data - Input data.
 * @returns {Array} Aggregated data by part of the day.
 */
function topHoursStreamedByDay (data) {
  const processedData = Array(7).fill(0).map((_, index) =>
    partOfDay(topHoursStreamed(data, index + 1).map(item => item.ms), index + 1)
  )

  return [].concat(...processedData)
}

/**
 * Aggregates hours streamed by month.
 * @param {Array} data - Input data.
 * @returns {Array} Aggregated hours streamed by month.
 */
function topMonthsStreamed (data) {
  const input = data.map(item => ({
    id: moment(getEndTime(item)).month(),
    ms: getMillisecondsPlayed(item)
  }))

  const filtered = addOrUpdate(input)
  filtered.sort((a, b) => a.id - b.id)

  // Convert month numbers to month names
  filtered.forEach(item => {
    item.id = moment().month(item.id).format('MMM')
  })

  return filtered
}

/**
 * Generates aggregated data for top artists' streaming hours by month.
 * @param {Array} data - Input data.
 * @returns {Array} Aggregated data for top artists by month.
 */
function topHoursStreamedMonthly (data) {
  const input = topArtistsByHours(data).slice(0, 10)
  const processedData = input.map(item => topHoursStreamedWeekly(data, item.id))

  const filtered = [].concat(...processedData).sort((a, b) => a.id - b.id)
  return filtered.map((item, index) => ({
    x: item.id,
    y: msToHours(item.ms),
    a: item.a,
    c: input.findIndex(e => e.id === item.a)
  }))
}

/**
 * Aggregates weekly streaming hours for a given artist.
 * @param {Array} data - Input data.
 * @param {string} artist - Artist name.
 * @returns {Array} Aggregated weekly streaming hours for the artist.
 */
function topHoursStreamedWeekly (data, artist) {
  const modifiedData = data.filter(item => getArtistName(item) === artist)

  const input = modifiedData.map(item => ({
    id: moment(getEndTime(item)).isoWeek(),
    a: getArtistName(item),
    ms: getMillisecondsPlayed(item)
  }))

  input.sort((a, b) => a.id - b.id)

  // Add missing weeks with zero streaming time
  for (let i = 1; i < 54; i++) {
    if (!input.some(item => item.id === i)) {
      input.push({ id: i, a: artist, ms: 0, hrs: 0 })
    }
  }

  input.sort((a, b) => a.id - b.id)
  const filtered = addOrUpdate(input)

  // Calculate cumulative streaming time
  filtered.map((item, index) => {
    const prev = index > 0 ? filtered[index - 1].ms : 0
    const curr = item.ms

    item.ms = prev + curr
    item.hrs = msToHours(item.ms)

    return item
  })

  return filtered
}

export { topArtistsByHours, topHoursStreamed, topMonthsStreamed, topHoursStreamedByDay, topHoursStreamedMonthly }
