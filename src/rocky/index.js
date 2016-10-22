var rocky = require('rocky');

//var mfl = null;
var mflText = "INITIALIZING....";
var settings = null;

rocky.postMessage({command: 'settings'});


//we needed these stupid init variables because the events would fire when the watch face is first loaded.  don't really need to fetch data at this time
var init = { daychange: true, minutechange: true };


rocky.on('draw', function(drawEvent) {
	
	console.log('draw requested');
	
  var ctx = drawEvent.context;
  var w = ctx.canvas.unobstructedWidth;
	
	var backgroundColor = 'white';
	var textColor = 'black';
	
	if(settings) {
		backgroundColor = settings.backgroundColor;
		textColor = settings.textColor;
	}
	
	

  ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
	
	ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
	
	
  var d = new Date();
  ctx.fillStyle = textColor;

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
	
	ctx.fillStyle = textColor;
	ctx.font = '18px bold Gothic';
	ctx.textAlign = 'left';
  ctx.fillText(mflText, 3, 22);

});

rocky.on('message', function(event) {
	console.log('message received: ');
	
	if(event.data.command === 'mfl') {	
			//mfl = event.data.results;
		console.log('watchface text received: '+ event.data.text);
			
			mflText = event.data.text;
			
			rocky.requestDraw();
  }
	if(event.data.command === 'settings') {
		settings = event.data.settings;
		
		console.log('the settings have arrived on the watch: ' + JSON.stringify(settings));
  }

});

rocky.on('secondchange', function(e) {
  
});
	
rocky.on('minutechange', function(e) {
	if (!init.minutechange) {
		var d = new Date();	
		if(!(d.getMinutes() % 5) || mflText === '' ) {
			rocky.postMessage({command: 'mfl'});
		}
	} else {
		init.minutechange = false;
	}
	rocky.requestDraw();
});

rocky.on('daychange', function(e) {
	console.log('getting season long data due to date change');
	if (!init.daychange) {
		rocky.postMessage({command: 'mfl-season'});
	} else {
		init.daychange = false;
	}
  	
	
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