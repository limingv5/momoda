var ROS = require("../lib/ros");
var async = require("async");

module.exports = function (serverIP, cb) {
  var ros = new ROS();
  ros.action(function (chan) {
    var waterfallArr = [
      function (callback) {
        ros.remove(chan, "/ip/firewall/nat", {"to-addresses": serverIP}, callback);
      },
      function (chan, callback) {
        ros.remove(chan, "/queue/simple", {target: serverIP + "/32"}, callback);
      }
    ];

    async.waterfall(waterfallArr, function (err, c) {
      c.close();
      cb && cb();
    });
  });
};
