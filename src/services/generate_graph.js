import vega from 'vega'
import fs from 'fs'
import { registerFont } from 'canvas'

// Registering the Montserrat font for use in the visualizations
registerFont('./fonts/Montserrat-Regular.ttf', { family: 'Montserrat' })

// Loading the default template for the visualizations
const template = JSON.parse(fs.readFileSync('./models/template.json'))

/**
 * Generates a visualization based on a given filename and saves it as a PNG image.
 * @param {string} filename - The name of the JSON file containing the data for the visualization.
 */
function generate (filename) {
  // Reading the specific data for the visualization
  const rawdata = JSON.parse(fs.readFileSync(`./models/${filename}.json`))

  // Merging the default template with the specific data
  const merged = { ...template, ...rawdata }

  // Creating the Vega view for the visualization
  const view = new vega
    .View(vega.parse(merged))
    .renderer('none')
    .initialize()

  // Rendering the visualization to a canvas and then saving it as a PNG image
  view.toCanvas()
    .then(canvas => {
      const buffer = canvas.toBuffer('image/png')
      fs.writeFileSync(`../export/media/${filename}.png`, buffer)
    })
    .catch(err => {
      console.error(`Error generating visualization for ${filename}:`, err)
    })
}

export default { generate }
