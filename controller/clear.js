var ROS = require("../lib/ros");
var async = require("async");

module.exports = function (serverIP, cb) {
  var ros = new ROS();
  ros.action(function (chan) {
    ros.remove(chan, "/ip/firewall/nat", {"to-addresses": serverIP}, cb);
  });
};