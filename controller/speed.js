var ROS = require("../lib/ros");
var async = require("async");

module.exports = function (ip, v_up, v_down, cb) {
  var ros = new ROS();
  ros.action(function (chan) {
    var item = "/queue/simple";
    var obj = {
      name: ip,
      target: ip,
      "max-limit": v_up + '/' + v_down
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
