var spotify = require("spotify");
var sprintf = require("sprintf-js").sprintf;
var request = require("request");
var Twitter = require("Twitter");
var fs = require("fs")
var twitterKeys = require("./keys.js");

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
  client.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {
      tweets.forEach(function(tweet, index) {
        if (index === 20) {
          return false;
        }
        console.log(tweet.created_at);
        console.log('\'' + tweet.user.screen_name + '\' says: ');
        console.log(tweet.text);
        console.log('');
      });
    } else {
      console.log("An error occurred: " + error);
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
        console.log("Artists: " + artists);
        console.log("Song name: " + item.name);
        console.log("Preview link: " + item.preview_url);
        console.log("Album: " + item.album.name);
        console.log("");
      }
    });
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
      console.log("Title: " + JSON.parse(body).Title);
      console.log("Year: " + JSON.parse(body).Year);
      console.log("IMDB Rating: " + JSON.parse(body).imdbRating);
      console.log("Country/Countries of production: " + JSON.parse(body).Country);
      console.log("Language: " + JSON.parse(body).Language);
      console.log("Plot: " + JSON.parse(body).Plot);
      console.log("Actors: " + JSON.parse(body).Actors);
      console.log("Rotten Tomatoes URL: " + JSON.parse(body).Website);
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
