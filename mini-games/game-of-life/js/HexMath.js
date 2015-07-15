

var HexMath = (function () {

	var API = {};

	var direction = {
		north    : {x: 0, y: 1, z:-1},
		northEast: {x: 1, y: 0, z:-1},
		southEast: {x: 1, y:-1, z: 0},
		south    : {x: 0, y:-1, z: 1},
		southWest: {x:-1, y: 0, z: 1},
		northWest: {x:-1, y: 1, z: 0},
		nil      : {x:0, y:0, z:0}
	}
	direction.asArray = [ 	direction.north,
							direction.northEast,
							direction.southEast,
							direction.south,
							direction.southWest,
							direction.northWest ];
	
	var cos_60 = 0.5;
    var sin_60 = 0.86602540378;
	var hexPoints = [ -1      ,  0      ,
                                -cos_60 , -sin_60 , 
                                 cos_60 , -sin_60 , 
                                 1      ,  0      ,
                                 cos_60 ,  sin_60 ,
                                -cos_60 ,  sin_60
                                ];
	var hexShape  = new PIXI.Polygon(hexPoints);

	// Seriously!?
	var hexOutlinePoints = hexPoints.map( function(val){return val-0.5;} );
	var hexOutlineShape  = new PIXI.Polygon(hexOutlinePoints);

	function distance(p0, p1, grid) {
		p0 = grid._toCubeCoordinates(p0);
		p1 = grid._toCubeCoordinates(p1);

		var dx = Math.abs(p1.x - p0.x);
		var dy = Math.abs(p1.y - p0.y);
		var dz = Math.abs(p1.z - p0.z);

		var d = (dx + dy + dz) / 2;

		return d;
	}

	function hexagon(p0, r, grid) {
		p0 = grid._toCubeCoordinates(p0);

		if (r === 0) {return [p0];}

    	var results = []
    	var dir = direction.southWest;
    	var cube = {x:p0.x + r*dir.x, y:p0.y + r*dir.y, z:p0.z + r*dir.z};
	    for (var i = 0; i < 6; ++i) {
	    	dir = direction.asArray[i];
	        for (var j = 0; j < r; ++j) {
	            if (grid._cube.inBounds(cube)) { results.push(cube); }
	            cube = {x:cube.x + dir.x, y:cube.y + dir.y, z:cube.z + dir.z,}
	        }
	    }

		return results;
	}

	function hexagonDisc(p0, r, grid) {
		p0 = grid._toCubeCoordinates(p0);

		var results = []
		for (var dx = -r; dx <= r; ++dx) {
			for (var dy = Math.max(-r, -dx-r); dy <= Math.min(r, -dx+r); ++dy) {
			    var dz = -dx-dy
				var p = { x:p0.x+dx, y:p0.y+dy, z:p0.z+dz };
			    results.push(p);
			}
		}
		return results;
	}

	// Exported API
	var API = {
		dist        : distance,
		hexagon     : hexagon,
		hexagonDisc : hexagonDisc,

		cos_60 : cos_60,
		sin_60 : sin_60,
		hexPoints        : hexPoints,
		hexOutlinePoints : hexOutlinePoints,
		hexShape         : hexShape,
		hexOutlineShape  : hexOutlineShape,
	};

	return API;
}());