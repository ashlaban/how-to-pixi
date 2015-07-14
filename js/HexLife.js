var HexLife = function () {

	var API = {};

	function defaultRules() {
		/* 
		 * Default rules
		 * A cell dies from lonliness with 0 and 1 neighbours, it dies from
		 * being over-crowded with 4 and 5 neighbours. If a dead cell has three
		 * neighbors it comes alive.
		 */
		return {0:0, 1:0, 2:1, 3:2, 4:0, 5:0};
	}

	function Game (grid1, grid2) {

		this.self = this;

		this.isStarted = false;

		this.markTime     = -1;
		this.previousTime = -1;
		this.currentTime  = -1;

		this.state = 0;
		this.grid1 = grid1;
		this.grid2 = grid2;
		this.activeGrid  = this.grid1;
		this.passiveGrid = this.grid2;

		this.rules = defaultRules();
	}

	Game.prototype.clear = function () {
		this.clearActiveGrid();
		this.clearPassiveGrid();
	}
	Game.prototype.clearActiveGrid = function () {
		for (var i = 0; i < this.activeGrid.size.w; ++i) {
			for (var j = 0; j < this.activeGrid.size.h; ++j) {
				this.activeGrid.getCell({i:i,j:j}).highlight(false);
			}
		}
		this.activeGrid.draw();
		this.activeGrid.renderWith(renderer);
	}
	Game.prototype.clearPassiveGrid = function () {
		for (var i = 0; i < this.passiveGrid.size.w; ++i) {
			for (var j = 0; j < this.passiveGrid.size.h; ++j) {
				this.passiveGrid.getCell({i:i,j:j}).highlight(false);
			}
		}
	}
	Game.prototype.switchActiveGrid = function () {
		if (this.state === 0) {
			this.activeGrid  = this.grid2;
			this.passiveGrid = this.grid1;
		} else {
			this.activeGrid  = this.grid1;
			this.passiveGrid = this.grid2;
		}
		this.state ^= 1;
	}

	Game.prototype.fillRandom = function (fraction) {
		for (var i = 0; i < this.passiveGrid.size.w; ++i) {
			for (var j = 0; j < this.passiveGrid.size.h; ++j) {
				if (Math.random() < fraction) {
					this.activeGrid.getCell({i:i,j:j}).highlight();
				}
			}
		}
		this.activeGrid.draw();
		this.activeGrid.renderWith(renderer);
	}

	Game.prototype.logic = function (sum, cell, prevState) {
		var rule = this.rules[sum];
		switch (rule) {
			case 0: cell.highlight(false    ); break;
			case 1: cell.highlight(prevState); break;
			case 2: cell.highlight(true     ); break;
		}
	}

	Game.prototype.start = function () {this.isStarted = true ;}
	Game.prototype.stop  = function () {this.isStarted = false;}

	Game.prototype.step  = function (stepsPerSecond) {

		// TODO: Extract fps limiter to HexUtil and do a debouncer.
		if (stepsPerSecond !== undefined) {

			if (!this.isStarted        ) {return;}

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

		for (var i = 0; i < this.activeGrid.size.w; ++i) {
			for (var j = 0; j < this.activeGrid.size.h; ++j) {
				var offsetCoord = {i:i, j:j};
				var prevState   = this . activeGrid  . getCell(offsetCoord) . isHighlighted;
				var passiveCell = this . passiveGrid . getCell(offsetCoord);
				var activeNeighbors = HexMath.hexagon(offsetCoord, 1, this.activeGrid);
				var sum       = 0;
				var self = this;
				activeNeighbors.forEach(function(e){
					if (self.activeGrid.getCell(e).isHighlighted) {sum += 1;}
				});
				this.logic(sum, passiveCell, prevState);
			};	
		};

		var target = 1.0;
		line.set(0.0);
		line.animate(target,
				{
					duration: 1000.0/stepsPerSecond - 500,
				 	easing  : 'easeOut',
				}
			);

		this.switchActiveGrid();
		this.activeGrid.draw();
		this.activeGrid.renderWith(renderer);
	}
	
	// External API
	API.Game = Game;

	return API;
}();