// TODO: Test HSVtoRGB and back again verify that they give the same output

QUnit.test( "Model - Flood - Efficiency", function( assert ) {

	var model1, model2;

	var conf = {size: {w: 60, h:60}};
	var coordinateSystem = new HexCoordinate.System(conf.size, {w:1, h:1}, {i:0, j:0});
	var colorPalette = [0];
	model1 = new HexGame.Model(conf, colorPalette, coordinateSystem, null);

	// for (var i = Math.floor(conf.size.w*conf.size.h*0.1); i >= 0; i--) {
	// 	var index = Math.floor(Math.random()*model1.array.length);
	// 	model1.array[index].owner = 2;
	// };

	model1.setStart({i:5, j:5}, 1);

	model2 = model1.clone();

	var originalOwner = 1;
	var newColor      = 0;
	var cubeCoord     = coordinateSystem.toCubeCoordinates({i:5,j:5});
	// console.log(cubeCoord, coordinateSystem.toOffsetCoordinates(cubeCoord))

	for (var j = 1; j < 100; j++) {
		var modified = model1.floodScanline( originalOwner, newColor, cubeCoord );
	};

	model2.flood(originalOwner, newColor, cubeCoord)

	assert.deepEqual( model1.array, model2.array );
});