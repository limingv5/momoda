var ROS = require("../lib/ros");
var async = require("async");

module.exports = function (serverIP, clientIP, cb) {
  var ros = new ROS();
  ros.action(function (chan) {
    var item = "/ip/firewall/nat";
    var obj = {
      chain: "dstnat",
      action: "dst-nat",
      protocol: "tcp",
      //log: "yes",
      "dst-address": "!42.156.153.0/24",
      "src-address": clientIP,
      "to-addresses": serverIP
    };

    var waterfallArr = [
      function (callback) {
        ros.remove(chan, item, {"src-address": obj["src-address"]}, callback);
      },
      function (chan, callback) {
        obj["dst-port"] = 80;
        obj["to-ports"] = 9080;
        ros.add(chan, item, obj, callback);
      },
      function (chan, callback) {
        obj["dst-port"] = 443;
        obj["to-ports"] = 9443;
        ros.add(chan, item, obj, callback);
      }
    ];

    async.waterfall(waterfallArr, function (err, c) {
      c.close();
      cb && cb();
    });
  });
};
