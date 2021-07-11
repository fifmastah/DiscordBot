const Discord = require("discord.js");
const client = new Discord.Client();
const fetch = require("node-fetch");
// require("dotenv").config();
client.login("");

// verification below that green bot now works

client.on("ready", () => {
  console.log("bot is now functional");
});

// function below that replies with a preset tenor gif depending on input

async function returnGif(msg) {
  if (msg.content == "gif") {
    let url =
      "https://api.tenor.com/v1/search?q=INSERT_SEARCH_HERE&key=B6HL64R1N8HZ&limit=8";
    let response = await fetch(url);
    let json = await response.json();
    console.log(json);
    msg.reply(json.results[0].url);
  }
}
client.on("message", returnGif);

// function below that allows bot to join voicecall to initiate music playing

client.on("message", async (msg) => {
  if (!msg.guild) return;

  if (
    msg.content == "-join" &&
    msg.member.voice.channel &&
    msg.channel.id == "717931793222729740"
  ) {
    const connection = await msg.member.voice.channel.join();
  }
});

/* function below that calls back to youtubePlayer,
which will begin the video searching process */

function forwardyoutubePlayer(msg) {
  youtubePlayer(msg).catch((error) => {
    console.log("errr");
    console.log(error);
  });
}
client.on("message", forwardyoutubePlayer);

/* collection array below stores the url for the respective video search,
which is accomplished with the yt-search module.

titles array below stores the title of the search as expected

searching and selecting boolean below allow for the music to only be played when the /p is initiated,
and separates the stages of playing into searching and selecting.
 */

var collection = [];
var titles = [];
var searching = false;
var selecting = false;

/* function below that allows playing and searching to be initiated
and also allows the removal of the bot from the voicechat */

async function youtubePlayer(msg) {
  if (msg.content == `/p` && msg.channel.id == "717931793222729740") {
    searching = true;
    arrayKill();
  }
  if (msg.content == "/d") {
    msg.guild.me.voice.channel.leave();
  }
}

/* function below actually searches using the yt-search module,
and subsequently stores the results given to the r variable into
collection and titles */

async function secondyoutubePlayer(msg) {
  if (msg.author.bot) {
    return;
  }
  if (searching == false) {
    return;
  }

  if (msg.content == "/p") {
    return;
  }

  if (msg.channel.id == "717931793222729740") {
    const yts = require("yt-search");
    const r = await yts(msg.content);
    const videos = r.videos.slice(0, 3);
    videos.forEach((v) => {
      console.log(v);
      collection.push(v.url);
      titles.push(v.title);
      const views = String(v.views).padStart(10, " ");
      console.log(
        `${views} // ${v.title} (${v.timestamp}) // ${v.author.name}`
      );
      msg.channel.send(
        `${views} // ${v.title} (${v.timestamp}) // ${v.author.name}`
      );
    });
    searching = false;
    selecting = true;
  }
}

/* after the selection has been finished, the function below allows the user to pick
songs based on the results the bot outputs to the channel. The bot takes in indexes to the
collections array and the array sends the url to the ytdl module, which is the module that actually
plays the song, as opposed to yt-search which just searched for the song */

client.on("message", secondyoutubePlayer);

async function thirdYoutubePlayer(msg) {
  if (msg.author.bot) {
    return;
  }
  if (selecting == false) {
    return;
  }

  const ytdl = require("ytdl-core");
  const connection = await msg.member.voice.channel.join();
  const dispatcher = connection.play(
    ytdl(collection[msg.content], { filter: "audioonly" })
  );
  if (
    msg.content == "0" ||
    msg.content == "1" ||
    msg.content == "2" ||
    msg.content == "3" ||
    msg.content == "4" ||
    msg.content == "5"
  ) {
    msg.channel.send(`Currently playing ${titles[0]}`);
  }
  selecting = false;
}

// function below that erases json data from arrays for repeated use of the bot's music functionality

client.on("message", thirdYoutubePlayer);
function arrayKill() {
  collection = [];
  titles = [];
}
