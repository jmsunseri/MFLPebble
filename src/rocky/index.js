var rocky = require('rocky');

var mfl = null;
var mflText = "foo";
var settings = null;

//rocky.postMessage({command: 'settings'});



rocky.on('draw', function(drawEvent) {
	
	console.log('draw requested');
	
  var ctx = drawEvent.context;
  var w = ctx.canvas.unobstructedWidth;

  ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
  var d = new Date();
  ctx.fillStyle = 'white';

  // TIME
	
	var hours = d.getHours();
	if(hours > 12)
		hours -= 12;
	else if(hours === 0)
		hours = 12;
	
  var clockTime = leftpad(hours, 2, 0) + ':' + 
                    leftpad(d.getMinutes(), 2, 0); // TODO: Detect 24h
  ctx.font = '28px bold Gothic';
  ctx.textAlign = 'center';
  ctx.fillText(clockTime, w / 2, 0);

  // MFL	
	
	ctx.fillStyle = 'white';
	ctx.font = '18px bold Gothic';
	ctx.textAlign = 'left';
  ctx.fillText(mflText, 3, 22);

});

rocky.on('message', function(event) {
	if(event.data.command === 'mfl') {	
		if(event.data.results && event.data.results.length > 0)
		{
			mfl = event.data.results;
			if (mfl && mfl.length > 0) {
				mflText = 'Season\n';
				for(var result in mfl){
					if(mfl[result].seasonScoreAvailable){
						mflText += '-'+ mfl[result].league + ' #' + mfl[result].seasonRank + ' PD:' + mfl[result].pointDifferential + '\n';
					}
					else {
						mflText += '-'+ mfl[result].league + ' N/A\n';
					}
				}
				mflText +='This Week\n';
				for(var result2 in mfl){
					mflText += '-'+mfl[result2].league + ' #' + mfl[result2].rank + ' S:' + mfl[result2].score + '\n';
				}
			}
			rocky.requestDraw();
		}
		else {
			console.log('mfl message received with no contents');
		}
  }
	if(event.data.command === 'settings') {
		settings = event.data.settings;
		
		console.log('the settings have arrived on the watch: ' + JSON.stringify(settings));
		
   	rocky.postMessage({command: 'mfl'});
  }
});

rocky.on('secondchange', function(e) {
  
});
rocky.on('minutechange', function(e) {
	var d = new Date();	
	if(!(d.getMinutes() % 5) || !mfl ) {
		
		rocky.postMessage({command: 'mfl'});
	}
	//else {
		rocky.requestDraw();
	//}
  
});

rocky.on('daychange', function(e) {
	console.log('getting season long data');
  rocky.postMessage({command: 'mfl-season'});
});








function leftpad(str, len, ch) {
  str = String(str);
  var i = -1;
  if (!ch && ch !== 0) ch = ' ';
  len = len - str.length;
  while (++i < len) {
    str = ch + str;
  }
  return str;
}