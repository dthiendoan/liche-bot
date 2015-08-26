var Config = require('../config.js');
var Mysql = require('mysql');

var Food = function(robot) {
  var config = new Config();
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
    
    connection.query('INSERT INTO food (name) VALUES("' + place_name + '")', function(err) {
      if (err) {
        msg.reply('Something broke');
      }

      msg.reply('Added ' + place_name);
    });
    
    disconnectDb(connection);
  }

  var deletePlace = function(place_id, msg) {
    var connection = connectDb();
    
    connection.query('DELETE FROM food WHERE id=(' + place_id + ')', function(err) {
      if (err) {
        msg.reply('Something broke');
      }

      msg.reply('Removed place ' + place_id)
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
        result += row.id + '. ' + row.name + '\n';
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
    addPlace(msg.match[1], msg);
  });

  robot.hear(/^\/food\s+remove\s+([0-9]+)\s*/, function (msg) {
    deletePlace(msg.match[1], msg);
  });

  robot.hear(/^\/food\s+pick\s*$/, function (msg) {
    pickPlace(msg);
  });
}

module.exports = Food;
