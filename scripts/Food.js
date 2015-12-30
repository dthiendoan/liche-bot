var Config = require('../config/config.js');
var Mysql = require('mysql');
var AntiWeasel = require('./lib/AntiWeasel.js');

var Food = function(robot) {
  var config = new Config();
  var antiWeasel = new AntiWeasel();

  var connectDb = function() {
    var connection = Mysql.createConnection(config.mysql);
    connection.connect();

    return connection;
  }

  var disconnectDb = function(connection) {
    connection.end();
  }

  var addPlace = function(place_name, msg) {
    var connection = connectDb();
    var name = connection.escape(place_name);
    connection.query('INSERT INTO food (name) VALUES(' + name + ')', function(err) {
      if (err) {
        msg.reply('Something broke');
      }

      msg.reply('Added ' + name);
    });
    
    disconnectDb(connection);
  }

  var deletePlace = function(place_name, msg) {
    var connection = connectDb();
    var name = connection.escape(place_name);

    connection.query('DELETE FROM food WHERE name=(' + name + ')', function(err) {
      if (err) {
        msg.reply('Something broke');
      }

      msg.reply('Removed place ' + name);
    });
    
    disconnectDb(connection);
  }

  var listPlaces = function(msg) {
    var connection = connectDb();
   
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

    disconnectDb(connection);
  }

  var pickPlace = function(msg) {
    var connection = connectDb();

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

  robot.hear(/^\/food\s+list\s*$/, function (msg) {
    listPlaces(msg);
  });

  robot.hear(/^\/food\s+add\s+(.+?)\s*$/, function (msg) {
    if (!antiWeasel.check(msg.match[1])) {
      msg.reply('Don\'t be a weasel');
    } else {
      addPlace(msg.match[1], msg);
    }
  });

  robot.hear(/^\/food\s+remove\s+(.+?)\s*$/, function (msg) {
    deletePlace(msg.match[1], msg);
  });

  robot.hear(/^\/food\s+pick\s*$/, function (msg) {
    pickPlace(msg);
  });
}

module.exports = Food;
