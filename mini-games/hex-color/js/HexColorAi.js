function ArtificialIntelligence (player, model, game, strategy) {

		var self = this;

		this.player = player;
		this.model  = model;
		this.game   = game;
		this.impl   = null;

		this.RandomStrategy = function (lookahead) {
			this.model        = self.model;
			this.colorPalette = self.model.colorPalette;
			this.lookahead    = lookahead; /*Unused in this strat.*/

			this.getMove = function () {
				var numColors = this.colorPalette.length;
				var index  = Math.floor(Math.random()*numColors);
				return this.colorPalette[index];
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

			this.score = function (influence, surfaceArea, level) {
				var test = influence * surfaceArea;
				if (influence <= 0.2) {
					return influence * surfaceArea;
				} else if (influence >= 0.5) {
					return influence + 2000;
				} else {
					return influence + 1000;
				}
			}

			this.greedy = function ( currentLevel, prevColor, model ) {
				if (currentLevel === null || currentLevel === undefined || isNaN(currentLevel)) {currentLevel = 0;}
				if (model === null || model === undefined) {model = self.model;}

				if (currentLevel >= lookahead) {
					// var score = model.influence(self.model.currentPlayer);
					var score = model.getSurfaceArea(model.player[model.currentPlayer].startCoord);
					return {color:null, score:score};
				}

				// console.log(self.model.currentPlayer)

				var color;

				var bestScore = 0;
				var bestColor = 0;
				var bestLevel = 1000;
				for (var i = self.model.palette.length - 1; i >= 0; i--) {
					var color = self.model.palette[i];

					if (currentLevel === 0 && color === model.forbiddenColor) {continue;}
					if (color === prevColor) {continue;}

					var newModel;
					newModel = model.clone();
					newModel.makeMove(self.model.currentPlayer, color);

					var oldLocalScore;
					var oldLocalInfluence   = model.influence(self.model.currentPlayer);
					var oldLocalSurfaceArea = model.getSurfaceArea(model.player[model.currentPlayer].startCoord);
					// oldLocalScore       = (oldLocalInfluence > 0.2) ? (oldLocalInfluence) : (oldLocalSurfaceArea);
					oldLocalScore  = this.score(influence, surfaceArea);

					// Local win condition
					var localScore;
					var influence   = newModel.influence(self.model.currentPlayer);
					var surfaceArea = newModel.getSurfaceArea(model.player[model.currentPlayer].startCoord);
					// localScore  = (influence > 0.2) ? (influence) : (surfaceArea);
					localScore = this.score(influence, surfaceArea);

					if (localScore <= oldLocalScore) {continue;}

					if (localScore > bestScore) {
						bestScore = localScore;
						bestColor = color;
						level     = currentLevel
					}

					// Global optimization
					var obj = this.greedy(currentLevel + 1, color, newModel).score;
					var score = obj.score;
					if (score > bestScore) {
						bestScore = score;
						bestColor = color;
						bestLevel = obj.level;
					}
				};

				if (bestScore > 0) {
					return {color:bestColor, score:bestScore};
				} else {
					var numColors = self.model.palette.length;
					var newIndex  = Math.floor(Math.random()*numColors);
					var newColor  = self.model.palette[newIndex];
					return {color:newColor, score:0};
				}
			}

			this.getMove = function () {
				var bestMove = this.greedy(0, self.model.player[self.model.currentPlayer].color);
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
	this.setImplementation(strategy, 4);

	}