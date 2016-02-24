var Help = function() {
  var helpCategories = [];

  this.setHelpCategory = function(category, summary, detailedInfo) {
    helpCategories[category] = {
      'summary': summary,
      'details': detailedInfo
    }
  }

  this.getGlobalHelp = function() {
    info = "\n";
    for (var category in helpCategories) {
      info += category + ': ' + helpCategories[category].summary + "\n";
    }

    return info;
  }

  this.getDetailedHelp = function(category) {
    if (!helpCategories.hasOwnProperty(category)) {
      return 'help command not found';
    }

    return helpCategories[category].summary + "\n\n" + helpCategories[category].details;
  }
};

Help.instance = null;

Help.getInstance = function() {
  if (this.instance === null) {
    this.instance = new Help();
  }

  return this.instance
}

module.exports = Help.getInstance();
