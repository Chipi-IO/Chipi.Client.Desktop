import {Menu, app, BrowserWindow, MenuItem} from 'electron'

export default (mainWindow) => {
  const template = [{
    label: 'Chipi',
    submenu: [
      { label: 'About Chipi', selector: 'orderFrontStandardAboutPanel:' },
      { type: 'separator' },
      { label: 'Hide Chipi', accelerator: 'Command+H', selector: 'hide:' },
      { label: 'Hide Others', accelerator: 'Command+Shift+H', selector: 'hideOtherApplications:' },
      { label: 'Show All', selector: 'unhideAllApplications:' },
      { type: 'separator'},
      { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:'},
      { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:'},
      { type: 'separator'},
      { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:'},
      { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:'},
      { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:'},
      { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:'},
      { type: 'separator'},
      { label: 'Quit', accelerator: 'Command+Q', click() { mainWindow.setClosable(true); app.quit() } }
    ]
  }]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
