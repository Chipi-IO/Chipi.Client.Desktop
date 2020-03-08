
import { app, remote, screen } from 'electron'
import Logger from '../../lib/logger'
import { isDev } from 'Environment'

const windowScreen = screen ? screen : remote ? remote.screen : null ;
const log = new Logger('toggleWindow');

let cachedXOffsetPercent, cachedYOffsetPercent

/**
 * Show or hide main window
 * @return {BrowserWindow} appWindow
 */
export default (appWindow) => {
  if (appWindow.isVisible()) {
    toggleOff(appWindow)
  } else {
    toggleOn(appWindow)
  }
}

/**
 * 
 * @param {*} appWindow The application window of the CHIPI client
 */
export const toggleOff = (appWindow) => {
  // Ignore toogle off call if the window cannot toogle off
  if (!appWindow) {
    return;
  }

  if (!appWindow.canToggleOff) {
    return;
  }

  updateWindowOffsets(appWindow);

  appWindow.blur() // once for blurring the content of the window(?)
  if (process.platform === 'darwin') {
    appWindow.blur(); // On Mac, twice somehow restores focus to prev foreground window
  }

  appWindow.hide()
  //app.dock.hide()

  appWindow.removeListener('blur', () => toggleOff(appWindow));
}

const toggleOn = (appWindow) => {
  const windowPosition = calculateWindowPosition(appWindow);
  appWindow.setPosition(windowPosition.x, windowPosition.y);

  showWindow(appWindow);

  if (!isDev()) {
    appWindow.on('blur', () => toggleOff(appWindow));
  }
}

export const showWindow = (appWindow) => {

  appWindow.setVisibleOnAllWorkspaces(true);
  appWindow.show();
  appWindow.focus();
  appWindow.setVisibleOnAllWorkspaces(false);

  if (isDev() && app.dock && !app.dock.isVisible()) {
    app.dock.show();
  }
}

const updateWindowOffsets = (appWindow) => {
  if (!appWindow.isVisible()) {
    return;
  }

  const windowPosition = appWindow.getPosition();
  const currentDisplay = windowScreen.getDisplayNearestPoint({ x: windowPosition[0], y: windowPosition[1] });
  const bounds = currentDisplay.bounds;

  cachedXOffsetPercent = (windowPosition[0] - bounds.x) / bounds.width;
  cachedYOffsetPercent = (windowPosition[1] - bounds.y) / bounds.width;
}

const calculateWindowPosition = (appWindow) => {
  // Get mouse cursor absolute position
  const { x, y } = windowScreen.getCursorScreenPoint();

  // Find the display where the mouse cursor will be

  const currentDisplay = windowScreen.getDisplayNearestPoint({ x, y });

  const bounds = currentDisplay.bounds;

  log.verbose('Bounds of the current display', { currentDisplay, bounds });

  let winX, winY;

  if (cachedXOffsetPercent && cachedYOffsetPercent) {
    winX = Math.ceil(cachedXOffsetPercent * bounds.width + bounds.x);
    winY = Math.ceil(cachedYOffsetPercent * bounds.width + bounds.y);
  }
  else {
    winX = bounds.x + Math.ceil((bounds.width - appWindow.getSize()[0]) / 2);
    winY = bounds.y + Math.ceil((bounds.height - appWindow.getSize()[1]) / 6);
  }

  return { x: winX, y: winY };
}
