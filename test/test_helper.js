var fs = require("fs");
var path = require('path');
var fixture_path = "test/fixtures/";

var FixtureHelper = {
  loadJSON: function(filepath, callback) {
    fs.readFile(path.resolve(process.cwd(), fixture_path + filepath + ".json"), function (err, data) {
      if (err) throw err;
      callback(JSON.parse(data));
    });
  },
  load: function(filepath, callback) {
    fs.readFile(path.resolve(process.cwd(), fixture_path + filepath), function (err, data) {
      if (err) throw err;
      callback(data);
    });
  }
};

exports.fixtures = FixtureHelper;
