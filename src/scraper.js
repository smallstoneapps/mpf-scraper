module.exports = (function () {

  var jsdom = require('jsdom');
  var _ = require('underscore');
  var async = require('async');
  var PBW = require('node-pbw');

  var sorts = {
    oldest: 'pebble_dateAdded_asc',
    newest: 'pebble_dateAdded_desc',
    updated: 'pebble_dateUpdated_desc'
  };

  var ROOT = 'http://www.mypebblefaces.com/';

  return {
    fetchPbws: fetchPbws
  }

  function fetchPbws(options, callback) {
    options = options || {};
    var sort = options.sort || 'updated';
    var page = options.page || 1;
    var apps = [];

    jsdom.env(ROOT + '?orderBy=' + sorts[sort] + '&ccm_paging_p_b316=' + page, [ 'http://code.jquery.com/jquery.js' ], function (err, window) {
      if (err) {
        return callback(err);
      }

      var $downloadLinks = window.$("a[href^='/download_app']");
      var links = _.map($downloadLinks, function (link) {
        return ROOT + window.$(link).attr('href');
      });
      links = _.uniq(links, false);

      async.eachSeries(links, function (link, callback) {
        PBW.loadUrl(link, function (err, app) {
          if (err) {
            return callback(err);
          }
          var ids = link.match(/fID=([0-9]*)/);
          if (ids.length == 1) {
            app.mpfId = ids[0];
          }
          apps.push(app);
          return callback();
        });
      },
      function (err) {
        return callback(err, apps);
      });
    });
  }
  
}());