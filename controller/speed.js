var ROS = require("../lib/ros");
var async = require("async");

module.exports = function (ip, v, cb) {
  var ros = new ROS();
  ros.action(function (chan) {
    var item = "/queue/simple";
    var obj = {
      name: ip,
      target: ip,
      "max-limit": (v.up || v.down) + '/' + (v.down || v.up)
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
