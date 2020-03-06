var path = require("path");

module.exports = function (content) {
  return (
    "const path = require('path');" +
    "const filePath = `${global.process.resourcesPath}/app.asar/dist/keytar.node`;" +
    "try { global.process.dlopen(module, filePath); } " +
    "catch(exception) { throw new Error('Cannot open ' + filePath + ': ' + exception); };"
  );
}


module.exports.raw = true;
