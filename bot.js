const Discord = require('discord.js');
const auth = require('./auth.json'); // Obviously the auth.json is not included in the github repo
const songscraper = require('./modules/songscraper.js');
const fs = require('fs');

const commands = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const client = new Discord.Client();
client.commands = new Discord.Collection();

for (const commandFiles of commands) {
  const curCommand = require(`./commands/${commandFiles}`);
  client.commands.set(curCommand.name, curCommand);
}

client.on('ready', () => {
  console.log(`Connected to a server as ${client.user.tag}`);
  client.user.setActivity('Dance Dance Revolution', {'type': 'PLAYING'});
});

client.on('message', message => {

  if(message.content.toLowerCase().includes('dab') || message.content.toLowerCase().includes(':dab:')
    || message.content.toLowerCase().includes(' dabbing ')) {
    const dabEmoji = client.emojis.get('469280794909868052');
    message.react(dabEmoji.id)
  }
  if(message.content.includes('❤')) {
    console.log('heart');
    message.react('❤');
  }

  if (!message.content.startsWith('!') || message.author.bot) {
    return;
  }

  var args = message.content.substring(1).split(/ +/);
  var commandName = args.shift().toLowerCase();
  var command = client.commands.get(commandName);

  if(!command) {
    command = client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if(!command) {
      message.channel.send(`!${commandName} is an invalid command!\n` +
      `Enter !help for a list of available commands`);
      return;
    }
  }

  try {
    command.execute(message, args);
  }
  catch (err) {
    console.error(`Error: User tried !${commandName}\n` + err);
    message.channel.send(`Something went horribly wrong when you said !${commandName} :(\n` +
    `I'll be notifying my owner about this!`);
  }

});

client.login(auth.token);
