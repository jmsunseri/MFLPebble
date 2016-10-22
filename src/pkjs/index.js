var results = {};
//var myLeagues = [ { league: '11902', id: '0008' }, { league: '19480', id: '0004' }, { league: '47859', id: '0001' }]; // 
var myLeagues = {};
var seasonLongResults = {};
var uiSettings = {};

//var _ = require('../common/underscore');

var Clay = require('./clay');
// // Load our Clay configuration file
var clayConfig = require('./config');
// Initialize Clay
var clay = new Clay(clayConfig, null, { autoHandleEvents: false });

var getAllMfl = function() {
	results = {};
	console.log('get Mfl request received for all leagues: ' + JSON.stringify(myLeagues));
	
	Object.keys(myLeagues).forEach(function(league,index) {
		var req = new XMLHttpRequest();  
		
		req.league = league;
			
  	req.open('GET', 'http://www64.myfantasyleague.com/2016/export?TYPE=liveScoring&L='+ league +'&W=&JSON=1', true);
  	req.onload = processMflResponse;
  	req.send(null);
	});

};


var getMflForLeague = function(league) {
	console.log('getting live score for specific league: ' + league);
	
	var req = new XMLHttpRequest();  
		
	req.league = league;

	req.open('GET', 'http://www64.myfantasyleague.com/2016/export?TYPE=liveScoring&L='+ league +'&W=&JSON=1', true);
	req.onload = processMflResponse;
	req.send(null);
};






Pebble.on('message', function(event) {
  if(event.data.command === 'mfl') {
		console.log('getting all live scoring mfl data');
    getAllMfl();
  }
	else if(event.data.command === 'mfl-season') {
		console.log('getting all season long data');
    getMflSeasonResults();
  }
	else if (event.data.command === 'settings') {
		console.log('getting settings');
    getSettings();
  }
});



Pebble.addEventListener('showConfiguration', function(e) {
  Pebble.openURL(clay.generateUrl());
});


function processSettings(settings) {
		
	myLeagues = {};
	seasonLongResults = {};
	
	if(settings.LeagueOneNumber !== '' && settings.LeagueOneFranchiseNumber !== ''){
		myLeagues[settings.LeagueOneNumber] = settings.LeagueOneFranchiseNumber;
	}
	if( settings.LeagueTwoNumber !== '' && settings.LeagueTwoFranchiseNumber !== ''){
		myLeagues[settings.LeagueTwoNumber] = settings.LeagueTwoFranchiseNumber;
	}
	if( settings.LeagueThreeNumber !== '' && settings.LeagueThreeFranchiseNumber !== ''){
		myLeagues[settings.LeagueThreeNumber] = settings.LeagueThreeFranchiseNumber;
	}
	if(settings.LeagueFourNumber !== '' && settings.LeagueFourFranchiseNumber !== ''){
		myLeagues[settings.LeagueFourNumber] = settings.LeagueFourFranchiseNumber;
	}
	if(settings.LeagueFiveNumber !== '' && settings.LeagueFiveFranchiseNumber !== ''){
		myLeagues[settings.LeagueFiveNumber] = settings.LeagueFiveFranchiseNumber;
	}
	
	console.log('finished processing settings my Leagues: ' + JSON.stringify(myLeagues) );
	
	if(settings.WhiteOnBlack) {
		uiSettings.backgroundColor = 'black';
		uiSettings.textColor = 'white';
	}
	else {
		uiSettings.backgroundColor = 'white';
		uiSettings.textColor = 'black';
	}
	
	uiSettings.season = settings.SeasonSection;
	uiSettings.thisWeek = settings.ThisWeekSection;
	
	console.log('sending UI settings to watch');
	Pebble.postMessage({command: 'settings', settings: uiSettings});
	
	
}



Pebble.addEventListener('webviewclosed', function(e) {
	console.log('web view closed');
  if (e && !e.response) {
    console.log('exiting without doing anything!!');
		return;
  }

	console.log('raw response: ' + JSON.stringify(e) );
	
  //Return settings from Config Page to watch
  var settings =  clay.getSettings(e.response, false);
	
	var settingsFlat = {};
  Object.keys(settings).forEach(function(key) {
    if (typeof settings[key] === 'object' && settings[key]) {
      settingsFlat[key] = settings[key].value;
    } else {
      settingsFlat[key] = settings[key];
    }
  });
	
	
	processSettings(settingsFlat);
	
	console.log('setting settings: ' + JSON.stringify(settings));

  getMflSeasonResults();
});

function getSettings() {
  // Restore settings from localStorage and send to watch
	var settings = localStorage.getItem('clay-settings');
	
	console.log('settings from storage: ' + JSON.stringify(settings));
	
	settings = JSON.parse(settings);
	
	if(settings !== null){
		//Do processing here to update myLeagues variable		

		processSettings(settings);
		
		//refreshing data
		getMflSeasonResults();
	}
	else {
			console.log('settings are null Im opening clay');
			Pebble.openURL(clay.generateUrl());
		}
}




function processMflSeasonResponse(e){
	if (this.readyState === 4) {
		if (this.status === 200) {
			
			console.log('league: ' + this.league + ' starting processing standings response');
			
			var pfs = {};
			var response = JSON.parse(this.response);
			for(var fran in response.leagueStandings.franchise ){
				var franchise = response.leagueStandings.franchise[fran];
				pfs[franchise.id] = parseFloat(franchise.pf);
			}
			seasonLongResults[this.league].scores =  pfs; 
			
			console.log('league: '+ this.league +' completed processed standings response scores: ' + JSON.stringify(seasonLongResults[this.league].scores));
			
			getMflForLeague(this.league);
			
		}
			
	} else {
		console.log('Error');
	}
}		


function processMflResponse(e){
	if (this.readyState === 4) {
		if (this.status === 200) {
			var response = JSON.parse(this.response);
			
			console.log('league: ' + this.league +  ' starting processing live scoring mfl response received');

			var liveScoring = {};
			
			//flattening live scoring 
			for(var f in response.liveScoring.franchise){
				liveScoring[response.liveScoring.franchise[f].id] = response.liveScoring.franchise[f].score;
			}
			
			var weeklyRank = 1;
			var seasonRank = 1;
			var losingBy = 0;
			var leadingBy = 1000000;

			var mySeasonScore = 0;
			var isSeasonScoreAvailable = false;

			var today = new Date().getDay();
			
			//we don't add live scoring when it's tuesday or wednesday this would result in double counting
			var addLiveScoring = (today !== 2 && today !== 3);
			
			var myScoreThisWeek = parseFloat(liveScoring[myLeagues[this.league]]);
			
			if(seasonLongResults[this.league]){
				mySeasonScore = (addLiveScoring) ? myScoreThisWeek + seasonLongResults[this.league].scores[myLeagues[this.league]] : seasonLongResults[this.league].scores[myLeagues[this.league]];
				isSeasonScoreAvailable = true;
			}
			
			var thisLeague = this.league;
				
			Object.keys(liveScoring).forEach(function(franchise, index) {
				if(myLeagues[thisLeague] != franchise){
					var otherFranchiseSeasonScore = 0;
					var otherFranchiseScoreThisWeek = parseFloat(liveScoring[franchise]);
									
					if (seasonLongResults[thisLeague] && seasonLongResults[thisLeague].scores[franchise])
							otherFranchiseSeasonScore =  seasonLongResults[thisLeague].scores[franchise];
					
					otherFranchiseSeasonScore = (addLiveScoring) ? otherFranchiseScoreThisWeek + otherFranchiseSeasonScore : otherFranchiseSeasonScore;
					
					if(otherFranchiseScoreThisWeek > myScoreThisWeek){
							weeklyRank++;
						}
					
					var seasonScoreDifference = mySeasonScore  - otherFranchiseSeasonScore ;
						
						if(otherFranchiseSeasonScore > mySeasonScore){
							seasonRank++;
							if(seasonScoreDifference < losingBy)
								losingBy = seasonScoreDifference;
						}
						else	
							{							
								if(seasonScoreDifference < leadingBy && seasonScoreDifference > 0)
									leadingBy = seasonScoreDifference;
							}
						
					}
					
			});
			
			results[thisLeague] = {
						score: myScoreThisWeek,
						rank: weeklyRank,
						seasonRank: seasonRank,
						seasonScore: mySeasonScore,
						pointDifferential: (losingBy === 0) ? '+' + leadingBy.toFixed(0) : losingBy.toFixed(0),
						seasonScoreAvailable: isSeasonScoreAvailable
					};
				
			console.log('league: ' + this.league +  ' completed processing live scoring mfl response received ');
			
			
		} else {
			console.log('Error');
		}
	}
	if(Object.keys(results).length === Object.keys(myLeagues).length)
		{
			console.log('league: ALL live scoring results received!');
			
			var mflText = getWatchText();
						
			Pebble.postMessage({command: 'mfl', text: mflText});
		}
		
}

function getWatchText() {
	var mflText = "";
	var mflSeasonText = 'Season\n';
	var mflThisWeekText ='This Week\n';


	Object.keys(myLeagues).forEach(function(league, index){
		if(results[league].seasonScoreAvailable){
			mflSeasonText += '-'+ league + ' #' + results[league].seasonRank + ' PD:' + results[league].pointDifferential + '\n';
		}
		else {
			mflSeasonText += '-'+ league + ' N/A\n';
		}

		mflThisWeekText += '-'+ league + ' #' + results[league].rank + ' S:' + results[league].score + '\n';
	});

	if(uiSettings.season)
		mflText = mflSeasonText;
	if(uiSettings.thisWeek)
	 	mflText += mflThisWeekText;
				
	return mflText;	
}






function getMflSeasonResults() {
	Object.keys(myLeagues).forEach(function(league,index) {
		if(!seasonLongResults[league]){
			console.log('instantiating season long result object for '+ league);
			seasonLongResults[league] = {};
		}
		
		console.log('getting league standings for league: ' + league);
		
		var req = new XMLHttpRequest();  
    req.league = league;
  	req.open('GET', 'http://www64.myfantasyleague.com/2016/export?TYPE=leagueStandings&L='+ league +'&W=&JSON=1', true);
  	req.onload = processMflSeasonResponse;
  	req.send(null);
		
	});
}









