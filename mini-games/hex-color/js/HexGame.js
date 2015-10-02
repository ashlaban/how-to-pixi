var HexGame = function () {

	var API = {};

	function Game (configuration, renderer) {

		var self = this;

		this.isStarted = false;

		this.renderer = renderer;
		this.conf     = configuration;

		function getStartingOffsetCoord(player, grid) {
			if (player === 1) {
				return {i:0, j:this.conf.grid.size.h-1};
				// return {i:3, j:this.conf.grid.size.h-3};
			} else if (player === 2) {
				return {i:this.conf.grid.size.w-1, j:0};
			}
		}

		this.player = [
				{
					num        : HexUtil.PLAYER_0,
					startCoord : null,
					color      : null,
				},
				{
					num: HexUtil.PLAYER_1,
					startCoord: getStartingOffsetCoord(HexUtil.PLAYER_1, this.grid),
					color: configuration.game.player[1].color,
				},
				{
					num: HexUtil.PLAYER_2,
					startCoord: getStartingOffsetCoord(HexUtil.PLAYER_2, this.grid),
					color: configuration.game.player[2].color,
				}
		];

		// var arraySize = this.conf.grid.size.w*this.conf.grid.size.h;
		// this.model = Array.apply(null, Array(arraySize)).map(Object, {color:0, owner:0});
		// this.model = this.model.map(function(){return {color: Math.floor(Math.random()*7), owner:0};;});
		this.grid  = new HexGrid( this.conf.grid, null );
		this.coordinateSystem = this.grid.coordinateSystem;

		this.model = new HexModel(	this.conf.grid,
									this.conf.game.colorPalette,
									this.coordinateSystem,
									this.player
							  	);

		this.currentPlayer = this.player[1];
		this.model.setStart(this.player[1].startCoord, HexUtil.PLAYER_1);
		this.model.setStart(this.player[2].startCoord, HexUtil.PLAYER_2);
		
		this.grid.getCell(this.player[1].startCoord).highlight(true);
		this.grid.getCell(this.player[2].startCoord).highlight(true);

		// this.clear();
		this.paintHighlightAreaEdge();
		this.drawModel();
		this.renderModel();

		// Idiotic function declarations...
		var onmouseup = function (ev) {
			var grid = self.grid;
	        var mousePosition = {x:ev.offsetX,y:ev.offsetY}
	        var offsetCoord = this.coordinateSystem.toOffsetCoordinates( mousePosition );
	        var linearCoord = this.coordinateSystem.toLinearCoordinates( offsetCoord   );
	        // console.log('renderer.view.onmouseup - Cube   coordinates', this.coordinateSystem.toCubeCoordinates(offsetCoord));
	        // console.log('renderer.view.onmouseup - Offset coordinates', this.coordinateSystem.toOffsetCoordinates(offsetCoord));
	        var cell = grid.getCell(offsetCoord);
	        console.log(cell, self.model[linearCoord])
	        // cell.highlight();
	        // self.flood(offsetCoord);
	        
	        // cell.draw();
	        // grid.renderWith(renderer);
	    }

    	// this.onmouseup   = onmouseup;
    }
	
	Game.prototype.updateCells = function (coordinates) {
		var self = this;
		coordinates.forEach(function (coord) {
			coord = self.coordinateSystem.toOffsetCoordinates(coord);
			self.updateCell(coord);
		});
	}
	Game.prototype.updateCell = function (offsetCoord) {
		var linearCoord = this.coordinateSystem.offset.toLinearCoordinates(offsetCoord);

		var cell        = this.grid.getCell(offsetCoord);
		var modelCell   = this.model.array[linearCoord];

		var owner = modelCell.owner;
		cell.highlight(owner !== 0);

		var color = modelCell.color;
		cell.color = color;
	}
	Game.prototype.drawModel = function () {
		for (var i = 0; i < this.conf.grid.size.w; ++i) {
			for (var j = 0; j < this.conf.grid.size.h; ++j) {
				var offsetCoord = {i:i,j:j};
				this.updateCell(offsetCoord)
			}
		}
		this.grid.draw();
	}
	Game.prototype.renderModel   = function () {
		if (this.model.winner) {
			var text = new PIXI.Text('Player ' + this.model.winner + ' wins!', {font:'50px Arial', fill:'white', stroke:'black', strokeThickness:5}	);
			text.position = {x: 110,y: 150};
			text.resolution = 2;
			this.grid._graphics.addChild(text);
		}
		this.grid.renderWith(this.renderer);
	}

	Game.prototype.flood = function (player, newColor) {
		
		var modifiedCells;
		modifiedCells = this.model.makeMove(player, newColor);
		this.updateCells(modifiedCells);

		this.paintHighlightAreaEdge();
		this.renderModel();
	}

	Game.prototype.paintHighlightAreaEdge = function () {

		var model            = this.model.array;
		var player           = this.player;

		function highlight (offsetCoord, linearCoord, cell) {
			var grid = this;

			cell.edges = [];
			
			if ( ! cell.isHighlighted ) {return;}

			var owner = model[linearCoord].owner;
			cell.edgeColor = player[owner].color;
			
			var neighbours = HexMath.getNeighbours(offsetCoord, grid.coordinateSystem);
			neighbours.forEach(function(neighbourCoord) {
				var neighbourCell      = grid.getCell(neighbourCoord);
				var neighbourDirection = HexMath.directionForPoints(offsetCoord, neighbourCoord, grid.coordinateSystem);
				if (neighbourCell === null) {
					cell.edges.push( neighbourDirection );
					return;
				}
				
				var neighbourOwner = model[ grid.coordinateSystem.toLinearCoordinates(neighbourCoord) ].owner;
				if  ( (!neighbourCell.isHighlighted) || ( owner !== neighbourOwner ) ) { 
					cell.edges.push( neighbourDirection );
				}
			});

			cell.draw();
		}

		this.grid.applyToCells(highlight);
	}

	Game.prototype.nextPlayer = function () {
		this.model.nextPlayer();
		this.currentPlayer = this.player[this.model.currentPlayer]
	}

	Game.prototype.logic = function (newColor) {
		if (this.model.winner !== HexUtil.NO_PLAYER) {return;}

		// Update state
		this.flood( this.currentPlayer.num, newColor );

		// Check for winning condition
		var winner = this.model.winner;
		
		// Pass turn
		this.nextPlayer();
	}

	Game.prototype.step = function(newColor) {

		// Human move
		this.logic(newColor);

	}
	
	// External API
	API.Game  = Game;

	return API;
}();