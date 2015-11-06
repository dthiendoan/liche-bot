var Config = require('../config.js');
var Mysql = require('mysql');

var Roulette = function (robot) {
  var shot;
  var lastPerson;

  var config = new Config();

  var connectDb = function() {
    var connection = Mysql.createConnection(config.mysql);
    connection.connect();

    return connection;
  }

  var disconnectDb = function(connection) {
    connection.end();
  }

  var spinBarrel = function () {
    shot = Math.floor(Math.random() * 6);
  }

  var pullTrigger = function (person) {
    if (person == lastPerson) {
      return;
    }

    lastPerson = person;

    if (shot == 0) {
      spinBarrel();
      lastPerson = null;
      return true;
    } else {
      shot--;
      return false;
    }
  }

  spinBarrel();

  var addHit = function (person) {
    var connection = connectDb();
    var user = connection.escape(person)

    connection.query('SELECT * FROM roulette WHERE user=(' + user + ')', function (err, rows) {
      if (rows != undefined && rows.length > 0) {
        connection.query('UPDATE roulette SET tries=tries+1, deaths=deaths+1 WHERE user=(' + user + ')', function (err) {});
      } else {
        connection.query('INSERT INTO roulette (user, tries, deaths) VALUES (' + user +', 1, 1)', function (err) {});
      }

    });
  }

  var addMiss = function (person) {
    var connection = connectDb();
    var user = connection.escape(person)

    connection.query('SELECT * FROM roulette WHERE user=(' + user + ')', function (err, rows) {
      if (rows != undefined && rows.length > 0) {
        connection.query('UPDATE roulette SET tries=tries+1 WHERE user=(' + user + ')', function (err) {});
      } else {
        connection.query('INSERT INTO roulette (user, tries, deaths) VALUES (' + user +', 1, 0)', function (err) {});
      }

    });
  }

  var getStats = function (msg) {
    var stats = [];
    var row_result;
    var survival_rate;

    var connection = connectDb();
    connection.query('SELECT * FROM roulette ORDER BY deaths/tries ASC', function(err, rows) {
      if (err) {
        msg.reply('Something broke');
      }

      var result = 'Roulette statistics: \n';

      rows.forEach(function (row) {
        survival_rate = (1 - parseFloat(row.deaths) / parseFloat(row.tries)) * 100; 

        result +=
          row.user + ' - ' +
          'Tries: ' + row.tries + ' - ' +
          'Deaths: ' + row.deaths + ' - ' +
          'Survival rate: ' + survival_rate.toFixed(2) + '%\n';
      });

      msg.reply(result);
    });

    return stats;
  }

  robot.hear(/^\/roulette\s*$/, function (msg) {
    var person = msg.message.user.mention_name

    var result = pullTrigger(person);
    if (result === true) {
      addHit(person);
      msg.emote(' - *BANG* YOU LOSE !');
    } else if (result === undefined) {
      msg.reply('are you suicidal ?');
    } else if (result === false) {
      addMiss(person);
      msg.emote(' - *click*');
    }
  });


  robot.hear(/^\/roulette\s+stats\s*$/, function (msg) {
    getStats(msg);
  });
};

module.exports = Roulette;
