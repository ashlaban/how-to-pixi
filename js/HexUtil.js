

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