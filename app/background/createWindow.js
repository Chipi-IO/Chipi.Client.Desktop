import { BrowserWindow } from 'electron'

export default ({ src }) => {
  const backgroundWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      plugins: true,
      nodeIntegration: true
    }
  })
  backgroundWindow.loadURL(src)
  return backgroundWindow
}
