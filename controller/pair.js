var ROS = require("mikronode");
var async = require("async");
var net = require("net");

exports = module.exports = function (req, param, cb) {
  var serverIP = req.serverIP;
  var clientIP = req.clientIP;
  var queryCIP = req.body.clientIP;

  if (["localhost", "127.0.0.1", clientIP].indexOf(serverIP) != -1) {
    if (queryCIP && net.isIP(queryCIP) && ["localhost", "127.0.0.1"].indexOf(queryCIP) == -1) {
      clientIP = queryCIP;
    }
    else {
      cb(true);
      return;
    }
  }

  var addressList = [], host2ip = param.hosts;
  for (var k in host2ip) {
    if (addressList.indexOf(host2ip[k]) == -1) {
      addressList.push(host2ip[k]);
    }
  }

  var connection = new ROS(param.ip, param.username, param.password, {timeout: 6});
  connection.closeOnDone(true);
  connection.on("error", function () {
    connection.close(true);
    cb(true);
  });
  connection.connect(function (conn) {
    var chan = this.openChannel();
    chan.closeOnDone(true);

    function removeFirewallItem(item, results, cc, callback) {
      var parsed = ROS.parseItems(results);
      var ids = parsed.map(function (i) {
        return i['.id'];
      });
      cc.write(["/ip/firewall/" + item + "/remove", "=.id=" + ids.join(',')], function (c) {
        callback(null, c);
      });
    }

    var waterfallArr = [
      function (callback) {
        chan.write(["/ip/firewall/nat/print", "?src-address=" + clientIP], function (c) {
          c.once("done", function (results, cc) {
            removeFirewallItem("nat", results, cc, callback);
          });
        });
      },
      function (channel, callback) {
        channel.write(["/ip/firewall/address-list/print", "?list=" + serverIP], function (c) {
          c.once("done", function (results, cc) {
            removeFirewallItem("address-list", results, cc, callback);
          });
        });
      }
    ];

    addressList.forEach(function (i) {
      waterfallArr.push(
        function (channel, callback) {
          channel.write(["/ip/firewall/address-list/add", "=list=" + serverIP, "=address=" + i], function (c) {
            callback(null, c);
          });
        }
      );
    });

    async.waterfall(waterfallArr, function (err, channel) {
      channel.write(["/ip/firewall/nat/add", "=chain=dstnat", "=action=dst-nat", "=protocol=tcp",
        "=src-address=" + clientIP, "=to-addresses=" + serverIP, "=dst-address-list=" + serverIP
      ], function () {
        chan.close();
        conn.close();
        cb(null, {});
      });
    });
  });
};
