var rocky = require('rocky');

var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 
  'Oct', 'Nov', 'Dec'];
var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];



var mfl = null;

//rocky.postMessage({command: 'mfl-season'});



rocky.on('draw', function(drawEvent) {
	
  var ctx = drawEvent.context;
  var w = ctx.canvas.unobstructedWidth;
  //var h = ctx.canvas.unobstructedHeight;
  //var obstruction_h = (ctx.canvas.clientHeight - ctx.canvas.unobstructedHeight) / 2;

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

  // DATE
//   ctx.fillStyle = 'lightgray';
//   var clockDate = dayNames[d.getDay()] + ' ' + d.getDate() + ' ' + 
//                     monthNames[d.getMonth()] + ', ' + d.getFullYear();
//   ctx.font = '18px bold Gothic';
//   ctx.textAlign = 'center';
  //ctx.fillText(clockDate, w / 2, 29);

  // COLON BLINK MASK
  //if (!(d.getSeconds() % 2)) {
  //  ctx.fillStyle = 'black';
  //  ctx.fillRect(66, 72 - obstruction_h, 12, 26);
  //}

  // MFL	
  if (mfl.length > 0) {
    ctx.fillStyle = 'white';
		var mflText = 'Season\n';
		
		for(var result in mfl){
			mflText += '-'+ mfl[result].league + ' #' + mfl[result].seasonRank + ' PD:' + mfl[result].pointDifferential + '\n';
		}
		mflText +='This Week\n';
		for(var result2 in mfl){
			mflText += '-'+mfl[result2].league + ' #' + mfl[result2].rank + ' S:' + mfl[result2].score + '\n';
		}
		
		
    ctx.font = '18px bold Gothic';
    ctx.textAlign = 'left';
    ctx.fillText(mflText, 3, 22);
  }

});

rocky.on('message', function(event) {
	if(event.data.command === 'mfl') {
		
    mfl = event.data.results;
		rocky.requestDraw();
  }
	if(event.data.command === 'settings') {
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
	else {
		rocky.requestDraw();
	}
  
});

rocky.on('daychange', function(e) {
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