import mdfind from './mdfind'
import Logger from '../../../../lib/logger'

const logger = new Logger('plugins.mac-apps.getAppsList')
/**
 * List of supported files
 * @type {Array}
 */
const supportedTypes = [
  'Application',
  //'com.apple.application',
  'com.apple.systempreference.prefpane'

]

/**
 * Build mdfind query
 *
 * @return {String}
 */
const buildQuery = () => (
  supportedTypes.map(type => `kMDItemKind==${type}`).join('||')
)

/**
 * Function to terminate previous query
 *
 * @return {Function}
 */
let cancelPrevious = () => {}

/**
 * Get list of all installed applications
 * @return {Promise<Array>}
 */
export default () => {
  cancelPrevious()
  logger.verbose('Loading application list');
  return new Promise(resolve => {
    const { output, terminate } = mdfind({
      query: buildQuery(),
      directories: ['/Applications/']
    })
    cancelPrevious = terminate
    const result = []
    output.on('data', (file) => result.push(file))
    output.on('end', () => resolve(result))
  })
}
