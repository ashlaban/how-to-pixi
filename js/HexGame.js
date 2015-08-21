var HexGame = function () {

	var API = {};

	API.NO_PLAYER = 0;
	API.PLAYER_1  = 1;
	API.PLAYER_2  = 2;
	API.PLAYER_3  = 3;
	API.PLAYER_4  = 4;
	API.PLAYER_5  = 5;
	API.PLAYER_6  = 6;
	API.PLAYER_7  = 7;

	function Cell (color, owner) {
		this.color = color;
		this.owner = owner;
	}

	Cell.prototype.newRandom = function (colorPalette) {
		var colorIndex = Math.floor(Math.random()*colorPalette.length);
		var color      = colorPalette[colorIndex];
		return new Cell( color, API.NO_PLAYER );
	}

	Cell.prototype.equals = function (other) {
		return other !== null 
			&& other !== undefined 
			&& this.color === other.color 
			&& this.owner === other.owner;
	}

	function Model ( conf, colorPalette, coordinateSystem, player ) {
		var self = this;

		this.palette = colorPalette;
		this.conf    = conf;

		this.player        = player;
		this.currentPlayer = API.PLAYER_1;
		this.winner        = API.NO_PLAYER;

		this.coordinateSystem = coordinateSystem;

		var arraySize = this.conf.size.w*this.conf.size.h;
		this.array = Array.apply(null, Array(arraySize)).map(function () {
			return Cell.prototype.newRandom(self.palette);
		});

		this.setStart = function ( p0, owner ) {
			var linearCoord = this.coordinateSystem.toLinearCoordinates(p0);
			this.array[linearCoord].owner = owner;
		}

		function flood (originalOwner, newColor, cubeCoord) {
			
			function inArray(array, cubeCoord) {
				// return array.some(function(val){return val.x === cubeCoord.x && val.y === cubeCoord.y && val.z === cubeCoord.z;});
				// return array.indexOf(cubeCoord)===-1;
				for (var i=array.length-1; i >= 0; --i) {
					var val = array[i];
					if (val.x === cubeCoord.x && val.y === cubeCoord.y && val.z === cubeCoord.z) {
						return true;
					}
				}
				return false;
			}

			var visited  = [];
			var toVisit  = HexMath.getNeighbours(cubeCoord, self.coordinateSystem);

			while (toVisit.length) {
				cubeCoord = toVisit.pop();
				// console.log(cubeCoord, toVisit)
				if (!self.coordinateSystem.cube.inBounds(cubeCoord)) {continue;}
				visited.push(cubeCoord);

				var linearCoord = self.coordinateSystem.toLinearCoordinates(cubeCoord);
				var modelCell   = self.array[linearCoord];
				var owner       = modelCell.owner;

				if (   !(owner === originalOwner) 
					&& !(owner === 0)                    ) {continue;}
				if (   modelCell.owner !== originalOwner 
					&& modelCell.color !== newColor      ) {continue;}
					
				self.array[linearCoord].color = newColor;
				self.array[linearCoord].owner = originalOwner;

				var neighbours = HexMath.getNeighbours(cubeCoord, self.coordinateSystem);
				for (var i=neighbours.length-1; i >= 0; --i) {
					var neighbourCoord = neighbours[i];
					if (inArray(visited, neighbourCoord)){continue;}
					toVisit.push(neighbourCoord);
				}
			}

			return visited;
		}

		function floodScanline (originalOwner, newColor, cubeCoord) {
			// console.log('=== Start floodScanline ( originalOwner=' + originalOwner + ', newColor=' + newColor + ' cubeCoord=...'+' )', cubeCoord);
			var visited  = [];
			var toVisit  = [cubeCoord]

			function inArray(array, cubeCoord) {
				// return array.some(function(val){return val.x === cubeCoord.x && val.y === cubeCoord.y && val.z === cubeCoord.z;});
				// return array.indexOf(cubeCoord)===-1;
				for (var i=array.length-1; i >= 0; --i) {
					var val = array[i];
					if (val.x === cubeCoord.x && val.y === cubeCoord.y && val.z === cubeCoord.z) {
						return true;
					}
				}
				return false;
			}

			while (toVisit.length) {
				cubeCoord = toVisit.pop();
				// console.log(cubeCoord, toVisit)
				if (!self.coordinateSystem.cube.inBounds(cubeCoord)) {continue;}
				if ( inArray(visited, cubeCoord) )                   {continue;}

				// Center
				visited.push(cubeCoord);
				linearCoord = self.coordinateSystem.toLinearCoordinates(cubeCoord);
				modelCell   = self.array[linearCoord];
				owner       = modelCell.owner;

				if (modelCell.owner !== originalOwner && !(modelCell.owner === 0 && modelCell.color === newColor)) {continue;}

				self.array[linearCoord].color = newColor;
				self.array[linearCoord].owner = originalOwner;

				toVisit.push( {x:cubeCoord.x  , y:cubeCoord.y+1, z:cubeCoord.z-1} );
				toVisit.push( {x:cubeCoord.x+1, y:cubeCoord.y-1, z:cubeCoord.z  } );
				toVisit.push( {x:cubeCoord.x  , y:cubeCoord.y-1, z:cubeCoord.z+1} );
				toVisit.push( {x:cubeCoord.x-1, y:cubeCoord.y+1, z:cubeCoord.z  } );

				// 'East'
				var eastCoord   = {x:cubeCoord.x+1, y:cubeCoord.y, z:cubeCoord.z-1};
				while ( true ) {
					if (!self.coordinateSystem.cube.inBounds(eastCoord)) {break;}
					if ( inArray(visited, eastCoord) )                   {break;}

					var linearCoord = self.coordinateSystem.toLinearCoordinates(eastCoord);
					var modelCell   = self.array[linearCoord];
					var owner       = modelCell.owner;

					// if (modelCell.owner === 0             && modelCell.color === newColor) { /* Change owner */ }
					// if (modelCell.owner === originalOwner                                ) { /* Change color */ }
					if (modelCell.owner !== originalOwner && !(modelCell.owner === 0 && modelCell.color === newColor)) {break;}

					visited.push(eastCoord);

					// console.log('east', eastCoord, modelCell.owner, modelCell.color)

					linearCoord = self.coordinateSystem.toLinearCoordinates(eastCoord);
					modelCell   = self.array[linearCoord];
					owner       = modelCell.owner;

					self.array[linearCoord].color = newColor;
					self.array[linearCoord].owner = originalOwner;

					toVisit.push( {x:eastCoord.x  , y:eastCoord.y+1, z:eastCoord.z-1} );
					toVisit.push( {x:eastCoord.x+1, y:eastCoord.y-1, z:eastCoord.z  } );

					eastCoord   = {x:eastCoord.x+1, y:eastCoord.y, z:eastCoord.z-1};
				}

				// 'West'
				var westCoord   = {x:cubeCoord.x-1, y:cubeCoord.y, z:cubeCoord.z+1};
				while ( true ) {
					if (!self.coordinateSystem.cube.inBounds(westCoord)) {break;}
					if ( inArray(visited, westCoord) )                   {break;}

					linearCoord = self.coordinateSystem.toLinearCoordinates(westCoord);
					modelCell   = self.array[linearCoord];
					owner       = modelCell.owner;

					if (modelCell.owner !== originalOwner && !(modelCell.owner === 0 && modelCell.color === newColor)) {break;}

					visited.push(westCoord);

					// console.log('west', westCoord, modelCell.owner, modelCell.color)

					linearCoord = self.coordinateSystem.toLinearCoordinates(westCoord);
					modelCell   = self.array[linearCoord];
					owner       = modelCell.owner;

					self.array[linearCoord].color = newColor;
					self.array[linearCoord].owner = originalOwner;

					toVisit.push( {x:westCoord.x  , y:westCoord.y-1, z:westCoord.z+1} );
					toVisit.push( {x:westCoord.x-1, y:westCoord.y+1, z:westCoord.z  } );

					westCoord   = {x:westCoord.x-1, y:westCoord.y, z:westCoord.z+1};
				}
			}

			// console.log('======= DONE!')
			return visited;
		}

		this.flood = flood;
		this.floodScanline = floodScanline;

		/*
		 * Color should be int-color.
		 */
		this.makeMove = function (player, newColor) {
			var p0            = this.player[player].startCoord;
			var cubeCoord     = this.coordinateSystem.toCubeCoordinates(p0);
			var linearCoord   = this.coordinateSystem.toLinearCoordinates(p0);
			var originalOwner = this.array[linearCoord].owner;

			var modified = floodScanline ( originalOwner, newColor, cubeCoord );

			this._updateWinner();

			return modified;
		}

		this.influence = function (player) {
			var count = 0;
			this.array.forEach(function(modelCell){
				if (modelCell.owner === player) {count += 1;}
			});
			return count / this.array.length;
		}

		this._updateWinner = function() {
			for (var i = 1; i <= this.player.length; ++i) {
				if (this.influence(i) > 0.5) { this.winner = i; return; }
			};
			this.winner = API.NO_PLAYER;
		};
	}

	Model.prototype.equals = function (other) {
		if (other === null || other === undefined) {return false;}
		var retVal = true;
		for (var i = other.array.length - 1; i >= 0; --i) {
			if ( !this.array[i].equals(other.array[i]) ){
				console.log('Inequality at: ', this.coordinateSystem.toOffsetCoordinates(i));
				console.log(i, this.array[i], other.array[i]);

				// return false;
				retVal = false;
			}
		};
		return retVal;
	}

	Model.prototype.nextPlayer = function () {
		this.currentPlayer = (this.currentPlayer % (this.player.length - 1)) + 1;
	}

	Model.prototype.clone = function () {
		var newModel = new Model(this.conf, this.palette, this.coordinateSystem, this.player);
		newModel.currentPlayer = this.currentPlayer;
		newModel.winner        = this.winner;
		for (var i = this.array.length - 1; i >= 0; i--) {
			var oldModelCell = this.array[i];
			newModel.array[i] = new Cell(oldModelCell.color, oldModelCell.owner);
		};
		return newModel;
	}

	Model.prototype.getCell = function (coordinate) {
			var coordinate = coords[i];
			var linearCoordinate = this.coordinateSystem.toLinearCoordinates(coordinate);

			if (this.coordinateSystem.inBounds(linearCoordinate)) {
				return this.array[linearCoordinate];
			}

			return null;
	}

	Model.prototype.getCells = function (coords) {
		var retVal = [];
		for (var i=coords.length-1; i >= 0; --i) {
			var cell = this.getCell(coords[i]);
			if (cell !== null) { retVal.push( cell );}
		}
		return array;
	}

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
					num        : API.PLAYER_0,
					startCoord : null,
					color      : null,
				},
				{
					num: API.PLAYER_1,
					startCoord: getStartingOffsetCoord(API.PLAYER_1, this.grid),
					color: configuration.game.player[1].color,
				},
				{
					num: API.PLAYER_2,
					startCoord: getStartingOffsetCoord(API.PLAYER_2, this.grid),
					color: configuration.game.player[2].color,
				}
		];

		// var arraySize = this.conf.grid.size.w*this.conf.grid.size.h;
		// this.model = Array.apply(null, Array(arraySize)).map(Object, {color:0, owner:0});
		// this.model = this.model.map(function(){return {color: Math.floor(Math.random()*7), owner:0};;});
		this.grid  = new HexGrid( this.conf.grid, null );
		this.coordinateSystem = this.grid.coordinateSystem;

		this.model = new Model(	this.conf.grid,
								this.conf.game.colorPalette,
								this.coordinateSystem,
								this.player
							  );
		this.ai = new ArtificialIntelligence(this.player, this.model, 'greedy')

		this.currentPlayer = this.player[1];
		this.model.setStart(this.player[1].startCoord, API.PLAYER_1);
		this.model.setStart(this.player[2].startCoord, API.PLAYER_2);
		
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
		// var numPlayers = this.configuration.game.numPlayers;
		// var numPlayers = 2;
		// var index = this.currentPlayer.num % numPlayers + 1;
		// this.currentPlayer = this.player[index];
		this.model.nextPlayer();
		this.currentPlayer = this.player[this.model.currentPlayer]
	}

	Game.prototype.logic = function (newColor) {
		if (this.model.winner !== API.NO_PLAYER) {return;}

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

		// AI move
		var aiColor = this.ai.getMove();
		this.logic(aiColor);
	}

	function ArtificialIntelligence (player, model, strategy) {

		var self = this;

		this.player = player;
		this.model  = model;
		this.impl   = null;

		this.RandomStrategy = function (lookahead) {
			this.model        = self.model;
			this.colorPalette = self.model.colorPalette;
			this.lookahead    = lookahead; /*Unused in this strat.*/

			this.getMove = function () {
				var numColors = this.colorPalette.length;
				var newColor  = Math.floor(Math.random()*numColors);
				return newColor;
			}
		} /* End RandomStrategy */

		this.MiniMaxStrategy = function (lookahead) {
			this.model        = self.model;
			this.colorPalette = self.model.colorPalette;

			function Evaluation (colorIndex, score) {
				this.colorIndex = colorIndex;
				this.score      = score;
			}

			// Model should be a class defining the possible moves...
			// So flood and such should be defined on the model.

			function minimax ( colorIndex, level ) {
				var color;

				// If depth exceeded, return (colorIndex, evaluation)

				// For color in Palette
				// 		Update Board, then recurse
				// 		If largest score, record it
				// Return (colorIndex, largest score).

			}

			this.getMove = function () {
				return minimax().colorIndex
			}
		} /* End MiniMaxStrategy */

		this.GreedyStrategy = function (lookahead) {
			this.lookahead    = lookahead;

			function greedy ( currentLevel, model ) {
				if (currentLevel === null || currentLevel === undefined || isNaN(currentLevel)) {currentLevel = 0;}
				if (model === null || model === undefined) {model = self.model;}

				if (currentLevel >= lookahead) {
					var influence = model.influence(self.model.currentPlayer);
					return {color:null, influence:influence};
				}

				// console.log(self.model.currentPlayer)

				var color;

				var bestInfluence = 0;
				var bestColor     = 0;
				self.model.palette.forEach(function(color){
					var newModel;
					newModel = model.clone();
					newModel.makeMove(self.model.currentPlayer, color);

					var newLocalInfluence = newModel.influence(self.model.currentPlayer);
					var oldLocalInfluence = model.influence(self.model.currentPlayer);

					// Local win condition
					var currentInfluence = newModel.influence(self.model.currentPlayer);
					if (currentInfluence > bestInfluence) {
						bestInfluence = currentInfluence;
						bestColor     = color;
					}

					// Global optimization
					var influence = greedy(currentLevel + 1, newModel).influence;
					if (influence > bestInfluence && newLocalInfluence > oldLocalInfluence) {
						bestInfluence = influence;
						bestColor     = color;
					}
				});

				if (bestInfluence > 0) {
					return {color:bestColor, influence:bestInfluence};
				} else {
					var numColors = self.model.palette.length;
					var newIndex  = Math.floor(Math.random()*numColors);
					var newColor  = self.model.palette[newIndex];
					return {color:newColor, influence:0};
				}
			}

			this.getMove = function () {
				var bestMove = greedy(0);
				var color = bestMove.color;
				console.log(bestMove);

				return color;
			}
		} /* End GreedyStrategy */

	this.getMove = function () {
		return this.impl.getMove();
	}

	this.setImplementation = function (impl, lookahead) {
		switch (impl) {
			case 'random' : this.impl = new this.RandomStrategy(lookahead);  break;
			case 'greedy' : this.impl = new this.GreedyStrategy(lookahead);  break;
			case 'minimax': this.impl = new this.MiniMaxStrategy(lookahead); break;
			default: this.impl = new this.GreedyStrategy(lookahead); break;
		}
	}
	this.setImplementation(strategy, 3);

	}
	
	// External API
	API.Game  = Game;
	API.Model = Model;
	API.AI = ArtificialIntelligence;


	return API;
}();