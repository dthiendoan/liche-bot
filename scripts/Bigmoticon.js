var request = require('request');
var q = require('q');

var connectionHelper = require('./lib/ConnectionHelper.js');
var AntiWeasel = require('./lib/AntiWeasel.js');
var help = require('./lib/Help.js');

help.setHelpCategory(
  'bigmoticon',
  'manage and display big sized emoticons',
  'Say anything with `[tag]` in to display the emoticon\n' +
  '/bigmoticon add {tag} {imageurl}\n' +
  '/bigmoticon remove {tag}\n' +
  '/bigmoticon list'

)

var Bigmoticon = function(robot) {
  var antiWeasel = new AntiWeasel();
  var connection = connectionHelper.getConnection();

  var addMoticon = function(tag, image, msg) {
    var connection = connectionHelper.getConnection();

    isImg(image).then(function (val) {
      if (!val) {
        msg.reply('Not an image');
        return;
      }

      connection.query(
        'SELECT count(tag) as COUNT FROM bigmoticon WHERE tag = ?',
        [tag, image],
        function(err, rows) {
          if (err) {
            msg.reply('Something broke');
            return;
          }
          if (rows[0].COUNT > 0) {
            msg.reply('A bigmoticon with that tag already exists');
            return;
          }

          connection.query(
            'INSERT INTO bigmoticon (tag, url) VALUES (?, ?)',
            [tag, image],
              function(err) {
              if (err) {
                msg.reply('Something broke');
                return;
              }

              msg.reply('Bigmoticon added');
            }
          );
        }
      );
    });
  }

  var deleteMoticon = function(tag, msg) {
    var connection = connectionHelper.getConnection();
    connection.query('DELETE FROM bigmoticon WHERE tag = ?', [tag], function(err) {
      if (err) {
        msg.reply('Something broke');
        return;
      }

      msg.reply('Bigmoticon deleted');
    });
  }

  var listMoticons = function(msg) {
    connection.query('SELECT tag FROM bigmoticon', function(err, rows) {
      if (err) {
        msg.reply('Something broke');
        return;
      }

      result = '\n';
      rows.forEach(function (row) {
        result += '- ' + row.tag + '\n';
      });

      msg.reply(result);
    });
  }

  var getMoticon = function(tag, msg) {
    var connection = connectionHelper.getConnection();
    connection.query(
      'SELECT url FROM bigmoticon WHERE tag = ?',
      [tag],
      function(err, rows) {
        if (err) {
          msg.reply('Something broke');
          return;
        }

        if (rows.length == 0) {
          return;
        }
        
        msg.send(rows[0].url);
    });

  }

  var isImg = function(imgUrl) {
    var deferred = q.defer();

    request(imgUrl, { method: 'HEAD'}, function (err, res) {
      deferred.resolve(res.headers['content-type'] && res.headers['content-type'].split('/')[0] === 'image');
    });

    return deferred.promise;
  }

  robot.hear(/\[(\w+)\]/, function (msg) {
    getMoticon(msg.match[1], msg);
  });

  robot.hear(/^\/bigmoticon\s+add\s+(\w+)\s+(.+?)\s*$/, function (msg) {
    var tag = msg.match[1];
    var img = msg.match[2];

    if (!antiWeasel.check(tag)) {
      msg.reply('Don\'t be a weasel');
      return;
    }

    addMoticon(tag, img, msg);
  });

  robot.hear(/^\/bigmoticon\s+remove\s+(\w+)\s*$/, function (msg) {
    deleteMoticon(msg.match[1], msg);
  });

  robot.hear(/^\/bigmoticon\s+list\s*$/, function (msg) {
    listMoticons(msg);
  });
};

module.exports = Bigmoticon
