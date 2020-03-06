// List of available currencies
const { CURRENCIES } = require('./constants.js')

/**
 * Build url to get exchange rates
 * @return {String} url
 */
module.exports = (baseCurrency) => {
  return `http://www.floatrates.com/daily/${baseCurrency}.json`
}
