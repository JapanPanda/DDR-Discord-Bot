const fs = require('fs');
const filename = './scores.json'
const songscraper = require('../modules/songscraper.js');
const score = require('./score.js');

var scoreList = fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename, 'utf8')) : {};

module.exports = {
  name: 'scoreget',
  description: '**!scoreget {handle_space (use _ instead of spaces) (optional, default = you)} {song name (romaji only)} {difficulty/playstyle (esp, edp, etc)}**' +
  ' - You may also use !scoreget list {handle_space (use _ instead of spaces) (optional, default = you)} {playstyle} {level ex: 19} to get scores for a level!',
  async execute(message, args) {
    if (args.length == 0) {
      message.channel.send('Incorrect usage! Refer to:\n' + module.exports.description);
      return;
    }
    if (args[0] == 'list') {
      listScores(message, args);
    }
    else {
      getScore(message, args);
    }
  },
}

function getPlaystyle(args) {
  var playstyle = args[args.length - 2];
  if (playstyle.toLowerCase() == 'single') {
    playstyle = 'singles';
  }
  else if (playstyle.toLowerCase() == 'double') {
    playstyle = 'doubles';
  }

  if (playstyle != 'singles' && playstyle != 'doubles') {
    return 0;
  }
  return playstyle;
}

function getHandle(args) {
  var handle = '';
  var handleParts = args[0].split('_');
  handleParts[handleParts.length - 1] = handleParts[handleParts.length - 1].split(' ')[0];
  console.log(handleParts);
  for (var i = 0; i < handleParts.length; i++) {
    handle += handleParts[i];
    if (i != handleParts.length - 1) {
      handle += ' ';
    }
  }
  handle = handle.toUpperCase();
  console.log(handle);
  return handle;
}

function printScores(message, handle, selectedEntry, playstyle, level) {
  console.log(handle);
  var prettyPlaystyle = playstyle.charAt(0).toUpperCase() + playstyle.slice(1);
  if (selectedEntry == null) {
    message.channel.send('The handle ' + handle + ' is not registered in the score manager!');
    return;
  }
  if(selectedEntry[playstyle][level] == null || selectedEntry[playstyle][level].length == 0) {
    message.channel.send(handle +' does not have scores under the level ' + level + ' in ' + prettyPlaystyle);
    return;
  }
  var userScoreList = selectedEntry[playstyle][level];
  var _message = `${handle}'s Level ${level} scores:\n`;
  var counter = 0;
  for (var score in userScoreList) {
    counter++;
    var prettyScore = userScoreList[score]['score'].slice(0,3) + ',' + userScoreList[score]['score'].slice(3);
    _message += `**${userScoreList[score]['prettyName']} ${prettyPlaystyle} ${userScoreList[score]['difficulty']}**: `;
    _message += `${prettyScore}\n`;
  }
  if(counter == 0) {
    _message = `${handle} has no scores under the level ${level} in ${prettyPlaystyle}.`
  }
  console.log(_message);
  message.channel.send(_message);
}

function listScores(message, args) {
  var level = args[args.length - 1];
  if (level < 1 && level > 19) {
    message.channel.send('Invalid level: ' + level + '\nMust be a number 1-19!')
    return;
  }

  var playstyle = getPlaystyle(args);
  if(playstyle == 0) {
    message.channel.send('Invalid playstyle specified: ' + playstyle +
    '\nPossible combinations are:\n' +
    '**BE**: Beginner, **B**: Basic, **D**: Difficult, **E**: Expert, **C**: Challenge\nCombined with:\n**SP**: Singles, **DP**: Doubles\n' +
    'An example of an abbreviation would be **BSP** (Basic Single Play)');
    return;
  }

  var counter = 0;
  var handle = '';
  console.log(args.length);

  if (args.length == 4) {
    handle = getHandle(args.slice(1));
  }
  else if (args.length == 3) {
    handle = '';
  }
  else {
    message.channel.send('Invalid amount of arguments!\nValid examples:\n!scoreget list 19 singles\n!scoreget list Hawawa 19 singles');
    return;
  }

  var selectedEntry;
  if (handle == '') {
    selectedEntry = scoreList[message.author.id];
  }
  else {
    for (var entry in scoreList) {
      if (scoreList[entry]['handle'] == handle) {
        selectedEntry = scoreList[entry];
        break;
      }
    }
  }

  printScores(message, handle, selectedEntry, playstyle, level);
}

async function getScore(message, args) {
  //!scoreget {[ handle ] (optional, default = you)} {song name (romaji only)} {difficulty/playstyle (esp, edp, etc)}
  scoreList = fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename, 'utf8')) : {};
  var handle = '';
  if (args.length == 3) {
    handle = getHandle(args);
    args = args.slice(1);
  }
  console.log(handle);

  var songInfo = score.getSongInfo(message, args);
  if (songInfo == 0) {
    return;
  }
  var info = await score.getInfo(message, args, songInfo);
  if (info == 0) {
    return;
  }

  var rawDifficulty = songInfo.difficulty;
  var difficulty = rawDifficulty.charAt(0).toUpperCase() + rawDifficulty.slice(1);
  var rawPlaystyle = songInfo.playstyle;
  var playstyle = rawPlaystyle.charAt(0).toUpperCase() + rawPlaystyle.slice(1);

  var selectedEntry;
  if (handle == '') {
    selectedEntry = scoreList[message.author.id];
  }
  else {
    for (var entry in scoreList) {
      if (scoreList[entry]['handle'] == handle) {
        selectedEntry = scoreList[entry];
        break;
      }
    }
  }

  if(selectedEntry == null) {
    message.channel.send('Could not find the handle ' + handle + ' in the score database!');
    return;
  }

  if (!selectedEntry[songInfo.playstyle][info.difficulty].hasOwnProperty(songInfo.songName.toUpperCase())) {
    message.channel.send(`${selectedEntry['handle']} does not have a registered score for ` +
                         `**${info.prettyName} | ${playstyle} ${difficulty}!**`);
    return;
  }
  var scoreCopy = selectedEntry[songInfo.playstyle][info.difficulty][songInfo.songName.toUpperCase()];
  var scores = scoreCopy['score'].slice(0,3) + ',' + scoreCopy['score'].slice(3);
  message.channel.send(`${selectedEntry['handle']} has a score of **${scores}** ` +
                       `on **${info.prettyName} | ${playstyle} ${difficulty}**!`);

  console.log(`${selectedEntry['handle']} has a score of **${scores}** ` +
                      `on **${info.prettyName} | ${playstyle} ${difficulty}**!`);
}
