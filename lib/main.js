/* Copyright 2012 Thomas Schaaf, see LICENSE */
"use strict";

var exec = require('child_process').exec;
var path = require('path');
var cpSeparator = require('os').type().match(/^win/i) ? ";" : ":";

module.exports = function (options) {
  var defaults = options || {};

  if(defaults.ZXingLocation == null) {
    defaults.ZXingLocation = path.join(__dirname, "..", "zxing");
  }

  if(defaults.ZXingVersion == null) {
    defaults.ZXingVersion = "-3.1.0"
  }

  var commandLineOptions = " ";
  if(defaults.try_harder) {
    commandLineOptions += "--try_harder ";
  }
  if(defaults.multi) {
    commandLineOptions += "--multi ";
  }
  return {
    decode: function(filePath, cb) {
      exec('java -cp '+path.join(defaults.ZXingLocation, 'javase', 'javase'+defaults.ZXingVersion+'.jar')+cpSeparator+path.join(defaults.ZXingLocation, 'core', 'core'+defaults.ZXingVersion+'.jar')+' com.google.zxing.client.j2se.CommandLineRunner'+commandLineOptions+''+filePath,
        function(err, stdout, stderr){
          var qrcode = "";
          var errorCache = null;
          if(err !== null) {
            errorCache = err;
          } else {
            var lines = stdout.split("\n");
            var collect = false;

            for(var i in lines) {
              if(lines[i] == 'Raw result:') {
                collect = true; 
                continue;               
              } 
              else if(lines[i] === 'Parsed result:') {
                collect = false;
                break;                
              }

              if(collect){
                qrcode += lines[parseInt(i)];                
              }
            }
          }
          cb(errorCache, qrcode);
        }
      );
    }
  };
}
