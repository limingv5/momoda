var Mikronode = require("mikronode");

function ROS(ip, username, password) {
  if (ip && username) {
    this.config(ip, username, password);
  }

  this.connection = new Mikronode(this.ip, this.username, this.password, {timeout: 6});
  this.connection.closeOnDone(true);
  this.connection.on("error", function () {
    this.connection.close(true);
  }.bind(this));
}

ROS.prototype = {
  constructor: ROS,
  ip: "192.168.88.1",
  username: "admin",
  password: '',
  config: function (ip, username, password) {
    ROS.prototype.ip = ip;
    ROS.prototype.username = username;
    ROS.prototype.password = password || '';
  },
  action: function (funcbody) {
    if (this.connection) {
      if (this.connection.connected()) {
        var chan = this.connection.getChannel(1);
        chan.closeOnDone(true);
        funcbody(chan);
      }
      else {
        this.connection.connect(function (conn) {
          var chan = this.openChannel();
          chan.closeOnDone(true);
          conn.closeOnDone(true);
          funcbody(chan);
        });
      }
    }
  },
  parse: Mikronode.parseItems,
  print: function (chan, item, condition, callback) {
    item = item.replace(/\/{1,}$/, '');
    var cmd = [item + "/print"];
    for (var k in condition) {
      if (k == '#') {
        cmd.push("?#" + condition[k]);
      }
      else {
        cmd.push('?' + k + '=' + condition[k]);
      }
    }
    var self = this;
    chan.write(cmd, function (c) {
      c.once("done", function (results, cc) {
        callback(self.parse(results), cc);
      });
    });
  },
  add: function (chan, item, config, callback) {
    item = item.replace(/\/{1,}$/, '');
    var cmd = [item + "/add"];
    for (var k in config) {
      cmd.push('=' + k + '=' + config[k]);
    }
    chan.write(cmd, function (c) {
      callback(null, c);
    });
  },
  remove: function (chan, item, condition, callback) {
    this.print(chan, item, condition, function (parsed, cc) {
      var ids = parsed.map(function (i) {
        return i['.id'];
      });

      cc.write([item + "/remove", "=.id=" + ids.join(',')], function (c) {
        callback(null, c);
      });
    });
  }
};

module.exports = ROS;
