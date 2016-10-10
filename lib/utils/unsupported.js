'use strict'
exports.checkForBrokenNode = function () {
  // known broken: 0.1 - 0.7 (technically it unbroke somewhere in 0.7, but I'm
  // not looking that up)
  if (/^v0[.][1234567][.]/.test(process.version)) {
    console.error('ERROR: npm is known not to run on Node.js ' + process.version)
    console.error("You'll need to upgrade to a newer version in order to use this")
    console.error('version of npm. You can find the latest version at https://nodejs.org/')
    process.exit(1)
  }
}

exports.checkForUnsupportedNode = function () {
  // unsupported: 0.8, 0.9, 0.11, 1.x, 2.x, 3.x, 5.x
  if (/^v(0[.](8|9|11)[.]|[1235][.])/.test(process.version)) {
    var log = require('npmlog')
    log.warn('npm', 'npm does not support Node.js ' + process.version)
    log.warn('npm', "You should probably upgrade to a newer version of node as we")
    log.warn('npm', "can't make any promises that npm will work with this version.")
    log.warn('npm', 'You can find the latest version at https://nodejs.org/')
  }
}
