// Our Twitter library
const Twit = require("twit");

// 0 = No allowlist
// 1 = Allowlist
// 2 = Strictlist
var botMode = 1;

// We need to include our configuration file
const twit = new Twit(require("./config.js"));
var hastagSearch = { q: '#DefendPDX', count: 10, result_type: 'recent' }
var tweetid

//Load Previous Retweeted ID's
var fs = require('fs')
var beenTweeted = fs.readFileSync('beenTweeted.txt').toString().split("\n")
for(var i = 0; i < beenTweeted.length; ++i)
	//remove R
	beenTweeted[i] = beenTweeted[i].replace("\r","")

//Load Allowed List
var allowlist = fs.readFileSync('allowlist.txt').toString().split("\n")
for(var i = 0; i < allowlist.length; ++i)
	//remove R
	allowlist[i] = allowlist[i].replace("\r","")


function retweet () {
	  twit.get('search/tweets', hastagSearch, function (error, data) {
    var tweets = data.statuses
    // If our search request to the server had no errors...
    if (!error) {
		for (var b = 0; b < 10; b++) {
			if(data.statuses[b] === undefined){
				//console.log("[" + b + "] is undefined.");
			} else {
				var screen_name = data.statuses[b].user.screen_name;
				var tweetid = data.statuses[b].id_str;
				var checkAllow = allowlist.includes(screen_name);
				var checkTweet = beenTweeted.includes(tweetid);

				//Check if User is on allowlist
				if(checkAllow === true){
					
					//Check if Tweet has already been tweeted
					if(checkTweet === false){
						
							//Set Variable for Link
							var screen_name = data.statuses[b].user.screen_name
							var tweetid = data.statuses[b].id_str
							
							//Set Link to be retweeted for embedding (retweet with comment)
							var post = "https://twitter.com/" + screen_name + "/status/" + tweetid
							
							//Push Tweet ID to Array
							beenTweeted.push(tweetid);
							
							//Write Tweeted Material to File
							var file = fs.createWriteStream('beenTweeted.txt');
							file.on('error', function(err) { Console.log(err) });
							beenTweeted.forEach(value => file.write(`${value}\r\n`));
							file.end();
							
							//POST Tweet to Account with variables
							twit.post('statuses/update', {status: "[#DefendPDX] Repeater: View tweet by @" + screen_name + " below: \r\n" + post}, tweeted)
							
							//Alert Console.
							console.log(screen_name + " has been retweeted");
					} 
				}
			}
		}
	
    }
    // However, if our original search request had an error, we want to print it out here.
    else {
      if (debug) {
        console.log('There was an error with your hashtag search:', error)
      }
    }
  })
}

// Make sure it worked!
function tweeted (err, reply) {
  if (err !== undefined) {
    console.log(err)
  } else {
    console.log('Tweeted: ' + reply)
  }
}


// Try to retweet something as soon as we run the program...
//retweetDefend();
retweet();
// ...and then every hour/half thereafter. Time here is in milliseconds, so
// 1000 ms = 1 second, 1 sec * 60 = 1 min, 1 min * 60 = 1 hour --> 1000 * 60 * 60
setInterval(retweet, 1000 * 60); //Current Set to 1 Minute