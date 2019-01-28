//homework solution 6 
var mysql = require("mysql");
var friends = [];
var connection;
if (process.env.JAWSDB_URL) {
  connection = mysql.createConnection(process.env.JAWSDB_URL);
} else {
  var connection = mysql.createConnection({
    host: "localhost",
    port: 3307,
    user: "root",
    password: "root",
    database: "friends_db"
  });
}

connection.connect(function(err) {
  if (err) {
    console.error("error connecting: " + err.stack);
  }
  loadProfiles();
});

function loadProfiles() {
  // Selects all of the data from the MySQL profiles table
  connection.query("SELECT * FROM profiles", function(err, res) {
    if (err) throw err;
    //a fun trick for converting mysql's returned 'rowPacketData' obj into more usable JSON
    var data = JSON.stringify(res);
    data = JSON.parse(data);
    // loop over your data converting the string of numbers into an array
    for (var profile of data) {
      profile.scores = profile.scores.split(",");
    }
    friends = data;
  });
}

function writeProfile(userData) {
  var name = userData.name;
  var photo = userData.photo;
  var scores = userData.scores;

  scores = scores.join(",");

  connection.query(
    "INSERT INTO profiles(name, photo, scores) VALUES (?, ?, ?)",
    [name, photo, scores],
    function(err, res) {
      if (err) throw err;
      console.log(res);
      loadProfiles();
    }
  );
}

function findMatch(userData) {
  var bestMatch = {
    name: "",
    photo: "",
    friendDifference: Infinity
  };

  var userScores = userData.scores;

  var totalDifference;

  for (var i = 0; i < friends.length; i++) {
    var currentFriend = friends[i];
    totalDifference = 0;

    for (var j = 0; j < currentFriend.scores.length; j++) {
      var currentFriendScore = currentFriend.scores[j];
      var currentUserScore = userScores[j];
      totalDifference += Math.abs(
        parseInt(currentUserScore) - parseInt(currentFriendScore)
      );
    }

    if (totalDifference <= bestMatch.friendDifference) {
      bestMatch.name = currentFriend.name;
      bestMatch.photo = currentFriend.photo;
      bestMatch.friendDifference = totalDifference;
    }
  }
  return bestMatch;
}

module.exports = function(app) {
  app.get("/api/friends", function(req, res) {
    res.json(friends);
  });

  app.post("/api/friends", function(req, res) {
    var userData = req.body;
    writeProfile(userData);
    res.json(findMatch(userData));
  });
};
