var many_things = require('../data/many_things.json');
var TriggerHelper = require('./lib/TriggerHelper.js');
var help = require('./lib/Help.js');

help.setHelpCategory(
  'deck',
  '54 cards deck',
  '/deck deal - rebuild a new 54 cards deck\n' +
  '/deck shuffle - shuffle the remaining cards in the deck\n' +
  '/deck pick - draw the top card of the deck\n' +
  '/deck manythings - draw the top card of the deck and display the result as a deck of many things'
);

var Deck = function (robot) {
  var trigger = new TriggerHelper('deck');

  var deck;

  // Using Knuth shuffle
  var shuffleDeck = function() {
    var currentIndex;
    var buffer;
    var randomIndex;

    for (currentIndex = deck.length - 1; currentIndex > 1; currentIndex--) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      buffer = deck[currentIndex];
      deck[currentIndex] = deck[randomIndex];
      deck[randomIndex] = buffer;
    }
  }

  var dealDeck = function() {
    var color;
    var number;

    // Adding jokers: number 0 - colors 1 and 2
    deck = [
      {'color': 1, 'number': 0},
      {'color': 2, 'number': 0}
    ];

    for (number = 1; number <= 13; number++) {
      for (color = 1; color <= 4; color++) {
        deck.push({
          'color': color,
          'number': number
        });
      }
    }
    shuffleDeck();
  }

  var getCardName = function(card) {
    var name;

    switch (card.number) {
      case 0:
        return 'Joker';
        break;
      case 1:
        name = 'Ace';
        break;
      case 2:
        name = 'Two';
        break;
      case 3:
        name = 'Three';
        break;
      case 4:
        name = 'Four';
        break;
      case 5:
        name = 'Five';
        break;
      case 6:
        name = 'Six';
        break;
      case 7:
        name = 'Seven';
        break;
      case 8:
        name = 'Eight';
        break;
      case 9:
        name = 'Nine';
        break;
      case 10:
        name = 'Ten';
        break;
      case 11:
        name = 'Jack';
        break;
      case 12:
        name = 'Queen';
        break;
      case 13:
        name = 'King';
        break;
    }

    switch (card.color) {
      case 1:
        name += ' of Hearts'
        break;
      case 2:
        name += ' of Spades'
        break;
      case 3:
        name += ' of Diamonds'
        break;
      case 4:
        name += ' of Clubs'
        break;
    }

    return name;
  }

  var pickCard = function() {
    return deck.pop()
  }

  dealDeck();

  robot.hear(trigger.getTrigger('deal'), function (msg) {
    dealDeck();
    msg.emote(' - shuffles all the cards back');
  });


  robot.hear(trigger.getTrigger('shuffle'), function (msg) {
    shuffleDeck();
    msg.emote(' *shuffle* *shuffle*');
  });

  robot.hear(trigger.getTrigger('pick'), function (msg) {
    var card = pickCard();
    if (card == undefined) {
      dealDeck();
      msg.reply('The deck is empty, let me recreate the deck.');
      card = pickCard();
    }

    msg.reply(getCardName(card));
  });

  robot.hear(trigger.getTrigger('manythings'), function (msg) {
    var card = pickCard();
    if (card == undefined) {
      dealDeck();
      msg.reply('The deck is empty, let me recreate the deck.');
      card = pickCard();
    }

    var manyThingsCard = many_things[card.number][card.color];
    msg.reply(getCardName(card) + " - " + manyThingsCard.title + " - " + manyThingsCard.description);
  });
}

module.exports = Deck;
