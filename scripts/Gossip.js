var Config = require('../config/config.js');
var Mysql = require('mysql');
var AntiWeasel = require('./lib/AntiWeasel.js');

var Gossip = function(robot) {
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

  var addGossip = function(gossip, msg) {
    var connection = connectDb();

    connection.query('INSERT INTO gossip (gossip_text) VALUES(?)', gossip, function(err) {
      if (err) {
        msg.reply('Something broke');
      }

      msg.reply('Gossip added');
    });
    
    disconnectDb(connection);
  }

  var deleteGossip = function(id, msg) {
    var connection = connectDb();

    connection.query('DELETE FROM gossip WHERE id = ?', id, function(err) {
      if (err) {
        msg.reply('Something broke');
      }

      msg.reply('Gossip deleted');
    });
    
    disconnectDb(connection);
  }

  var getGossip = function(words, msg) {
    var connection = connectDb();
    var query = 'SELECT * FROM gossip';

    if (words.length > 0) {


      query += ' WHERE gossip_text LIKE ?';
      words[0] = '%' + words[0] + '%';
      for (var count = 1; count < words.length; count++) {
      words[count] = '%' + words[count] + '%';
        query += ' AND gossip_text LIKE ?';
      }
    }

    query += ' ORDER BY RAND() LIMIT 0,1';

    connection.query(query, words, function(err, rows) {
      if (err) {
        msg.reply('Something broke');
      }

      if (rows.length === 0) {
      	msg.reply('No gossip found.');
      	return;
      }
      msg.reply('[id:' + rows[0].id + ']\n' + rows[0].gossip_text);
    });

    disconnectDb(connection);
  }

  robot.hear(/^\/gossip\s+add\s+([\s\S]+?)$/, function (msg) {
    if (!antiWeasel.check(msg.match[1])) {
      msg.reply('Don\'t be a weasel');
    } else {
      addGossip(msg.match[1], msg);
    }
  });

  robot.hear(/^\/gossip\s+remove\s+(\d+?)\s*$/, function (msg) {
    deleteGossip(msg.match[1], msg);
  });

  robot.hear(/^\/gossip\s*$/, function (msg) {
    getGossip([], msg);
  });

  robot.hear(/^\/gossip\s+(.*?)\s*$/, function (msg) {
    var words = msg.match[1].split(' ');
    if (words[0] !== 'add' && words[0] !== 'remove') {
	    getGossip(words, msg);
    }
  });
}

module.exports = Gossip;
