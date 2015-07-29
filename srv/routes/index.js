var fs = require('fs');
var path = require('path');
var express = require('express');
var pckg = require('../../package.json');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.redirect('/index.html');
});

router.get('/tml.js', function(req, res) {
  fs.readFile(path.join(__dirname, '../../dist', 'tml-'+pckg.version+'.js'), 'utf8', function(err,data){
    res.send(data);  
  });
});

router.get('/tml.min.js', function(req, res) {
  fs.readFile(path.join(__dirname, '../../dist', 'tml-'+pckg.version+'.min.js'), 'utf8', function(err,data){
    res.send(data);  
  });
});



module.exports = router;


