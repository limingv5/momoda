var ROS = require("mikronode");

exports = module.exports = function (req, param, cb) {
  var serverIP = req.serverIP;
  var data = {
    title: "魔默达",
    hosts: param.hosts,
    serverIP: serverIP
  };

  var connection = new ROS(param.ip, param.username, param.password, {timeout: 6});
  connection.closeOnDone(true);
  connection.on("error", function () {
    connection.close(true);
    cb(null, data);
  });
  connection.connect(function (conn) {
    var chan = this.openChannel();
    chan.closeOnDone(true);

    var addressList = [], host2ip = param.hosts;
    for (var k in host2ip) {
      if (addressList.indexOf(host2ip[k]) == -1) {
        addressList.push(host2ip[k]);
      }
    }
    data.addressList = addressList;

    var Url = "http://" + req.serverIP + "/~ui/pair";
    var qr = require("qrcode-npm").qrcode(4, 'M');
    qr.addData(Url);
    qr.make();
    data.qr = qr.createImgTag(4);
    data.routerIP = param.ip;

    chan.write(["/ip/firewall/nat/print", "?to-addresses=" + serverIP], function (c) {
      c.once("done", function (results) {
        var parsed = ROS.parseItems(results);

        data.clientList = parsed.map(function (i) {
          return {
            src: i['src-address'],
            id: i['.id']
          };
        });

        cb(null, data);

        chan.close();
        conn.close();
      });
    });
  });
};
