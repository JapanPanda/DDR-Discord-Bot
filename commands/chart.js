var rp = require('request-promise');
var cheerio = require('cheerio');

module.exports = {
  name: 'chart',
  description: '**!chart {playstyle & difficulty example: esp} {song name}** - Grabs a youtube video of the chart from Yuisin (romaji accepted)',
  aliases: 'c',
  async execute(message, args) {
    try {
      message.channel.startTyping();
      var _message = await getChartVideo(args);
      message.channel.send(_message)
      message.channel.stopTyping();
    }
    catch (err) {
      console.log(err);
      message.channel.send('Something went wrong! Telling my owner about this!');
      message.channel.stopTyping();
    }
  },
}

async function getChartVideo(args) {
  var songInfo = {songName: '', playstyle: '', difficulty: ''};
  var searchQuery = getSearchQuery(args, songInfo);

  if(searchQuery == 1) {
    return 'BEDP (Beginner Double Play) does not exist!'
  }
  else if(searchQuery == 2) {
    return 'Could not find the abbreviation ' + args[0] + '\nPossible combinations are:\n' +
    '**BE**: Beginner, **B**: Basic, **D**: Difficult, **E**: Expert, **C**: Challenge\nCombined with:\n**SP**: Singles, **DP**: Doubles\n' +
    'An example of an abbreviation would be **BSP** (Basic Single Play)';
  }

  options.uri = searchQuery;

  var href = await search(options);
  if(href == '') {
    return 'Could not find a video for the song ' + songInfo.songName + '!';
  }

  var link = 'https://www.youtube.com' + href;
  return link;
}


var options = {
  uri: '',
  followAllRedirects: true,
  transform: function(body) {
    return cheerio.load(body);
  }
}

function getSearchQuery(args, songInfo) {
  var returnCode = parseSongInfo(args, songInfo);

  if (returnCode == 1) {
    return 1;
  }
  if (returnCode == 2) {
    return 2;
  }

  var searchQuery = songInfo.songName + ' ' + songInfo.playstyle + ' ' + songInfo.difficulty;
  var URIEncodedQuery = encodeURI(searchQuery);
  var ytQuery = 'https://www.youtube.com/user/fumenity/search?query=' + URIEncodedQuery;
  options.uri = ytQuery;
  return ytQuery;
}

function search(options) {
  return rp(options)
    .then(($) => {
      var alist = $('#browse-items-primary a');
      var check = $('#browse-items-primary p');

      if(check.length != 0) {
        return '';
      }
      return alist.eq(0).attr('href');
    })
    .catch((err) => {
      console.log(err);
    });
}

function parseSongInfo(args, songInfo) {
  for (var i = 1; i < args.length; i++) {
    songInfo.songName += args[i];
    if(i != args.length - 1) {
      songInfo.songName += ' ';
    }
  }

  switch(args[0].toLowerCase()) {
    case 'bedp':
      return 1;
      break;
    case 'besp':
      songInfo.playstyle = 'single';
      songInfo.difficulty = 'beginner';
      break;
    case 'bsp':
      songInfo.playstyle = 'single';
      songInfo.difficulty = 'basic';
      break;
    case 'dsp':
      songInfo.playstyle = 'single';
      songInfo.difficulty = 'difficult';
      break;
    case 'esp':
      songInfo.playstyle = 'single';
      songInfo.difficulty = 'expert';
      break;
    case 'csp' :
      songInfo.playstyle = 'single';
      songInfo.difficulty = 'challenge';
      break;
    case 'bdp':
      songInfo.playstyle = 'double';
      songInfo.difficulty = 'beginner';
      break;
    case 'ddp':
      songInfo.playstyle = 'double';
      songInfo.difficulty = 'difficult';
      break;
    case 'edp':
      songInfo.playstyle = 'double';
      songInfo.difficulty = 'expert';
      break;
    case 'cdp':
      songInfo.playstyle = 'double';
      songInfo.difficulty = 'challenge';
      break;
    default:
      return 2;
      break;
  }
  return 0;
}
