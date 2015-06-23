var pair = require("../controller/pair");
pair("1.1.1.1", "2.2.2.2", function () {
  console.log("pair");

  var speed = require("../controller/speed");
  speed("1.1.1.1", "512k", function () {
    console.log("speed");
  });
});


