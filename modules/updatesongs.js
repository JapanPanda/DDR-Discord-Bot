var rp = require('request-promise');
var cheerio = require('cheerio');
var fs = require('fs');
var songscraper = require('./songscraper.js')
// Only ran at the start of the bot, could also be ran manually

var options = {
  uri: '',
  transform: function(body) {
    return cheerio.load(body);
  }
}

var options2 = {
  uri: '',
  transform: function(body) {
    return cheerio.load(body);
  }
}


async function scrape() {
  var difficultyJson = initializeJson();
  var startURL = 'https://remywiki.com/Category:DDR_Songs';
  var finished = false;
  options.uri = startURL;
  while(!finished) {
    links = [];
    links = await scrapeLinks();
    console.log(links[links.length - 1]);
    if (!links[links.length - 1].includes('index.php')) {
      console.log('Last run!');
      finished = true;
    }
    else if(links[links.length - 1] == null) {
      finished = true;
    }
    else {
        options.uri = links[links.length - 1];
    }
    await scrapeAllPages(links, difficultyJson);
  }
  //console.log(JSON.stringify(difficultyJson, null, 2));
  fs.writeFile('../difficultylist.json', JSON.stringify(difficultyJson, null, 2), () => {
    console.log('Finished writing');
  });
}

function initializeJson() {
  var difficultyJson = {};
  difficultyJson = {'singles': {}, 'doubles': {}};
  for (var i = 1; i < 20; i++) {
    difficultyJson['singles'][i] = [];
    difficultyJson['doubles'][i] = [];
  }
  return difficultyJson;
}

async function scrapeLinks() {
  var difficultyJson = {};
  return rp(options)
    .then(($) => {
      links = getNextPage($);
      var nextPageLink = links[0];
      console.log("Scraping Remywiki's list of DDR Songs. This might take a while...")
      return links;
    })
    .catch((err) => {
      console.log(err);
    });
}

function scrapeIndividualPage(link) {
  options2.uri = link;
  return rp(options2)
    .then(($) => {
      if (songscraper.isCutCSExclusive($)) {
        return 0;
      }
      var currDifficulty = songscraper.getDifficulty($);
      if (currDifficulty.length == 0) {
        return 0;
      }
      currDifficulty.push(link);
      return currDifficulty;
    })
    .catch((err) => {
      console.log(link);
      console.log(err);
    });
}

function removeInvalidEntries(difficulty) {
  var filteredDifficulty = [];
  difficulty.forEach((entry) => {
    if (entry != 0) {
      filteredDifficulty.push(entry);
    }
  });
  return filteredDifficulty;
}

async function scrapeAllPages(links, difficultyJson) {
  var promises = [];
  links.forEach((link) => {
    if (link.includes('index.php') || link.includes('undefined') || link == null) {
      return;
    }
    promises.push(scrapeIndividualPage(link));
  });

  return Promise.all(promises)
    .then((difficulty) => {
      var tracker;
      try {
      var filteredDifficulty = removeInvalidEntries(difficulty);
      filteredDifficulty.forEach((difficultyArray) => {
        tracker = difficultyArray;
        if(difficultyArray == undefined) {
          return;
        }
        if(difficultyArray.length != 10) {
          return;
        }
        for(var j = 0; j < 5; j++) {
          if(difficultyArray[j] == 'N/A') {
            continue;
          }
          difficultyJson['singles'][difficultyArray[j]].push(difficultyArray[9]);
        }
        for(var j = 5; j < 9; j++) {
          if(difficultyArray[j] == 'N/A') {
            continue;
          }
          difficultyJson['doubles'][difficultyArray[j]].push(difficultyArray[9]);
        }
      });
    }
    catch(error) {
      console.log(tracker);
      console.log(error);
    }
    })
    .catch((err) => {
      console.log(err);
    });
}

function getNextPage($) {
  var candidates = $('#mw-pages').find('a');
  var nextPageLink;
  var links = [];
  candidates.each(function(i, elem) {
    if($(this).text().includes('next page')) {
      nextPageLink = $(this).attr('href');
      return;
    }
    links.push('https://remywiki.com' + $(this).attr('href'));
  });
  links.push('https://remywiki.com' + nextPageLink);
  return links;
}

scrape();
