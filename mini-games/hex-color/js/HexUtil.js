HexUtil = {};
HexUtil.NO_PLAYER = 0;
HexUtil.PLAYER_1  = 1;
HexUtil.PLAYER_2  = 2;
HexUtil.PLAYER_3  = 3;
HexUtil.PLAYER_4  = 4;
HexUtil.PLAYER_5  = 5;
HexUtil.PLAYER_6  = 6;
HexUtil.PLAYER_7  = 7;

function log() {

	// function repeat(pattern, count) {
	//     if (count < 1) return '';
	//     var result = '';
	//     while (count > 1) {
	//         if (count & 1) result += pattern;
	//         count >>= 1, pattern += pattern;
	//     }
	// 	return result + pattern;
	// }
	// 

	var callerName = arguments.callee.caller.name;
	callerName = (callerName) ? (callerName) : ('Anonymous function');

	var args = Array.prototype.slice.call(arguments);
	console.log.apply(null, args);

	// console.log( callerName + ' :: ', arguments );

	// console.log( ' :: ' + callerName + ' :: ' );
	// console.log( msg );
	// console.log( repeat('-', callerName.length + 8) );
}