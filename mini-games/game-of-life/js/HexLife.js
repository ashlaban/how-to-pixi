var HexLife = function () {

	var API = {};

	function defaultRules() {
		/* 
		 * Default rules
		 * A cell dies from lonliness with 0 and 1 neighbours, it dies from
		 * being over-crowded with 4 and 5 neighbours. If a dead cell has three
		 * neighbors it comes alive.
		 */
		return {0:0, 1:0, 2:1, 3:2, 4:1, 5:0, 6:0};
	}

	function Game (configuration, renderer) {

		var self = this;

		this.isStarted = false;

		this.renderer = renderer;
		this.conf     = configuration;

		this.markTime     = -1;
		this.previousTime = -1;
		this.currentTime  = -1;

		var arraySize = this.conf.grid.size.w*this.conf.grid.size.h;
		this.model = {
			state: 0,
			0: Array.apply(null, Array(arraySize)).map(Boolean,0),
			1: Array.apply(null, Array(arraySize)).map(Boolean,0)
		}

		this.grid = new HexGrid( this.conf.grid );

		this.rules = defaultRules();

		this.clear();
		this.drawActiveModel();

		// Idiotic function declarations...
		var onmouseup = function (ev) {
			if (isDrag) {isDrag = false; return;}
			var grid = self.grid;
	        var mousePosition = {x:ev.offsetX,y:ev.offsetY}
	        var offsetCoord = grid._toOffsetCoordinates( mousePosition );
	        // console.log('renderer.view.onmouseup - Cube   coordinates', grid._toCubeCoordinates(offsetCoord));
	        // console.log('renderer.view.onmouseup - Offset coordinates', grid._toOffsetCoordinates(offsetCoord));
	        var cell = grid.getCell(offsetCoord);
	        cell.highlight();
	        
	        cell.draw();
	        grid.renderWith(renderer);
	    }

	    var isDrag = false;
	    var prevCoord = {i:-1, j:-1};
	    var prevState = false;
	    var onmousemove = function (ev) {
	    	var grid = self.grid;
            var mousePosition = {x:ev.offsetX,y:ev.offsetY}
			var offsetCoord = grid._toOffsetCoordinates( mousePosition );
			var index = offsetCoord.i + offsetCoord.j * self.conf.grid.size.w;
	        var state = self.model.state;
			if (ev.buttons === 1) {
				isDrag = true;  
	            if (offsetCoord.i !== prevCoord.i || offsetCoord.j !== prevCoord.j) {
	            	if (!self.grid._offset.inBounds(offsetCoord)) {return;}
	            	// Flip model
	            	self.model[state][index] = !self.model[state][index];

	            	// Quick update of GUI
	            	var cell = grid.getCell(offsetCoord);
	            	if (cell !== null) {
	            		cell.highlight(prevState);
	            		cell.draw();
	            		grid.renderWith(self.renderer);
	            	}
	            }
	            prevCoord = offsetCoord;
	        } else {
	        	isDrag = false;
	        	prevState = !self.model[state][index];
	        }	       
    	}
    	this.onmouseup   = onmouseup;
    	this.onmousemove = onmousemove;
    }

	Game.prototype.clear = function () {
		for (var i = 0; i < this.conf.grid.size.w; ++i) {
			for (var j = 0; j < this.conf.grid.size.h; ++j) {
				var index = i + j * this.conf.grid.size.w;
				this.model[this.model.state][index] = false;
				this.grid.getCell({i:i,j:j}).highlight(false);
			}
		}
		this.drawActiveModel();
		this.renderActiveModel();
	}
	Game.prototype.switchActiveModel = function () {
		this.model.state ^= 1;
	}

	Game.prototype.drawActiveModel   = function () {
		var state = this.model.state;
		var grid  = this.model[state];
		for (var i = 0; i < this.conf.grid.size.w; ++i) {
			for (var j = 0; j < this.conf.grid.size.h; ++j) {
				var index = i + j * this.conf.grid.size.w;
				var value = grid[index];
				var cell  = this.grid.getCell({i:i, j:j});
				cell.highlight(value);
			}
		}
		this.grid.draw();
	}
	Game.prototype.renderActiveModel   = function () {
		this.grid.renderWith(this.renderer);
	}

	Game.prototype.fillRandom = function (fraction) {
		var state = this.model.state;
		var grid  = this.model[state];
		for (var i = 0; i < this.conf.grid.size.w; ++i) {
			for (var j = 0; j < this.conf.grid.size.h; ++j) {
				grid[i+j*this.conf.grid.size.w] = Math.random() < fraction;
			}
		}
		this.drawActiveModel();
	}

	Game.prototype.logic = function (sum, prevState) {
		var rule = this.rules[sum];
		switch (rule) {
			case 0: return false    ;
			case 1: return prevState;
			case 2: return true     ;
		}
	}

	Game.prototype.start = function () {this.isStarted = true ;}
	Game.prototype.stop  = function () {this.isStarted = false;}

	Game.prototype.step  = function (stepsPerSecond) {

		// TODO: Extract fps limiter to HexUtil and do a debouncer.
		if (stepsPerSecond !== undefined) {

			if (!this.isStarted) {return;}

			var elapsedTime = -1;
			// this.previousTime = this.currentTime;
			this.currentTime  = performance.now()/1000;
			if (this.markTime <= 0) {this.markTime = this.currentTime;}
			else                    {elapsedTime = this.currentTime - this.markTime;}
			var elapsedFPS = 1.0/elapsedTime;

			if (elapsedTime === -1) {
				return;
			} else if (elapsedFPS > stepsPerSecond) {
				return;
			} else {
				this.markTime = -1;
			}
		}

		var self = this;
		var state = this.model.state;
		var activeModel  = this.model[state  ];
		var passiveModel = this.model[state^1]

		for (var i = 0; i < this.conf.grid.size.w; ++i) {
			for (var j = 0; j < this.conf.grid.size.h; ++j) {
				var offsetCoord     = {i:i, j:j};
				var index           = offsetCoord.i + offsetCoord.j*this.conf.grid.size.w;
				var prevState       = activeModel[index];
				var activeNeighbors = HexMath.hexagon(offsetCoord, 1, this.grid);

				var sum = 0;
				activeNeighbors.forEach(function(e){
					var o = self.grid._cube.toOffsetCoordinates(e);
					if (activeModel[o.i + o.j*self.conf.grid.size.w]) {sum += 1;}
				});

				var newState = this.logic(sum, prevState);
				passiveModel[index] = newState;

				var cell = this.grid.getCell(offsetCoord);
				if (cell !== null) {
					cell.highlight(newState);
					cell.draw();
				}
			};	
		};

		this.switchActiveModel();
		this.renderActiveModel();
	}
	
	// External API
	API.Game = Game;


	return API;
}();