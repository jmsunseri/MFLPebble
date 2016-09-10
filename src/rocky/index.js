var rocky = require('rocky');

var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 
  'Oct', 'Nov', 'Dec'];
var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];



var mfl = null;





rocky.on('draw', function(drawEvent) {
  var ctx = drawEvent.context;
  var w = ctx.canvas.unobstructedWidth;
  var h = ctx.canvas.unobstructedHeight;
  var obstruction_h = (ctx.canvas.clientHeight - ctx.canvas.unobstructedHeight) / 2;

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
  ctx.font = '42px bold numbers Leco-numbers';
  ctx.textAlign = 'center';
  ctx.fillText(clockTime, w / 2, 26 - obstruction_h);

  // DATE
  ctx.fillStyle = 'lightgray';
  var clockDate = dayNames[d.getDay()] + ' ' + d.getDate() + ' ' + 
                    monthNames[d.getMonth()] + ', ' + d.getFullYear();
  ctx.font = '18px bold Gothic';
  ctx.textAlign = 'center';
  ctx.fillText(clockDate, w / 2, 70 - obstruction_h);

  // COLON BLINK MASK
  //if (!(d.getSeconds() % 2)) {
  //  ctx.fillStyle = 'black';
  //  ctx.fillRect(66, 72 - obstruction_h, 12, 26);
  //}

  // MFL
  if (mfl.length > 0) {
    ctx.fillStyle = 'white';
		var mflText = '';
		
		for(var result in mfl){
			mflText += 'L:' + mfl[result].league + ' S:' + mfl[result].score + ' R:' + mfl[result].rank + '\n';
		}
		
		
		console.log(mflText);
    ctx.font = '18px bold Gothic';
    ctx.textAlign = 'left';
    ctx.fillText(mflText, 10, 90 - obstruction_h);
  }

});

rocky.on('message', function(event) {
 	mfl = event.data;
	rocky.requestDraw();
});

rocky.on('secondchange', function(e) {
  
});

rocky.on('minutechange', function(e) {
	//rocky.requestDraw();
  rocky.postMessage({command: 'mfl'});
});

rocky.on('hourchange', function(e) {
  //rocky.postMessage({command: 'weather'});
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