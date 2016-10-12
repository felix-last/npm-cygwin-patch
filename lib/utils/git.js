// handle some git configuration for windows

exports.spawn = spawnGit
exports.chainableExec = chainableExec
exports.whichAndExec = whichAndExec

var exec = require('child_process').execFile
var spawn = require('./spawn')
var npm = require('../npm.js')
var which = require('which')
var git = npm.config.get('git')
var assert = require('assert')
var log = require('npmlog')
var noProgressTillDone = require('./no-progress-while-running.js').tillDone

function prefixGitArgs () {
  return process.platform === 'win32' ? ['-c', 'core.longpaths=true'] : []
}

function execGit (args, options, cb) {
  log.info('git', args)
  var fullArgs = prefixGitArgs().concat(args || [])
  return exec(git, fullArgs, options, noProgressTillDone(cb))
}

function spawnGit (args, options) {
  log.info('git', args)
  return spawn(git, prefixGitArgs().concat(args || []), options)
}

function chainableExec () {
  var args = Array.prototype.slice.call(arguments)
  return [execGit].concat(args)
}

function whichAndExec (args, options, cb) {
  assert.equal(typeof cb, 'function', 'no callback provided')
  // check for git
  which(git, function (err) {
    if (err) {
      err.code = 'ENOGIT'
      return cb(err)
    }

    execGit(args, options, cb)
  })
}

// Patch Git for Cygwin
var cygwin = process.platform === 'win32' && (process.env.ORIGINAL_PATH || '').indexOf('/cygdrive/') != -1
_unpatchedExecGit = execGit;
execGit = function(args,options,cb) {
  if(cygwin && args) {
    for(var i=0; i<args.length; i++) {
      if(':\\'.indexOf(args[i]) != 1) {
        args[i] = args[i].replace(/\\/g, '/').replace(/^([A-Za-z])\:\//, '/cygdrive/$1/');
      }
    }
  }
  _unpatchedExecGit.apply(this, arguments);
}
