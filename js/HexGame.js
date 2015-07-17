var HexGame = function () {

	var API = {};

	function Game (configuration, renderer) {

		var self = this;

		this.isStarted = false;

		this.renderer = renderer;
		this.conf     = configuration;

		var arraySize = this.conf.grid.size.w*this.conf.grid.size.h;
		this.model = Array.apply(null, Array(arraySize)).map(Number, 0);
		this.model = this.model.map(function(){return Math.floor(Math.random()*7);});

		this.grid = new HexGrid( this.conf.grid, this.model );

		this.sourceCell = {	i:Math.floor(Math.random()*this.conf.grid.size.w),
								j:Math.floor(Math.random()*this.conf.grid.size.h)};
		this.grid.getCell(this.sourceCell).highlight(true);

		// this.clear();
		this.paintHighlightAreaEdge();
		this.drawModel();
		this.renderModel();

		// Idiotic function declarations...
		var onmouseup = function (ev) {
			var grid = self.grid;
	        var mousePosition = {x:ev.offsetX,y:ev.offsetY}
	        var offsetCoord = grid._toOffsetCoordinates( mousePosition );
	        // console.log('renderer.view.onmouseup - Cube   coordinates', grid._toCubeCoordinates(offsetCoord));
	        // console.log('renderer.view.onmouseup - Offset coordinates', grid._toOffsetCoordinates(offsetCoord));
	        var cell = grid.getCell(offsetCoord);
	        cell.highlight();
	        self.flood(offsetCoord);
	        
	        cell.draw();
	        grid.renderWith(renderer);
	    }

    	this.onmouseup   = onmouseup;
    }

	Game.prototype.clear = function () {
		for (var i = 0; i < this.conf.grid.size.w; ++i) {
			for (var j = 0; j < this.conf.grid.size.h; ++j) {
				var index = i + j * this.conf.grid.size.w;
				this.model[index] = 0;
				this.grid.getCell({i:i,j:j}).highlight(false);
			}
		}
		this.drawActiveModel();
		this.renderActiveModel();
	}
	

	Game.prototype.drawModel   = function () {
		var grid  = this.model;
		for (var i = 0; i < this.conf.grid.size.w; ++i) {
			for (var j = 0; j < this.conf.grid.size.h; ++j) {
				var index = i + j * this.conf.grid.size.w;
				var value = grid[index];
				var cell  = this.grid.getCell({i:i, j:j});
				cell.color = this.conf.game.colorPalette[value];
			}
		}
		this.grid.draw();
	}
	Game.prototype.renderModel   = function () {
		this.grid.renderWith(this.renderer);
	}

	function floodRecurse (grid, newColor, cubeCoord, visited) {
		if (!grid._cube.inBounds(cubeCoord)) {return visited;}
		// console.log('enter', cubeCoord)
		var alreadyVisited = visited.some(function(val){return val.x === cubeCoord.x && val.y === cubeCoord.y && val.z === cubeCoord.z;})
		if (alreadyVisited) {return visited;}
		visited.push(cubeCoord);

		var cell = grid.getCell(cubeCoord);
		// console.log('visit', HexColor.INT.toHSV(cell.color), cubeCoord, visited)

		if (cell.isHighlighted || cell.color === newColor) {
			// console.log('ok!')
			cell.highlight(true);
			cell.color = newColor;
			cell.draw();
		} else {
			// console.log('not ok :(')
			return visited;
		}

		var neighbours = HexMath.getNeighbours(cubeCoord, grid);
		neighbours.forEach(function(neighbourCoord) {
			var neighbourCell = grid.getCell(neighbourCoord);
			visited = floodRecurse( grid, newColor, neighbourCoord, visited );
		});
		return visited;
	}

	Game.prototype.flood = function (p0, newColor) {
		p0 = this.grid._toCubeCoordinates(p0);
		floodRecurse ( this.grid, newColor, p0, []);

		this.paintHighlightAreaEdge();
		this.renderModel();
	}

	Game.prototype.paintHighlightAreaEdge = function(){
		var grid = this.grid;
		for (var i = 0; i < this.conf.grid.size.w; ++i) {
			for (var j = 0; j < this.conf.grid.size.h; ++j) {
				var offsetCoord = {i:i, j:j};
				var cell        = grid.getCell(offsetCoord);
				cell.edges = [];
				
				if ( ! cell.isHighlighted ) { continue; }
				
				console.log('paintHighlightAreaEdge')
				var neighbours = HexMath.getNeighbours(offsetCoord, grid);
				neighbours.forEach(function(neighbourCoord) {
					var neighbourCell = grid.getCell(neighbourCoord);
					console.log(neighbourCoord)
					console.log(neighbourCell)
					if ( neighbourCell === null || !neighbourCell.isHighlighted ) {
						cell.edges.push( HexMath.directionForPoints(offsetCoord, neighbourCoord, grid) );
					}
				});

				cell.draw();
			}
		}
	}
	
	// External API
	API.Game = Game;


	return API;
}();