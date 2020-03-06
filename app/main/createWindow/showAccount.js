import { ipcRenderer } from 'electron'
/**
 * Show account management window
 *
 */

export default () => {
  if (ipcRenderer) {
    console.log('notify show account')
    // Notify main process about show account window
    ipcRenderer.send('showAccount')
  }

}
