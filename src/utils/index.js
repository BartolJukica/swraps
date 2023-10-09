import moment from 'moment'
import 'moment-duration-format'

/**
 * Calculates the sum of an array of numbers.
 * @param {number[]} array - Array of numbers to be summed.
 * @returns {number} Sum of the numbers in the array.
 */
function sum (array) {
  return array.reduce((x, y) => x + y, 0)
}

/**
 * Truncates a string to a specified length and adds an ellipsis if truncated.
 * @param {string} str - The string to truncate.
 * @param {number} num - The maximum length of the truncated string.
 * @returns {string} Truncated string.
 */
function truncateString (str, num) {
  return str.length <= num ? str : str.slice(0, num) + '...'
}

/**
 * Converts milliseconds to hours using moment's duration format.
 * @param {number} ms - Time in milliseconds.
 * @returns {string} Formatted time in hours.
 */
function msToHours (ms) {
  return moment.duration(ms).format('h', 2)
}

/**
 * Converts an array of hourly data into parts of the day and formats it.
 * @param {number[]} array - Array of hours.
 * @param {number} i - Day of the week index (1: Monday, 7: Sunday).
 * @returns {Object[]} Array of objects containing x (day name), y (hours), and c (part of day index).
 */
function partOfDay (array, i) {
  // Define time ranges for different parts of the day
  const partsOfDayIndices = [
    [].concat(array.slice(0, 6), array.slice(22, 24)), // Night
    array.slice(6, 13), // Morning
    array.slice(13, 18), // Afternoon
    array.slice(18, 22) // Evening
  ]

  // Calculate and format the total hours for each part of the day
  const formattedHours = partsOfDayIndices.map(part => moment.duration(sum(part)).format('h', 2))

  // Return the formatted data
  return formattedHours.map((hours, index) => ({
    x: moment().isoWeekday(i).format('dddd'),
    y: hours,
    c: index
  }))
}

export { sum, truncateString, msToHours, partOfDay }
