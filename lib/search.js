'use strict'

module.exports = exports = search

var npm = require('./npm.js')
var allPackageMetadata = require('./search/all-package-metadata.js')
var packageFilter = require('./search/package-filter.js')
var streamFilter = require('./search/stream-filter.js')
var formatPackageStream = require('./search/format-package-stream.js')
var usage = require('./utils/usage')
var output = require('./utils/output.js')
var log = require('npmlog')
var ms = require('mississippi')

search.usage = usage(
  'search',
  'npm search [--long] [search terms ...]'
)

search.completion = function (opts, cb) {
  cb(null, [])
}

function search (args, silent, staleness, cb) {
  if (typeof cb !== 'function') {
    cb = staleness
    staleness = 15 * 60
  }
  if (typeof cb !== 'function') {
    cb = silent
    silent = false
  }

  var searchopts = npm.config.get('searchopts')
  var searchexclude = npm.config.get('searchexclude')
  if (npm.config.get('searchsort', 'cli')) {
    log.warn('search', 'Search result sorting not currently supported')
  }

  if (typeof searchopts !== 'string') searchopts = ''
  searchopts = searchopts.split(/\s+/)
  var opts = searchopts.concat(args).map(function (s) {
    return s.toLowerCase()
  }).filter(function (s) { return s })

  if (opts.length === 0) {
    return cb(new Error('search must be called with arguments'))
  }

  if (typeof searchexclude === 'string') {
    searchexclude = searchexclude.split(/\s+/)
  } else {
    searchexclude = []
  }
  searchexclude = searchexclude.map(function (s) {
    return s.toLowerCase()
  })

  var outputType = npm.config.get('json')
  ? 'json'
  : npm.config.get('tab-separated')
  ? 'tab-separated'
  : 'columns'

  // Used later to figure out whether we had any packages go out
  var anyOutput = false

  // Get a stream with *all* the packages. This takes care of dealing
  // with the local cache as well, but that's an internal detail.
  var allEntriesStream = allPackageMetadata(staleness)

  // Grab a stream that filters those packages according to given params.
  var searchSection = (npm.config.get('unicode') ? '🤔 ' : '') + 'search'
  var filterStream = streamFilter(function (pkg) {
    log.gauge.pulse('search')
    log.gauge.show({section: searchSection, logline: 'scanning ' + pkg.name})
    // Simply 'true' if the package matches search parameters.
    var match = packageFilter(pkg, opts, searchexclude)
    if (!match) { anyOutput = true }
    return match
  })

  // Grab a configured output stream that will spit out packages in the
  // desired format.
  var outputStream = formatPackageStream({
    long: npm.config.get('long'),
    description: npm.config.get('description'),
    type: outputType,
    color: npm.color
  })
  outputStream.on('data', function (chunk) {
    output(chunk.toString('utf8'))
  })

  log.silly('search', 'searching packages')
  ms.pipe(allEntriesStream, filterStream, outputStream, function (er) {
    if (er) return cb(er)
    if (!anyOutput && outputType === 'columns') {
      output('No matches found for ' + (args.map(JSON.stringify).join(' ')))
    }
    log.silly('search', 'index search completed')
    log.clearProgress()
    cb(null, {})
  })
}
