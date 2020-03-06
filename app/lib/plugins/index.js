import { app, remote } from 'electron'
import path from 'path'
import fs from 'fs'
import npm from './npm'

const ensureFile = (src, content = '') => {
  if (!fs.existsSync(src)) {
    fs.writeFileSync(src, content)
  }
}

const ensureDir = (src) => {
  if (!fs.existsSync(src)) {
    try{
      fs.mkdirSync(src)
    }
    catch(err) {}
  }
}

const EMPTY_PACKAGE_JSON = JSON.stringify({
  name: 'chipi-plugins',
  dependencies: {}
}, null, 2)

const electronApp = remote ? remote.app : app
export const pluginsPath = path.join(electronApp.getPath('userData'), 'plugins')
export const modulesDirectory = path.join(pluginsPath, 'node_modules')
export const packageJsonPath = path.join(pluginsPath, 'package.json')

export const ensureFiles = () => {
  ensureDir(pluginsPath)
  ensureDir(modulesDirectory)
  ensureFile(packageJsonPath, EMPTY_PACKAGE_JSON)
}

export const client = npm(pluginsPath)
export { default as settings } from './settings'