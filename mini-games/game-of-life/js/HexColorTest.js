// TODO: Test HSVtoRGB and back again verify that they give the same output

QUnit.test( "HSV - RGB - HSV", function( assert ) {

	var hsv1, rgb, hsv2;

	hsv1 = {h:0.5, s:0.5, v:0.5};
	rgb  = HexColor.HSV.toRGB(hsv1);
	hsv2 = HexColor.RGB.toHSV(rgb);

  assert.deepEqual( hsv1, hsv2 );
});

QUnit.test( "RGB - HSV - RGB", function( assert ) {

	var rgb1, hsv, rgb2;

	rgb1 = {r:128, g:127, b:129};
	hsv  = HexColor.RGB.toHSV(rgb1);
	rgb2 = HexColor.HSV.toRGB(hsv);

  assert.deepEqual( rgb1, rgb2 );
});

QUnit.test( "INT - RGB - INT", function( assert ) {

	var c1, rgb, c2;

	c1  = 0xff4410;
	rgb = HexColor.INT.toRGB(c1);
	c2  = HexColor.RGB.toINT(rgb);

  assert.deepEqual( c1, c2 );
});

QUnit.test( "INT - HSV - INT", function( assert ) {

	var c1, hsv, c2;

	c1  = 0xff4410;
	hsv = HexColor.INT.toHSV(c1);
	c2  = HexColor.HSV.toINT(hsv);

  assert.deepEqual( c1, c2 );
});

QUnit.test( "INT - HSV - RGB - HSV - INT", function( assert ) {

	var c1, hsv1, rgb, hsv2, c2;

	c1   = 0xff4410;
	hsv1 = HexColor.INT.toHSV(c1  );
	rgb  = HexColor.HSV.toRGB(hsv1);
	hsv2 = HexColor.RGB.toHSV(rgb );
	c2   = HexColor.HSV.toINT(hsv2);

  assert.deepEqual( c1, c2 );
});