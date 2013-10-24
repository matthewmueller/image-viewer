/**
 * Module Dependencies
 */

var port = process.argv[2] || 9000;
var express = require('express');
var app = module.exports = express();
var exif = require('exif2');

/**
 * Configuration
 */

app.set('views', __dirname);
app.set('view engine', 'jade');

app.use(express.static(__dirname));
app.use(express.logger('dev'));
app.use(express.bodyParser());

/**
 * Routes
 */

app.post('/upload', function(req, res) {
  var file = req.files.file;
  if (!file) return res.send(400);

  // set json content type
  res.type('json');

  // parse the exif
  exif(file.path, function(err, data) {
    if (err) return res.send(500, { error: err });
    res.send(data);
  });
});

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/view.html');
});

/**
 * Listen
 */

if(!module.parent) {
  app.listen(port);
  console.log('Server started on port', port);
}
