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

	function Model ( conf, colorPalette, coordinateSystem, player ) {
		var self = this;

		this.palette = colorPalette;
		this.conf    = conf;

		this.player        = player;
		this.currentPlayer = API.PLAYER_1;
		/**
		 * Checks whether the game is finished or not. If the game is still 
		 * undecided this.NO_PLAYER will be return. Otherwise API.PLAYER_X
		 * corresponding to the winning player will be returned.
		 * 
		 * @return {Boolean} 	this.NO_PLAYER if the game is ongoing. Otherwise
		 *                      the winning player.
		 */
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

		function floodRecurse (originalOwner, newColor, cubeCoord, returnValue) {
			
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

			var modified = [];
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
				modified.push( cubeCoord );

				var neighbours = HexMath.getNeighbours(cubeCoord, self.coordinateSystem);
				for (var i=neighbours.length-1; i >= 0; --i) {
					var neighbourCoord = neighbours[i];
					if (inArray(visited, neighbourCoord)){continue;}
					toVisit.push(neighbourCoord);
				}
				// neighbours.forEach(function(neighbourCoord) {
				// 	if (inArray(visited, neighbourCoord)){return;}
				// 	toVisit.push(neighbourCoord);
				// });
			}

			return {visited:null, modified:modified};
		}

		// function floodRecurse (originalOwner, newColor, cubeCoord, returnValue) {
		// 	// console.log('Parameters', grid, originalOwner, newColor, cubeCoord, visited);
		// 	if (!self.coordinateSystem.cube.inBounds(cubeCoord)) {return returnValue;}
		// 	// console.log('enter', cubeCoord)
			
		// 	var alreadyVisited = returnValue.visited.some(function(val){return val.x === cubeCoord.x && val.y === cubeCoord.y && val.z === cubeCoord.z;})
		// 	if (alreadyVisited) {return returnValue;}
		// 	returnValue.visited.push(cubeCoord);

		// 	var linearCoord = self.coordinateSystem.toLinearCoordinates(cubeCoord);

		// 	var owner = self.array[ linearCoord ].owner;
		// 	if (!(owner === originalOwner) && !(owner === 0)) {return returnValue;}

		// 	// var cell = grid.getCell(cubeCoord);
		// 	// console.log('visit', HexColor.INT.toHSV(cell.color), cubeCoord, visited)

		// 	var modelCell = self.array[linearCoord];
		// 	if ( modelCell.owner === originalOwner || modelCell.color === newColor) {
		// 		// console.log('ok!')
		// 		self.array[linearCoord].color = newColor;
		// 		self.array[linearCoord].owner = originalOwner;

		// 		returnValue.modified.push( cubeCoord );
		// 	} else {
		// 		// console.log('not ok :(')
		// 		return returnValue;
		// 	}

		// 	var neighbours = HexMath.getNeighbours(cubeCoord, self.coordinateSystem);
		// 	neighbours.forEach(function(neighbourCoord) {
		// 		// console.log(neighbourCoord)
		// 		// var neighbourCell = grid.getCell(neighbourCoord);
		// 		visited = floodRecurse( originalOwner, newColor, neighbourCoord, returnValue );
		// 	});
		// 	return returnValue;
		// }


		/*
		 * Color should be int-color.
		 */
		this.makeMove = function (player, newColor) {
			// console.log(newColor)

			var p0            = this.player[player].startCoord;
			var cubeCoord     = this.coordinateSystem.toCubeCoordinates(p0);
			var linearCoord   = this.coordinateSystem.toLinearCoordinates(p0);
			var originalOwner = this.array[linearCoord].owner;

			var returnValue;
			returnValue = floodRecurse ( originalOwner, newColor, cubeCoord, {modified:[], visited:[]});

			this._updateWinner();

			return returnValue.modified;
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

	function Game (configuration, renderer) {

		var self = this;

		this.isStarted = false;

		this.renderer = renderer;
		this.conf     = configuration;

		function getStartingOffsetCoord(player, grid) {
			if (player === 1) {
				return {i:0, j:this.conf.grid.size.h-1};
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

	Game.prototype.paintHighlightAreaEdge = function(){
		var grid             = this.grid;
		var coordinateSystem = this.coordinateSystem;
		var model            = this.model.array;
		for (var i = 0; i < this.conf.grid.size.w; ++i) {
			for (var j = 0; j < this.conf.grid.size.h; ++j) {
				var offsetCoord = {i:i, j:j};
				var linearCoord = this.coordinateSystem.toLinearCoordinates(offsetCoord);
				var cell        = grid.getCell(offsetCoord);
				cell.edges = [];
				
				if ( ! cell.isHighlighted ) { continue; }

				var owner = this.model.array[linearCoord].owner;
				cell.edgeColor = this.player[owner].color;
				
				var neighbours = HexMath.getNeighbours(offsetCoord, coordinateSystem);
				neighbours.forEach(function(neighbourCoord) {
					var neighbourCell  = grid.getCell(neighbourCoord);
					if (neighbourCell === null) {
						cell.edges.push( HexMath.directionForPoints(offsetCoord, neighbourCoord, coordinateSystem) );
						return;
					}
					
					var neighbourOwner = model[ coordinateSystem.toLinearCoordinates(neighbourCoord) ].owner;
					if  (      (!neighbourCell.isHighlighted)
							|| ( owner        !== neighbourOwner )
						) {
						cell.edges.push( HexMath.directionForPoints(offsetCoord, neighbourCoord, coordinateSystem) );
					}
				});

				cell.draw();
			}
		}
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
		// console.log('logic', this.model.currentPlayer)
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
	API.Game = Game;
	API.AI = ArtificialIntelligence;


	return API;
}();