var ROS = require("../lib/ros");
var async = require("async");

module.exports = function (ip, velocity, cb) {
  var ros = new ROS();
  ros.action(function (chan) {
    var item = "/queue/simple";
    var obj = {
      name: ip,
      target: ip,
      "max-limit": velocity+'/'+velocity
    };

    var waterfallArr = [
      function (callback) {
        ros.remove(chan, item, {name: ip}, callback);
      },
      function (chan, callback) {
        ros.add(chan, item, obj, callback);
      }
    ];

    async.waterfall(waterfallArr, function (err, c) {
      c.close();
      cb && cb();
    });
  });
};
