const Discord = require('discord.js');
const fs = require('fs');
const commands = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
var commandCollection = new Discord.Collection();

module.exports = {
  name: 'help',
  description: '!help {command (optional)}- Shows a list of available commands or help with a certain command!',
  aliases: 'h',
  execute(message, args) {
    var _message = '';
    if (args.length == 0) {
      _message = listCommands();
    }
    else if (args.length == 1) {
      _message = getDescription(args);
    }
    message.channel.send(_message);
  },
}

function getDescription(args) {
  var commandName = args[0].toLowerCase();
  var command = commandCollection.get(commandName);
  var _message = '';
  if(!command) {
    command = commandCollection.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if(!command) {
      message.channel.send(`!${commandName} is an invalid command!\n` +
      `Enter !help for a list of available commands`);
      return;
    }
  }

  try {
    if(aliases!= null) {
      var aliases;
      for (alias in command.aliases) {
        aliases += alias + ' ';
      }
      _message += 'Aliases: ' + aliases + '\n';
    }
    _message += command.description;
  }
  catch (err) {
    console.log(err);
  }
  return _message;
}

function listCommands() {
  var _message = 'Available Commands\n';
  var arrayCopy = commandCollection.array();
  for (const commands of arrayCopy) {
    _message += commands.description;
    _message += '\n';
  }
  return _message;
}

for (const commandFiles of commands) {
  if (commandFiles == 'help.js') {
    commandCollection.set(module.exports.name, module.exports);
    continue;
  }
  const curCommand = require(`./${commandFiles}`);
  commandCollection.set(curCommand.name, curCommand);
}
