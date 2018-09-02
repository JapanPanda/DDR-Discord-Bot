const songscraper = require('../modules/songscraper.js');

module.exports = {
  name: 'songinfo',
  description: '!songinfo {song name} - Lists Song information and difficulty breakdown (romaji accepted)',
  aliases: 'si',
  async execute(message, args) {
    message.channel.startTyping();
    var searchQuery = getSearchQuery(args);
    await getMessage(searchQuery).then(function(_message) {
      message.channel.send(_message);
      message.channel.stopTyping();
    });
  },
}

function getSearchQuery(args) {
  var combinedArg = '';
  for(var i = 0; i < args.length; i++) {
    combinedArg += args[i];
    combinedArg += ' ';
  }
  var songName = encodeURI(combinedArg);
  return 'https://remywiki.com/index.php?search=' + songName + '&title=Special%3ASearch&go=Go';
}

function getMessage(searchQuery) {
  return songscraper.search(searchQuery).then(function(songJson) {
    if (songJson == 0) {
      _message = 'Song Page wasn\'t found on Remywiki (https://remywiki.com)\n' +
      'I tried searching, but here are the results ' + searchQuery + '\n' +
      'Are you sure your song name was correct and specific enough?'
      return _message;
    }
    else {
      let songromaji = songJson['songromaji'];
      let songname = songJson['songname'];
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
      console.log(String.fromCharCode(8220) + String.fromCharCode(8221));
      songname = songname.replace(String.fromCharCode(8220), '"');
      songname = songname.replace(String.fromCharCode(8221), '"');
      console.log(songname);
      var songString;
      if (songname != songromaji) {
        songString = `${songname} (${songromaji})`;
      }
      else {
        songString = songname;
      }

      var _message = `__**${songString}**__\n` +
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
      return _message;
    }
  });
}
