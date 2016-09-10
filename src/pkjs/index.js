var results = [];
var myLeagues = [{ league: '47859', id: '0001' }, { league: '11902', id: '0008' }, { league: '19480', id: '0004' }];


Pebble.on('message', function(event) {
  if(event.data.command === 'mfl') {
    getMfl();
  }
});


function processMflResponse(e){
	if (this.readyState === 4) {
		if (this.status === 200) {
			var response = JSON.parse(this.response);
			
			for(var franchise in response.liveScoring.franchise ){
				var myFranchise = response.liveScoring.franchise[franchise];

				if(myFranchise.id === myLeagues[this.league].id){
					var rank = 1;
					for(var otherFranchise in response.liveScoring.franchise){
						if(parseFloat(response.liveScoring.franchise[otherFranchise].score) > parseFloat(myFranchise.score)){
							rank++;
						}
					}
					var data = {
						league: myLeagues[this.league].league,
						score: myFranchise.score,
						rank: rank
					};
					results.push(data);
				}

			}
			console.log('results: ' + JSON.stringify(results));
		} else {
			console.log('Error');
		}
	}
	if(results.length === myLeagues.length)
		Pebble.postMessage(results);
}



function getMfl() {
	results = [];
	for(var i in myLeagues){	
		var req = new XMLHttpRequest();  
		
		req.league = i;
		
		
		console.log('iterator :' + req.league );
		console.log('url:' + 'http://www64.myfantasyleague.com/2016/export?TYPE=liveScoring&L='+ myLeagues[req.league].league +'&W=&JSON=1');
		
  	req.open('GET', 'http://www64.myfantasyleague.com/2016/export?TYPE=liveScoring&L='+ myLeagues[req.league].league +'&W=&JSON=1', true);
  	req.onload = processMflResponse;
  	req.send(null);
	}
}







