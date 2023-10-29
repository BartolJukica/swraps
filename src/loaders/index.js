import fs from 'fs'
import path from 'path'
import moment from 'moment'
import logger from '../utils/logger.js'
import canvas from '../canvas.js'
import {
  topArtistsByHours,
  topHoursStreamed,
  topMonthsStreamed,
  topHoursStreamedByDay,
  topHoursStreamedMonthly
} from '../services/generate_data.js'
import graph from '../services/generate_graph.js'

const dataYear = parseInt(process.argv[2]) || new Date().getFullYear()

async function combineJSONFiles (directory) {
  // Read the directory for files with the naming pattern
  const files = await fs.promises.readdir(directory)
  const jsonFiles = files.filter(file => /StreamingHistory\d+\.json/.test(file))

  let combinedData = []

  // Read each file and parse the JSON content
  for (const file of jsonFiles) {
    const content = await fs.promises.readFile(path.join(directory, file), 'utf-8')
    const parsedData = JSON.parse(content)
    combinedData = combinedData.concat(parsedData)
  }

  return combinedData
}

/**
 * Creates and writes a JSON file with the provided data.
 * @param {Array} data - Data to be written to the JSON file.
 * @param {string} filename - Name of the JSON file.
 * @param {number} [limit] - Optional limit to restrict the number of data items written to the file.
 */
function createJSON (data, filename, limit) {
  const jsonData = limit ? data.slice(0, limit) : data
  fs.writeFileSync(`./api/${filename}.json`, JSON.stringify(jsonData, null, 2))
  logger.debug(`${filename}.json successfully created. | ${data.length} items.`)
}

/**
 * Initializes the process of generating and saving various types of data and graphs.
 */
async function init () {
  let data = []
  data = await combineJSONFiles('./api/spotify/')
  data = Object.values(data).filter(item => moment(item.endTime).year() === dataYear)

  if (data.length <= 0) return logger.error('Data object is empty.')

  const datasets = [
    { method: topArtistsByHours, filename: 'top_artists', limit: 20 },
    { method: topHoursStreamed, filename: 'top_hours' },
    { method: topMonthsStreamed, filename: 'top_months' },
    { method: topHoursStreamedByDay, filename: 'top_hours_daily' },
    { method: topHoursStreamedMonthly, filename: 'top_weeks' }
  ]

  // Create JSON files and generate graphs for each dataset
  for (const dataset of datasets) {
    createJSON(dataset.method(data), dataset.filename, dataset.limit)
    graph.generate(dataset.filename)
  }

  // Initialize the canvas after a delay to ensure all data is processed
  setTimeout(() => {
    canvas.init()
  }, 3000)
}

export default { init }
