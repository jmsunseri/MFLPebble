var results = [];
var myLeagues = [{ league: '47859', id: '0001' }, { league: '11902', id: '0008' }, { league: '19480', id: '0004' }];

var seasonLongResults = [];

var _ = require('underscore');

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
			seasonLongResults = [];
			
			
			var response = JSON.parse(this.response);
			
			for(var fran in response.liveScoring.franchise ){
				var franchise = response.liveScoring.franchise[fran];
				seasonLongResults.push({ id: franchise.id, pf: franchise.pf	});
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
			
			for(var fran in response.leagueStandings.franchise ){
				var myFranchise = response.liveScoring.franchise[fran];

				if(myFranchise.id === myLeagues[this.league].id){
					var weeklyRank = 1;
					for(var otherFranchise in response.liveScoring.franchise){
						if(parseFloat(response.liveScoring.franchise[otherFranchise].score) > parseFloat(myFranchise.score)){
							weeklyRank++;
						}
					}
					var data = {
						league: myLeagues[this.league].league,
						score: myFranchise.score,
						rank: weeklyRank
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
			//console.log('results: ' + JSON.stringify(results));
			_.sortBy(results, 'league');
			
			Pebble.postMessage({command: 'mfl', results: results});
		}
		
}



function getMfl() {
	results = [];
	
	 
	
	for(var i in myLeagues){	
		var req = new XMLHttpRequest();  
		
		req.league = i;
		
		
		//console.log('iterator :' + req.league );
		//console.log('url:' + 'http://www64.myfantasyleague.com/2016/export?TYPE=liveScoring&L='+ myLeagues[req.league].league +'&W=&JSON=1');
		
  	req.open('GET', 'http://www64.myfantasyleague.com/2016/export?TYPE=liveScoring&L='+ myLeagues[req.league].league +'&W=&JSON=1', true);
  	req.onload = processMflResponse;
  	req.send(null);
	}
}

function getMflSeasonResults() {
	for(var i in myLeagues){	
		var req = new XMLHttpRequest();  
		
		req.league = i;
		
		
		//console.log('iterator :' + req.league );
		//console.log('url:' + 'http://www64.myfantasyleague.com/2016/export?TYPE=liveScoring&L='+ myLeagues[req.league].league +'&W=&JSON=1');
		
  	req.open('GET', 'http://www64.myfantasyleague.com/2016/export?TYPE=leagueStandings&L='+ myLeagues[req.league].league +'&W=&JSON=1', true);
  	req.onload = processMflSeasonResponse;
  	req.send(null);
	}
}









