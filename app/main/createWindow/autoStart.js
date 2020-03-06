// NOT CURRENTLY IN USE
import { app } from 'electron'
import AutoLaunch from 'auto-launch'

let appLauncher

const isLinux = ['win32', 'darwin'].indexOf(process.platform) === -1

if (isLinux) {
  appLauncher = new AutoLaunch({ name: 'Chipi' })
}

const isEnabled = () => (
  isLinux
    ? appLauncher.isEnabled()
    : app.getLoginItemSettings().openAtLogin
)

const set = (openAtLogin) => {
  if (isLinux) {
    return openAtLogin ? appLauncher.enable() : appLauncher.disable()
  }
  return app.setLoginItemSettings({ openAtLogin: openAtLogin ? true : false })
}

export default { isEnabled, set }
