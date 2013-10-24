/**
 * Module Dependencies
 */

var objecturl = require('object-url');
var Upload = require('upload');
var drop = require('drop-anywhere');
var filepicker = require('file-picker');
var File = require('file');
var PPI = require('ppi');
var os = require('os');
var logger = document.querySelector('.log');
var log = require('./logger')(logger);
var Exif = require('exif');

/**
 * OS
 */

var dppi = {
  mac: 72,
  windows: 96,
  linux: 96
};

var dpr = dppi[os];

/**
 * Wrapper
 */

var wrapper = document.querySelector('.img-wrapper');

/**
 * Click on upload button
 */

var uploadBtn = document.querySelector('.upload-btn');
uploadBtn.onclick = function() {
  filepicker(function(items) {
    create(items[0]);
  });
};

logger.onclick = function() {
  logger.classList.toggle('hide');
};

/**
 * Initialize drop anywhere
 */

drop(function(e) {
  var item = e.items[0];
  create(item);
});

/**
 * Create the image
 */

function create(item) {
  var clientExif;
  if (!item) return;
  logger.innerHTML = '';
  log('object url', 'fetching for ' + item.name);

  // image
  var image = img(item);

  exif(item, function(err, obj) {
    clientExif = err || JSON.stringify(obj, true, 2);
  })

  // fetch exif
  up(item, function(obj) {
    resize(image, obj);
    log('exifreader (client) output', clientExif);
    log('exiftool (server) output', JSON.stringify(obj, true, 2));
    wrapper.innerHTML = '';
    wrapper.appendChild(image);
  });
}

/**
 * Upload the file
 */

function up(file, fn) {
  var upload = Upload(file);
  upload.to('/upload');
  upload.on('end', function(res) {
    fn(JSON.parse(res.responseText));
  });
}

/**
 * Create an image
 */

function img(file) {
  var url = objecturl.create(file);
  var img = document.createElement('img');
  img.src = url;
  return img;
}

/**
 * Resize based on computer's resolution
 */

function resize(img, exif) {
  log('original size', img.width + ' x ' + img.height);

  var ppi = PPI(exif) || dpr;
  log('image ppi', ppi);
  var ratio = dpr / ppi;
  log('resize ratio', ratio);
  img.width *= ratio;
  img.height *= ratio;

  log('after resize', img.width + ' x ' + img.height);
}

/**
 * File slice helper.
 */

function slice(file, a, b) {
  file.slice = file.slice || file.webkitSlice || file.mozSlice;
  if (!file.slice) return file;
  return file.slice(a, b);
}

/**
 * Parse the exif
 */

function exif(item, fn) {
  var file = new File(item);
  file.toArrayBuffer(function(err, buf){
    if (err) return fn(err);
    var obj;
    try {
      obj = Exif(buf);
    } catch (err) {
      return fn(err);
    }

    return fn(null, obj);
  });
}
