const rp = require("request-promise");
const cheerio = require("cheerio");
const encoder = require("encoding-japanese");
const fs = require("fs");

var active = false;
var thread;

module.exports = {
  name: "newsupdate",
  description: "!newsupdate - Toggle scraping of latest DDR updates from p.eagate.573.jp",
  execute(message, args) {
    if (args.length != 0) {
      message.channel.send("No arguments needed.");
      return;
    }
    active = !active;
    if (active) {
      fetchMostRecentUpdate(message);
      thread = setInterval(fetchMostRecentUpdate, 15*60*1000, message);
    }
    else
      clearInterval(thread);

    message.channel.send("Latest DDR updates will " + (!active ? "not " : "") + "be posted.");
  }
}

async function fetchMostRecentUpdate(message) {
  var newUpdate;
  await rp({
    uri: "https://p.eagate.573.jp/game/ddr/ddra/p/info/index.html",
    encoding: "binary",
    transform: resp => cheerio.load(resp, { decodeEntities: false })
  })
  .then($ => newUpdate = $(".news_one"))
  .catch(console.log);
  if (newUpdate.length == 0)
    return;

  newUpdate = newUpdate.eq(0);

  var date = newUpdate.find("div .date").eq(0);

  const filename = "./lastupdatetime.txt";
  var oldDate = fs.existsSync(filename) ? fs.readFileSync(filename, "utf8").trim() : "";
  console.log(oldDate);
  if (oldDate.valueOf() == date.text())
    return;

  var imgs = newUpdate.find("img");
  var pgrh = newUpdate.find("p");

  var text = "**NEW UPDATE** (" + date.text() + ")\n";
  for (var i = 0; i < pgrh.length; ++i) {
    if (i > 0)
      text += "########";
    var enc = encoder.convert(pgrh.eq(i).text(), {
      to: "UNICODE",
      from: "SJIS",
    });

    enc = enc.replace(new RegExp("         ", 'g'), "####");

    await rp({
      method: "POST",
      uri: "https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20180919T032215Z.817bf29b9fe471d6.fcca1eb61bb5e8dd4f2b1c87049d9451348d19b9&lang=ja-en",
      form: {text: enc},
      transform: resp => JSON.parse(resp)
    })
    .then(json => text += json.text);
  }
  text = text.replace(new RegExp("####", 'g'), '\n').trim();

  for (var i = 0; i < imgs.length; ++i) {
    text += "\n\n" + imgs.eq(i).attr("src");
  }

  message.channel.send(text);
}
