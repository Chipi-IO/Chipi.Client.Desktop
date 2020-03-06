import { app, remote, ipcRenderer } from "electron";
import fs from "fs";
import { memoize } from "cerebro-tools";
import loadThemes from "./loadThemes";
import { isDev } from "Environment";

const electronApp = remote ? remote.app : app;

// initiate portable mode
// set data directory to ./userdata
process.argv.forEach(arg => {
  if (arg.toLowerCase() === "-p" || arg.toLowerCase() === "--portable") {
    electronApp.setPath("userData", `${process.cwd()}/userdata`);
  }
});

const CONFIG_FILE = `${electronApp.getPath("userData")}/config${isDev() ? "-dev" : ""}.json`;

const defaultSettings = memoize(() => {
  const locale = electronApp.getLocale() || "en-US";
  const [lang, country] = locale.split("-");
  return {
    locale,
    lang,
    country,
    // use first theme from loadThemes by default
    theme: loadThemes()[0].value,
    hotkey: "Control+Space",
    onboardingFinished: false,
    showInTray: true,
    firstStart: true,
    developerMode: false,
    cleanOnHide: false,
    plugins: {},
    isMigratedPlugins: false,
    trackingEnabled: false,
    crashReportingEnabled: true,
    openAtLogin: true,
    testingFeature: false,
    logLevel: "info"
  };
});

const readConfig = () => {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE).toString());
  } catch (err) {
    return defaultSettings();
  }
};

/**
 * Get a value from global configuration
 * @param  {String} key
 * @return {Any}
 */
const get = key => {
  let config;
  if (!fs.existsSync(CONFIG_FILE)) {
    // Save default config to local storage
    config = defaultSettings();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } else {
    config = readConfig();
  }
  return config[key];
};

/**
 * Write a value to global config. It immedately rewrites global config
 * and notifies all listeners about changes
 *
 * @param  {String} key
 * @param  {Any} value
 */
const set = (key, value) => {
  const config = {
    // If after app update some keys were added to config
    // we use default values for that keys
    ...defaultSettings(),
    ...readConfig()
  };
  config[key] = value;
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  // Track settings changes
  /*trackEvent({
    category: 'Settings',
    event: `Change ${key}`,
    label: value
  })*/
  if (ipcRenderer) {
    console.log("notify main process", key, value);
    // Notify main process about settings changes
    ipcRenderer.send("updateSettings", key, value);
  }
};

/**
 * Remove saved config file from userdata, especially for development environment
 */
const remove = () => {
  if (fs.existsSync(CONFIG_FILE)) {
    fs.unlinkSync(CONFIG_FILE);
  }
};

export default { get, set, remove };
