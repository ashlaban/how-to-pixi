HexColor = {};
new function () {

    /**
     * Converts from the HSV color space to RGB.
     *
     * Takes h, s, v values or an object with field .h, .s, .v.
     * The components should be normalised to [0, 1].
     * 
     * @param {float} h hue channel
     * @param {float} s satuartion channel
     * @param {float} v value channel
     *
     * @return an object with components .r, .g .b normalised to [0, 255].
     */
    function HSVtoRGB(h, s, v) {
        // Taken from:
        // http://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
        var r, g, b, i, f, p, q, t;
        if (h && s === undefined && v === undefined) {
            s = h.s, v = h.v, h = h.h;
        }
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        return {
            r: Math.floor(r * 255),
            g: Math.floor(g * 255),
            b: Math.floor(b * 255)
        };
    }

    /**
     * Converts from the RGB color space to to HSV.
     * 
     * Takes r, g, b values or an object with fields .r, .g and .b.
     * The components should be normalised to [0, 255].
     * 
     * @param {float} r red channel
     * @param {float} g green channel
     * @param {float} b blue channel
     *
     * @return an object with fields .h, .s, .v normalised to [0, 1].
     */
    function RGBtoHSV(r, g, b) {
        var h, s, v, M, m, C, H;
        if ( r && g === undefined && b === undefined) {
            g = r.g, b = r.b, r = r.r;
        }
        if (r > 1) {r = (r%256)/255;}
        if (g > 1) {g = (g%256)/255;}
        if (b > 1) {b = (b%256)/255;}

        console.log( r, g, b );

        // Chroma
        M = Math.max(r,g,b);
        m = Math.min(r,g,b);
        C = M-m;

        // Hue
        // Note: Javascript % is the remainder operator. To get the modulo 
        // operator the idiom ((x%n)+n)%n is used.
        if      ( C === 0 ) { H = 0; }
        else if ( M === r ) { H = ((g-b)/C) % 6; H = (H+6) % 6; }
        else if ( M === g ) { H = ((b-r)/C) + 2; }
        else if ( M === b ) { H = ((r-g)/C) + 4; }
        h = H / 6;

        // Value
        v = M;

        // Saturation
        s = (v === 0) ? (0) : (C/v);

        return {h:h,s:s,v:v};
    }

    function INTtoRGB(c) {
        var r = Math.floor(c        ) % 256;
        var g = Math.floor(c/256    ) % 256;
        var b = Math.floor(c/256/256) % 256;
        var newColor = {r:r,g:g,b:b};
        return newColor;
    }

    function RGBtoINT(r, g, b) {
        var c;
        if ( r && g === undefined && b === undefined) {
            g = r.g, b = r.b, r = r.r;
        }
        c = r + 256*g + 256*256*b;
        return c;
    }

    function INTtoHSV(c) {
        var rgb = INTtoRGB(c);
        var hsv = RGBtoHSV(rgb);
        console.log("HEJ: Nu är jag här inne")
        console.log(c)
        console.log(rgb)
        console.log(hsv)
        return hsv;
    }

    function HSVtoINT(c) {
        var rgb = HSVtoRGB(c);
        var i   = RGBtoINT(rgb);

        console.log("HSVtoINT::print");
        console.log(c);
        console.log(rgb);
        console.log("INT - " + i)

        return i;
    }

    /**
     * Class HexColor.HexPalette
     * @param {[type]} generatorFunction [description]
     * @param {[type]} nColors           [description]
     */
    function HexPalette( generatorFunction, nColors ) {

        var self = this;
        
        self.colors = [];

        for (var i = nColors - 1; i >= 0; i--) {
            var color = generatorFunction();
            self.colors.push( color );
        };

        self.random = function() {
            var index = Math.floor( Math.random() * self.colors.length );
            return self.colors[index];
        }
    }

    function getRandomPastellColor() {
        var h = Math.random()
        var s = 0.45 + (Math.random() - 0.5) * 0.25
        var v = 0.75 + (Math.random() - 0.5) * 0.25

        var color = HSVtoRGB( h, s, v );
        return color.r+color.g*256+color.b*256*256;
    }

    function brighten(c) {
        var brightColor;

        console.log(c)

        if (c && c.r && c.g && c.b) {
            brightColor = RGBtoHSV(c);
            brightColor.v = brightColor.v + 0.5;
            if (brightColor.v > 1.0) {brightColor.v = 1.0;}
            console.log(brightColor)
            return HSVtoRGB(brightColor);
        } else if (c && c.h && c.s && c.v) {
            brightColor.v = brightColor.v + 0.5;
            if (brightColor.v > 1.0) {brightColor.v = 1.0;}
            console.log(brightColor)
            return brightColor;
        } else {
            brightColor = INTtoHSV(c);
            brightColor.v = brightColor.v + 0.5;
            if (brightColor.v > 1.0) {brightColor.v = 1.0;}
            return HSVtoINT(brightColor);
        }

        // TODO: Throw error. This should not be possible.
        return 0;
    }

    // External API
    HexColor.HexPalette = HexPalette;
    HexColor.pastell = getRandomPastellColor;
    HexColor.brighten = brighten;

    HexColor.RGB = {};
    HexColor.HSV = {};
    HexColor.INT = {};
    HexColor.RGB.toHSV = RGBtoHSV;
    HexColor.RGB.toINT = RGBtoINT;
    HexColor.HSV.toRGB = HSVtoRGB;
    HexColor.HSV.toINT = HSVtoINT;
    HexColor.INT.toRGB = INTtoRGB;
    HexColor.INT.toHSV = INTtoHSV;

}();