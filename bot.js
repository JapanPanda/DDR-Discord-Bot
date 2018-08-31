var Discord = require('discord.io')
var auth = require('./auth.json') // Obviously the auth.json is not included in the github repo
var songscraper = require('./songscraper.js')

var client = new Discord.Client({
  token: auth.token,
  autorun: true
});

client.on('ready', function(event) {
  console.log('Connected to a server as ' + client.username + '#' + client.id);
});

client.on('message', function(user, userID, channelID, message, event) {
  if (message.substring(0,1) == '!') {
    var args = message.substring(1).split(' ');
    var command = args[0];
    switch(command) {
      case 'who':
        client.sendMessage({
          to: channelID,
          message: 'Hiya, I\'m a bot written by Hawawa#8742! ' +
          'I\'m written with Node.js using the discord.io library.\n' +
          'You can view my source code on PLACEHOLDER\n' +
          'If theres any bugs, please harrass my owner through discord dm.'
        });
        break;
      case 'help':
        client.sendMessage({
          to: channelID,
          message: 'Available Commands\n' +
          '!help - Show available commands\n' +
          '!who - Brief introduction about who I am\n' +
          '!songinfo {song name} - Lists Song information and difficulty breakdown (romaji accepted)'
        });
        break;
      case 'songinfo':
        var songName = encodeURI(message.slice(10));
        var searchUri = 'https://remywiki.com/index.php?search=' + songName + '&title=Special%3ASearch&go=Go';
        songscraper.search(searchUri).then(function(songJson) {
          if (songJson == 0) {
            client.sendMessage({
              to: channelID,
              message: 'Song Page wasn\'t found on Remywiki (https://remywiki.com)\n' +
              'I tried searching, but here are the results ' + searchUri + '\n' +
              'Are you sure your song name was correct and specific enough?'
            })
          }
          else {
            let name = songJson['songname'];
            let artist = songJson['artist'];
            let charter = songJson['charter'];
            let bpm = songJson['bpm'];
            let length = songJson['length'];
            let besp = songJson['difficulty'][0];
            let bsp = songJson['difficulty'][1];
            let dsp = songJson['difficulty'][2];
            let esp = songJson['difficulty'][3];
            let csp = songJson['difficulty'][4];
            let bdp = songJson['difficulty'][5];
            let ddp = songJson['difficulty'][6];
            let edp = songJson['difficulty'][7];
            let cdp = songJson['difficulty'][8];
            let notebesp = songJson['notecount'][0];
            let notebsp = songJson['notecount'][1];
            let notedsp = songJson['notecount'][2];
            let noteesp = songJson['notecount'][3];
            let notecsp = songJson['notecount'][4];
            let notebdp = songJson['notecount'][5];
            let noteddp = songJson['notecount'][6];
            let noteedp = songJson['notecount'][7];
            let notecdp = songJson['notecount'][8];
            var stringMessage = `__**${name}**__\n` +
            `**Artist:** ${artist}\n` +
            `**Charter:** ${charter}\n` +
            `**BPM:** ${bpm}\n` +
            `**Length:** ${length}\n` +
            `__**Singles Difficulties (Notes / Freeze Arrows / Shock Arrows)**__\n` +
            `- **Beginner**: ${besp} (${notebesp})\n- **Basic**: ${bsp} (${notebsp})\n` +
            `- **Difficult**: ${dsp} (${notedsp})\n- **Expert**: ${esp} (${noteesp})\n` +
            `- **Challenge:** ${csp} (${notecsp})\n` +
            `__**Doubles Difficulties (Notes / Freeze Arrows / Shock Arrows):**__\n` +
            `- **Basic**: ${bdp} (${notebdp})\n` +
            `- **Difficult**: ${ddp} (${noteddp})\n- **Expert**: ${edp} (${noteedp})\n` +
            `- **Challenge**: ${cdp} (${notecdp})\n`;
            client.sendMessage({
              to: channelID,
              message: stringMessage
            })
          }
        });

    }
  }
});
