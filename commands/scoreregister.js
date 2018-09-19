const fs = require('fs');
const filename = './scores.json'
var scoreList = fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename, 'utf8')) : {};

module.exports = {
  name: 'scoreregister',
  aliases: 'register',
  description: '**!scoreregister {DDR Handle}** ' +
  '- Register in the score manager.',
  execute(message, args) {
    if (args.length == 0) {
      message.channel.send('Incorrect usage! Refer to:\n' + module.exports.description);
      return;
    }
    register(message, args);
  },
}

function register(message, args) {
  var handle = '';
  for (var i = 0; i < args.length; i++) {
    handle += args[i].toUpperCase();
    if (i != args.length - 1) {
      handle += ' ';
    }
  }

  if (scoreList.hasOwnProperty(message.author.id)) {
    message.channel.send('You already have a handle registered under the name ' + scoreList[message.author.id]['handle']);
    return;
  }

  if(checkMultiRegister(message, handle) == 1) {
    return;
  }

  initializeJson(message, handle);

  fs.writeFile(filename, JSON.stringify(scoreList, null, 2), (err) => {
    if (err != null) {
      console.log(err);
    }
    message.channel.send('You have been successfully registered under the handle ' + handle);
  });
}

function checkMultiRegister(message, handle) {
  for (var user in scoreList) {
    if (scoreList.hasOwnProperty(user)) {
      if (scoreList[user]['handle'] == handle) {
        message.channel.send('Handle has already been added! Sorry :( Pick another handle or add a suffix after it?');
        return 1;
      }
    }
  }
  return 0;
}

function initializeJson(message, handle) {
  scoreList[message.author.id] = {"singles": {}, "doubles": {}};
  scoreList[message.author.id]['handle'] = handle;
  for(var i = 1; i < 20; i++) {
    scoreList[message.author.id]['singles'][i] = {};
    scoreList[message.author.id]['doubles'][i] = {};
  }
}
