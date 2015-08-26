function Cell (color, owner) {
	this.color = color;
	this.owner = owner;
}

Cell.prototype.newRandom = function (colorPalette) {
	var colorIndex = Math.floor(Math.random()*colorPalette.length);
	var color      = colorPalette[colorIndex];
	return new Cell( color, HexUtil.NO_PLAYER );
}

Cell.prototype.equals = function (other) {
	return other !== null 
		&& other !== undefined 
		&& this.color === other.color 
		&& this.owner === other.owner;
}

function HexModel ( conf, colorPalette, coordinateSystem, player ) {
	var self = this;

	this.palette = colorPalette;
	this.conf    = conf;

	this.player        = player;
	this.currentPlayer = HexUtil.PLAYER_1;
	this.winner        = HexUtil.NO_PLAYER;

	this.coordinateSystem = coordinateSystem;

	var arraySize = this.conf.size.w*this.conf.size.h;
	this.array = Array.apply(null, Array(arraySize)).map(function () {
		return Cell.prototype.newRandom(self.palette);
	});

	this.setStart = function ( p0, owner ) {
		var linearCoord = this.coordinateSystem.toLinearCoordinates(p0);
		this.array[linearCoord].owner = owner;
	}

	/**
	 * customLogic should have two callbacks with the following properties:
	 * 	customLogic.shouldTerminate(cubeCoord, linearCoord, modelCell)
	 * 		Tests whether flooding should be terminated at this node.
	 * 		Return true  - terminate.
	 * 		Return false - continue.
	 * 	customLogic.updateCell(cubeCoord, linearCoord)
	 * 		Updates a cell of the model according to custom logic.
	 * 		
	 * @param  {[type]} cubeCoord   [description]
	 * @param  {[type]} customLogic [description]
	 * @return {[type]}             [description]
	 */
	function flood (cubeCoord, customLogic) {

		var modified = [];
		var visited  = Object.create(null);
		var toVisit  = HexMath.getNeighbours(cubeCoord, self.coordinateSystem);

		while (toVisit.length) {
			cubeCoord = toVisit.pop();
			if (!self.coordinateSystem.cube.inBounds(cubeCoord)) {continue;}

			var linearCoord = self.coordinateSystem.toLinearCoordinates(cubeCoord);
			var modelCell   = self.array[linearCoord];

			visited[linearCoord] = true;
			modified.push(cubeCoord);

			// Custom termination check
			if (customLogic.shouldTerminate(self, cubeCoord, linearCoord, modelCell)) {continue;}
			customLogic.updateCell(self, cubeCoord, linearCoord );

			var neighbours = HexMath.getNeighbours(cubeCoord, self.coordinateSystem);
			for (var i=neighbours.length-1; i >= 0; --i) {
				var neighbourCoord = neighbours[i];
				if (!visited[self.coordinateSystem.toLinearCoordinates(neighbourCoord)]){
					toVisit.push(neighbourCoord);	
				}
			}
		}

		return modified;
	}

	/*
	 * Color should be int-color.
	 */
	this.makeMove = function (player, newColor) {
		var p0            = this.player[player].startCoord;
		var cubeCoord     = this.coordinateSystem.toCubeCoordinates(p0);
		var linearCoord   = this.coordinateSystem.toLinearCoordinates(p0);
		var originalOwner = this.array[linearCoord].owner;

		var customLogic = {};
		customLogic.originalOwner = originalOwner;
		customLogic.newColor      = newColor;
		customLogic.shouldTerminate = function (model, cubeCoord, linearCoord, modelCell) {
			return (modelCell.owner !== originalOwner && !(modelCell.owner === 0 && modelCell.color === newColor));
		}
		customLogic.updateCell = function (model, cubeCoord, linearCoord) {
			self.array[linearCoord].color = newColor;
			self.array[linearCoord].owner = originalOwner;
		}

		console.log('test')
		var modified = flood (cubeCoord, customLogic);

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
		this.winner = HexUtil.NO_PLAYER;
	};
}

HexModel.prototype.equals = function (other) {
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

HexModel.prototype.nextPlayer = function () {
	this.currentPlayer = (this.currentPlayer % (this.player.length - 1)) + 1;
}

HexModel.prototype.clone = function () {
	var newModel = new HexModel(this.conf, this.palette, this.coordinateSystem, this.player);
	newModel.currentPlayer = this.currentPlayer;
	newModel.winner        = this.winner;
	for (var i = this.array.length - 1; i >= 0; i--) {
		var oldModelCell = this.array[i];
		newModel.array[i] = new Cell(oldModelCell.color, oldModelCell.owner);
	};
	return newModel;
}

HexModel.prototype.getCell = function (coordinate) {
		var coordinate = coords[i];
		var linearCoordinate = this.coordinateSystem.toLinearCoordinates(coordinate);

		if (this.coordinateSystem.inBounds(linearCoordinate)) {
			return this.array[linearCoordinate];
		}

		return null;
}

HexModel.prototype.getCells = function (coords) {
	var retVal = [];
	for (var i=coords.length-1; i >= 0; --i) {
		var cell = this.getCell(coords[i]);
		if (cell !== null) { retVal.push( cell );}
	}
	return array;
}