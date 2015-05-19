var url = require("url");
var fs = require("fs");
var juicer = require("juicer");

var header = readFile("mods/header.html");
var footer = readFile("mods/footer.html");
var notfound = readFile("mods/404.html");

function readFile(p) {
  p = __dirname + "/view/" + p;
  return fs.existsSync(p) ? fs.readFileSync(p).toString() : notfound;
}

exports = module.exports = function (param) {
  return function (req, res, next) {
    var renderList = [header, footer];
    var _url = url.parse(req.url).pathname;

    if (/^\/~\/?$|^\/~ui\/?$/.test(_url)) {
      _url = "/~ui/index";
    }

    var types = ["ui", "css", "js", "api"];
    var regx = types.map(function (type) {
      return "^\/~(" + type + ")\/(.+)";
    }).join('|');
    var matched = _url.match(new RegExp(regx));
    if (matched) {
      matched = matched.filter(function (i) {
        return i;
      });
      matched.shift();

      switch (matched[0]) {
        case "api":
          res.writeHead(200, {
            "Content-Type": "application/json"
          });
          try {
            require(__dirname + "/api/" + matched[1])(req, param, function (e, data) {
              if (e) {
                res.end(JSON.stringify({
                  status: false,
                  msg: e
                }));
              }
              else {
                res.end(JSON.stringify(data));
              }
            });
          }
          catch (e) {
            res.end(JSON.stringify({
              status: false,
              msg: e
            }));
          }
          break;
        case "ui":
          res.writeHead(200, {
            "Content-Type": "text/html"
          });
          try {
            require(__dirname + "/controller/" + matched[1])(req, param, function (e, data) {
              if (e) {
                renderList.splice(renderList.length - 1, 0, readFile("mods/500.html"));
                res.end(renderList.join(''));
              }
              else {
                renderList.splice(renderList.length - 1, 0, readFile(matched[1] + ".html"));
                res.end(juicer(renderList.join(''), data));
              }
            });
          }
          catch (e) {
            renderList.splice(renderList.length - 1, 0, readFile("mods/404.html"));
            res.end(renderList.join(''));
          }
          break;
        case "css":
          res.writeHead(200, {
            "Content-Type": "text/css"
          });
          res.end(readFile(_url.replace(/^\/~/, '')));
          break;
        case "js":
          res.writeHead(200, {
            "Content-Type": "application/javascript"
          });
          res.end(readFile(_url.replace(/^\/~/, '')));
          break;
        default: next();
      }
    }
    else {
      next();
    }
  }
};
