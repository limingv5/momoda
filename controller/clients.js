var ROS = require("../lib/ros");
var async = require("async");

module.exports = function (serverIP, cb) {
  var ros = new ROS();
  ros.action(function (chan) {
    ros.print(chan, "/ip/firewall/nat", {"to-addresses": serverIP}, cb);
  });
};
