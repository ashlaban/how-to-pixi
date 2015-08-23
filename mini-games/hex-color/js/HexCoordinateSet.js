var HexCoordinateSet = function () {

	this.hash = Object.create(null);

};

HexCoordinateSet.prototype.add    = function ( x, y, z ) {
	var hash = this.hash;
	hash = hash[x];
	if (hash === undefined) {this.hash[x] = Object.create(null); hash = this.hash[x];}
	hash = hash[y];
	if (hash === undefined) {this.hash[x][y] = Object.create(null); hash = this.hash[x][y];}
	hash[z] = true;
}
HexCoordinateSet.prototype.remove = function (x, y, z) {
	var hash;
	hash = this.hash[x];
	if (hash === undefined) {return;}
	hash = this.hash[y];
	if (hash === undefined) {return;}
	hash = this.hash[z];
	hash[z] = false;
}
HexCoordinateSet.prototype.in = function (x, y, z) {
	var hash = this.hash;
	hash = hash[x];
	hash = hash && hash[y];
	hash = hash && hash[z];
	return hash;
}