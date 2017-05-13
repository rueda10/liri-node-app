var spotify = require("spotify");
var sprintf = require("sprintf-js").sprintf;
var request = require("request");
var Twitter = require("Twitter");
var fs = require("fs")
var twitterKeys = require("./keys.js");

const OUTPUT_FILE = "./log.txt";
const SECTION_SEPARATOR = "###########################################\n";

// get command line arguments
var command = process.argv[2];
var argument = process.argv[3];
// check if process.argv.length greater than 4?

if (command != null) {
  if (command === 'do-what-it-says') {
    runRandomCommand();
  } else {
    runCommands();
  }
} else {
  usage();
}

/**
 * Command switch statement
 */
function runCommands() {
  switch(command) {
    case 'my-tweets':
      printTweets();
      break
    case 'spotify-this-song':
      printSongInfo();
      break;
    case 'movie-this':
      printMovieInfo();
      break;
    default:
      usage();
  }
}

/**
 * Runs random command
 */
function runRandomCommand() {
  fs.readFile("random.txt", "utf8", function(error, data) {
    data = data.split(",");
    command = data[0];
    if (data.length === 2) {
      argument = data[1];
      argument = argument.replace(/['"]+/g, '')
    }
    runCommands();
  });
}

/**
 * Prints tweets
 */
function printTweets() {
  var client = new Twitter(twitterKeys.twitterKeys);
  var params = {screen_name: 'rueda_dev'};
  client.get('statuses/user_timeline', params, function(twitterError, tweets, response) {
    if (!twitterError) {
      tweets.forEach(function(tweet, index) {
        if (index === 20) {
          return false;
        }
        var messageOutput = tweet.created_at;
        messageOutput += "\n\'" + tweet.user.screen_name + '\' says: ';
        messageOutput += "\n" + tweet.text + "\n";

        console.log(messageOutput);
        fs.appendFile(OUTPUT_FILE, messageOutput, function(appendError) {
          if (appendError) { console.log(appendError); }
        });
      });
      fs.appendFile(OUTPUT_FILE, SECTION_SEPARATOR, function(appendError) {} );
    } else {
      console.log("An error ocurred: " + twitterError);
    }
  });
}

/**
 * Prints song info
 */
function printSongInfo() {
  // If no song is specified in command line, search for The Sign
  if (argument === undefined) {
    argument = 'The Sign';
  }
  // Run spotify's search command
  spotify.search({ type: 'track', query: argument }, function(err, data) {
    if ( err ) {
      console.log('Error occurred: ' + err);
      return;
    }
    // Iterate through songs
    data.tracks.items.forEach(function(item) {
      // if song name in object is equal to song name argument, print info
      if (item.name.toLowerCase().trim() === argument.toLowerCase().trim()) {
        var artists = "";
        item.artists.forEach(function(artist) {
          artists += artist.name + ", ";
        });
        artists = artists.slice(0, -2);

        var messageOutput = "Artists: " + artists;
        messageOutput += "\nSong name: " + item.name;
        messageOutput += "\nPreview link: " + item.preview_url;
        messageOutput += "\nAlbum: " + item.album.name + "\n";
        console.log(messageOutput);
        fs.appendFile(OUTPUT_FILE, messageOutput, function(appendError) {
          if (appendError) { console.log(appendError); };
        });
      }
    });
    fs.appendFile(OUTPUT_FILE, SECTION_SEPARATOR, function(appendError) {});
  });
}

/**
 * Prints movie info
 */
function printMovieInfo() {
  // If no movie is specified in command line, search for Mr. Nobody
  if (argument === undefined) {
    argument = 'Mr. Nobody';
  }

  // run request
  request('http://www.omdbapi.com/?t=' + argument.trim() + '&y=&plot=short&r=json', function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var messageOutput = "Title: " + JSON.parse(body).Title;
      messageOutput += "\nYear: " + JSON.parse(body).Year;
      messageOutput += "\nIMDB Rating: " + JSON.parse(body).imdbRating;
      messageOutput += "\nCountry/Countries of production: " + JSON.parse(body).Country;
      messageOutput += "\nLanguage: " + JSON.parse(body).Language;
      messageOutput += "\nPlot: " + JSON.parse(body).Plot;
      messageOutput += "\nActors: " + JSON.parse(body).Actors;
      messageOutput += "\nRotten Tomatoes URL: " + JSON.parse(body).Website + "\n";
      console.log(messageOutput);
      messageOutput += SECTION_SEPARATOR;
      fs.appendFile(OUTPUT_FILE, messageOutput, function(appendError) {
        if (appendError) { console.log(appendError); }
      });
    } else {
      console.log("Error making request: " + error);
    }
  });
}

/**
 * Displays the correct usage to the screen when the user runs the app
 * with incorrect commands/arguments
 */
function usage() {
  console.log("usage: node liri.js my-tweets|spotify-this-song|movie-this|do-what-it-says ['<song name>'] ['<movie name>']");
  var command = "options:";
  console.log(sprintf("%" + (command.length + 4) + "s", "options:"));
  command = "my-tweets:";
  var description = "Displays last 20 tweets.";
  console.log(sprintf("%" + (command.length + 8) + "s%" + (description.length + 10) + "s", command, description));
  command = "spotify-this-song:";
  description = "Displays song information for '<song name>'.";
  console.log(sprintf("%" + (command.length + 8) + "s%" + (description.length + 2) + "s", command, description));
  var example = "Example: node liri.js spotify-this-song 'Hey Jude'";
  console.log(sprintf("%" + (example.length + 12) + "s", example));
  command = "movie-this:";
  description = "Displays movie information for '<movie name>'.";
  console.log(sprintf("%" + (command.length + 8) + "s%" + (description.length + 9) + "s", command, description));
  example = "Example: node liri.js movie-this 'Rogue One'";
  console.log(sprintf("%" + (example.length + 12) + "s", example));
  command = "do-what-it-says:";
  description = "Randomly runs one of the commands listed above.";
  console.log(sprintf("%" + (command.length + 8) + "s%" + (description.length + 4) + "s", command, description));
}
