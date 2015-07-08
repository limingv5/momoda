var fs = require("fs");
var path = require("path");

var exports = module.exports;
var dir = fs.readdirSync(__dirname + "/controller");
dir.forEach(function (i) {
  var name = path.basename(i, ".js");
  exports[name] = require("./controller/" + name);
});