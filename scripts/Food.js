var TriggerHelper = require('./lib/TriggerHelper.js');
var connectionHelper = require('./lib/ConnectionHelper.js');
var AntiWeasel = require('./lib/AntiWeasel.js');
var help = require('./lib/Help.js');

help.setHelpCategory(
  'food',
  'store and display food places',
  '/food add <name> - add a food place\n' +
  '/food remove <name> - remove a food place\n' +
  '/food pick - pick a random food place\n' +
  '/food list - list all the saved food places'
);

var Food = function(robot) {
  var trigger = new TriggerHelper('food');
  var antiWeasel = new AntiWeasel();

  var addPlace = function(place_name, msg) {
    var connection = connectionHelper.getConnection();

    connection.query('INSERT INTO food (name) VALUES (?)', [place_name], function(err) {
      if (err) {
        msg.reply('Something broke');
      }

      msg.reply('Added ' + place_name);
    });
  }

  var deletePlace = function(place_name, msg) {
    var connection = connectionHelper.getConnection();

    connection.query('DELETE FROM food WHERE name = ?', [place_name], function(err) {
      if (err) {
        msg.reply('Something broke');
      }

      msg.reply('Removed place ' + place_name);
    });
  }

  var listPlaces = function(msg) {
    var connection = connectionHelper.getConnection();

    connection.query('SELECT * FROM food', function(err, rows) {
      if (err) {
        msg.reply('Something broke');
      }

      result = '\n';
      rows.forEach(function (row) {
        result += '- ' + row.name + '\n';
      });

      msg.reply(result);
    });
  }

  var pickPlace = function(msg) {
    var connection = connectionHelper.getConnection();

    connection.query('SELECT * FROM food ORDER BY RAND() LIMIT 0, 1', function (err, rows) {
      if (err) {
        msg.reply('Something broke');
      }

      if (rows.length == 0) {
        msg.reply('No place registered yet');
      }

      msg.reply(rows[0].name);
    });
  }

  robot.hear(trigger.getTrigger('list'), function (msg) {
    listPlaces(msg);
  });

  robot.hear(trigger.getTrigger('add', '(.+?)'), function (msg) {
    if (!antiWeasel.check(msg.match[1])) {
      msg.reply('Don\'t be a weasel');
    } else {
      addPlace(msg.match[1], msg);
    }
  });

  robot.hear(trigger.getTrigger('remove', '(.+?)'), function (msg) {
    deletePlace(msg.match[1], msg);
  });

  robot.hear(trigger.getTrigger('pick'), function (msg) {
    pickPlace(msg);
  });
}

module.exports = Food;
