var ms = require('mississippi')

module.exports = function (filter) {
  return ms.through.obj(function (chunk, enc, cb) {
    if (filter(chunk)) {
      this.push(chunk)
    }
    cb()
  })
}
