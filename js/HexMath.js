

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
	direction.toInt = {
		north    : 0,
		northEast: 1,
		southEast: 2,
		south    : 3,
		southWest: 4,
		northWest: 5,
	}
	
	var cos_60 = 0.5;
    var sin_60 = 0.86602540378;
	var hexPoints = [	-1      ,  0      ,
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

	var hexEdge = {
		north    : function(t) {return new PIXI.Polygon([-cos_60, -sin_60,  cos_60, -sin_60,  cos_60+t*cos_60, -sin_60+t*sin_60, -cos_60-t*cos_60, -sin_60+t*sin_60 ]);},
		northEast: function(t) {return new PIXI.Polygon([ cos_60, -sin_60,       1,       0,       1-t*cos_60,       0+t*sin_60,  cos_60-t       , -sin_60          ]);},
		southEast: function(t) {return new PIXI.Polygon([      1,       0,  cos_60,  sin_60,  cos_60-t       ,  sin_60         ,       1-t*cos_60,       0-t*sin_60 ]);},
		south    : function(t) {return new PIXI.Polygon([ cos_60,  sin_60, -cos_60,  sin_60, -cos_60-t*cos_60,  sin_60-t*sin_60,  cos_60+t*cos_60,  sin_60-t*sin_60 ]);},
		southWest: function(t) {return new PIXI.Polygon([-cos_60,  sin_60,      -1,       0,      -1+t*cos_60,       0-t*sin_60, -cos_60+t       ,  sin_60          ]);},
		northWest: function(t) {return new PIXI.Polygon([     -1,       0, -cos_60, -sin_60, -cos_60+t       , -sin_60         ,      -1+t*cos_60,       0+t*sin_60 ]);},
	}
	hexEdge[0] = hexEdge.north;
	hexEdge[1] = hexEdge.northEast;
	hexEdge[2] = hexEdge.southEast;
	hexEdge[3] = hexEdge.south;
	hexEdge[4] = hexEdge.southWest;
	hexEdge[5] = hexEdge.northWest;

	function directionForPoints(p0, p1, coordinateSystem) {
		p0 = coordinateSystem.toCubeCoordinates(p0);
		p1 = coordinateSystem.toCubeCoordinates(p1);

		var d = {x: p1.x-p0.x, y: p1.y-p0.y, z: p1.z-p0.z};

		for (var i = 0; i < direction.asArray.length; ++i) {
			var dir = direction.asArray[i];
			if 	(      d.x === dir.x
					&& d.y === dir.y
					&& d.z === dir.z)
			{ return i; }
		};
		return -1;
	}

	function distance(p0, p1, coordinateSystem) {
		p0 = coordinateSystem.toCubeCoordinates(p0);
		p1 = coordinateSystem.toCubeCoordinates(p1);

		var dx = Math.abs(p1.x - p0.x);
		var dy = Math.abs(p1.y - p0.y);
		var dz = Math.abs(p1.z - p0.z);

		var d = (dx + dy + dz) / 2;

		return d;
	}

	function hexagon(p0, r, coordinateSystem) {
		p0 = coordinateSystem.toCubeCoordinates(p0);

		if (r === 0) {return [p0];}

    	var results = []
    	var dir = direction.southWest;
    	var cube = {x:p0.x + r*dir.x, y:p0.y + r*dir.y, z:p0.z + r*dir.z};
	    for (var i = 0; i < 6; ++i) {
	    	dir = direction.asArray[i];
	        for (var j = 0; j < r; ++j) {
	            // if (coordinateSystem.cube.inBounds(cube)) { results.push(cube); }
	            results.push(cube);
	            cube = {x:cube.x + dir.x, y:cube.y + dir.y, z:cube.z + dir.z,}
	        }
	    }

		return results;
	}

	function hexagonDisc(p0, r, coordinateSystem) {
		p0 = coordinateSystem._toCubeCoordinates(p0);

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

	function getNeighbours(p0, coordinateSystem) {
		return hexagon(p0, 1, coordinateSystem);	
	}

	// Exported API
	var API = {

		directionForPoints: directionForPoints,

		dist        : distance,
		hexagon     : hexagon,
		hexagonDisc : hexagonDisc,

		getNeighbours: getNeighbours,

		cos_60 : cos_60,
		sin_60 : sin_60,
		hexPoints        : hexPoints,
		hexOutlinePoints : hexOutlinePoints,
		hexShape         : hexShape,
		hexOutlineShape  : hexOutlineShape,
		hexEdge : hexEdge,
	};

	return API;
}());