import logger from './utils/logger.js'
import { registerFont, createCanvas, loadImage } from 'canvas'
import fs from 'fs'

// Register fonts
registerFont('./fonts/Montserrat-Regular.ttf', { family: 'Montserrat', weight: 'Regular' })
registerFont('./fonts/Montserrat-Bold.ttf', { family: 'Montserrat', weight: 'Bold' })

// Canvas setup
const canvas = createCanvas(1500, 1825)
const ctx = canvas.getContext('2d')
const { height, width } = canvas
const lineHeight = 25

const dataYear = parseInt(process.argv[2]) || new Date().getFullYear()

/**
 * Generates a random string of a given length.
 * @param {number} length - The length of the random string to be generated.
 * @returns {string} Randomly generated string.
 */
function makeid (length) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }

  return result
}

/**
 * Loads an image from a given URL.
 * @param {string} url - The URL of the image to be loaded.
 * @returns {Promise} Promise that resolves with the loaded image.
 */
function getImageURL (url) {
  return loadImage(`../export/media/${url}`)
}

/**
 * Initializes the infographic generation process.
 */
function init (dataTimeFrame) {
  // Set background color
  ctx.fillStyle = '#191414'
  ctx.fillRect(0, 0, width, height)

  // Add header texts
  ctx.font = '50px Montserrat'
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`Your Streaming History`, width / 2, 87.5 - 17.5)
  ctx.font = '25px Montserrat'
  ctx.fillText(`${dataTimeFrame.start} to ${dataTimeFrame.end}`, width / 2, 87.5 + lineHeight)
  ctx.fillText(`Created with Swraps`, width / 2, 87.5 - lineHeight * 2)

  // Add footer texts
  ctx.fillStyle = '#535353'
  ctx.fillText('This is not affiliated with Spotify AB or any of its partners in any way.', width / 2, 1737.5 - lineHeight)
  ctx.font = '20px Montserrat'
  ctx.fillStyle = '#fff'
  ctx.fillText('github.com/BartolJukica/Swraps', width / 2, 1737.5 + lineHeight)

  // Load images and draw them on the canvas
  const imageFilenames = ['top_artists.png', 'top_months.png', 'top_hours.png', 'top_hours_daily.png', 'top_weeks.png']

  Promise.all(imageFilenames.map(getImageURL))
    .then(images => {
      ctx.drawImage(images[0], 25, 175, 712.5, 350)
      ctx.drawImage(images[1], 762.5, 175, 712.5, 350)
      ctx.drawImage(images[2], 25, 550, 712.5, 350)
      ctx.drawImage(images[3], 762.5, 550, 712.5, 350)
      ctx.drawImage(images[4], 25, 925, 1450, 725)
    })
    .then(() => {
      const buffer = canvas.toBuffer('image/png')
      const filename = `${makeid(8)}.png`
      fs.writeFileSync(`../export/${filename}`, buffer)
      logger.info(`${filename} successfully created.`)
    })
}

export default { init }
