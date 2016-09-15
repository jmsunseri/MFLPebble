var results = [];
var myLeagues = [ { league: '11902', id: '0008' }, { league: '19480', id: '0004' }, { league: '47859', id: '0001' }]; // 

var seasonLongResults = [];

var _ = require('../common/underscore');

// var Clay = require('./clay');
// // Load our Clay configuration file
// var clayConfig = require('./config');
// Initialize Clay
// var clay = new Clay(clayConfig, null, { autoHandleEvents: false });

Pebble.on('message', function(event) {
  if(event.data.command === 'mfl') {
    getMfl();
  }
	if(event.data.command === 'mfl-season') {
    getMflSeasonResults();
  }
// 	else if (event.data.command === 'settings') {
// 		console.log('restoring settings');
//     restoreSettings();
//   }
});



// Pebble.addEventListener('showConfiguration', function(e) {
// 	console.log('opening url');
//   Pebble.openURL(clay.generateUrl());
// });

// Pebble.addEventListener('webviewclosed', function(e) {
// 	console.log('web view closed');
//   if (e && !e.response) {
//     console.log('exiting without doing anything!!');
// 		return;
//   }

//   // Return settings from Config Page to watch
//   var settings = clay.getSettings(e.response, false);

// 	console.log('settings: ' + JSON.stringify(settings));
	
	
//   // Flatten to match localStorage version
//   var settingsFlat = {};
//   Object.keys(settings).forEach(function(key) {
//     if (typeof settings[key] === 'object' && settings[key]) {
//       settingsFlat[key] = settings[key].value;
//     } else {
//       settingsFlat[key] = settings[key];
//     }
//   });
	
// 	//Do processing here to update myLeagues variable
// 		console.log('settings flat: ' + JSON.stringify(settingsFlat));

//   Pebble.postMessage({command: 'mfl'});
// });

// function restoreSettings() {
//   // Restore settings from localStorage and send to watch
//   var settings = JSON.parse(localStorage.getItem('clay-settings'));
//   if (settings) {
// 		//Do processing here to update myLeagues variable
// 		console.log(JSON.stringify(settings));
//     Pebble.postMessage({command: 'mfl'});
//   }
// }




function processMflSeasonResponse(e){
	if (this.readyState === 4) {
		if (this.status === 200) {
			
			var rows = [];
			var response = JSON.parse(this.response);
			for(var fran in response.leagueStandings.franchise ){
				var franchise = response.leagueStandings.franchise[fran];
				rows.push({ id: franchise.id, pf: parseFloat(franchise.pf) });
			}
			seasonLongResults.push({ league: myLeagues[this.league].league, scores: _.sortBy(rows, 'id') });
			if(seasonLongResults.length === myLeagues.length)
			{
				seasonLongResults = _.sortBy(seasonLongResults, 'league');	
			}
		}
			
	} else {
		console.log('Error');
	}
}		


function processMflResponse(e){
	if (this.readyState === 4) {
		if (this.status === 200) {
			var response = JSON.parse(this.response);
			
			response.liveScoring.franchise = _.sortBy(response.liveScoring.franchise, 'id');
			
			for(var fran in response.liveScoring.franchise ){
				var franchise = response.liveScoring.franchise[fran];			
				if(franchise.id === myLeagues[this.league].id){
					var weeklyRank = 1;
					var seasonRank = 1;
					var losingBy = 0;
					var leadingBy = 1000000;
										
					var mySeasonScore = parseFloat(franchise.score) +  seasonLongResults[this.league].scores[fran].pf;
		
					for(var otherFranchise in response.liveScoring.franchise){
											
						var theirSeasonScore = parseFloat(response.liveScoring.franchise[otherFranchise].score) + 
							seasonLongResults[this.league].scores[otherFranchise].pf;						
						
						if(parseFloat(response.liveScoring.franchise[otherFranchise].score) > parseFloat(franchise.score)){
							weeklyRank++;
						}
						
						var temp = mySeasonScore  - theirSeasonScore ;
						
						if( theirSeasonScore > mySeasonScore){
							seasonRank++;
							if(temp < losingBy)
								losingBy = temp;
						}
						else	
							{							
								if(temp < leadingBy && temp > 0)
									leadingBy = temp;
							}
						
					}
					var data = {
						league: myLeagues[this.league].league,
						score: franchise.score,
						rank: weeklyRank,
						seasonRank: seasonRank,
						seasonScore: mySeasonScore,
						pointDifferential: (losingBy === 0) ? '+' + leadingBy.toFixed(0) : losingBy.toFixed(0)
					};
					results.push(data);
				}

			}
			
		} else {
			console.log('Error');
		}
	}
	if(results.length === myLeagues.length)
		{
			results = _.sortBy(results, 'league');	
						
			Pebble.postMessage({command: 'mfl', results: results});
		}
		
}



function getMfl() {
	results = [];
	
	 
	
	for(var i in myLeagues){	
		var req = new XMLHttpRequest();  
		
		req.league = i;
			
  	req.open('GET', 'http://www64.myfantasyleague.com/2016/export?TYPE=liveScoring&L='+ myLeagues[req.league].league +'&W=&JSON=1', true);
  	req.onload = processMflResponse;
  	req.send(null);
	}
}

function getMflSeasonResults() {
	seasonLongResults = [];
	
	for(var i in myLeagues){	
		var req = new XMLHttpRequest();  
		
		req.league = i;
		
  	req.open('GET', 'http://www64.myfantasyleague.com/2016/export?TYPE=leagueStandings&L='+ myLeagues[req.league].league +'&W=&JSON=1', true);
  	req.onload = processMflSeasonResponse;
  	req.send(null);
	}
}









