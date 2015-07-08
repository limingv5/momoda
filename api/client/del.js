var ROS = require("mikronode");

module.exports = function (req, param, cb) {
  if (req.body.id && req.body.id.length) {
    var connection = new ROS(param.ip, param.username, param.password, {timeout: 6});
    connection.closeOnDone(true);
    connection.on("error", function () {
      connection.close(true);
      cb(true);
    });
    connection.connect(function (conn) {
      var chan = this.openChannel();
      chan.closeOnDone(true);

      chan.write(["/ip/firewall/nat/remove", "=.id=" + req.body.id.join(',')], function () {
        cb(null, {status: true});

        chan.close();
        conn.close();
      });
    });
  }
  else {
    cb(true);
  }
};
