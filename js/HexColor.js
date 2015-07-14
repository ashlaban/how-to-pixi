var HexColor = (function () {

    function isRGB(c) {
        return  (
                    c 
                    && c.r !== undefined
                    && c.g !== undefined
                    && c.b !== undefined
                );
    }
    function isHSV(c) {
        return  (
                    c 
                    && c.h !== undefined
                    && c.s !== undefined
                    && c.v !== undefined
                );
    }
    function isINT(c) {
        return Number.isInteger(c);
    }

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
            r: (r * 255),
            g: (g * 255),
            b: (b * 255)
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
        var c = {r:r,g:g,b:b};
        return c;
    }

    function RGBtoINT(r, g, b) {
        if ( r && g === undefined && b === undefined) {
            g = r.g, b = r.b, r = r.r;
        }
        var c = Math.floor(r) + 256*Math.floor(g) + 256*256*Math.floor(b);
        return c;
    }

    function INTtoHSV(c) {
        return RGBtoHSV(INTtoRGB(c));
    }

    function HSVtoINT(h, s, v) {
        if (h && s === undefined && v === undefined) {
            s = h.s, v = h.v, h = h.h;
        }
        return RGBtoINT(HSVtoRGB(h, s, v));
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
        var s = 0.20 + (Math.random() - 0.5) * 0.125
        var v = 0.75 + (Math.random() - 0.5) * 0.125

        var c = HSVtoINT( h, s, v );
        return c;
    }

    function brighten(c) {
        var result;

        if (isRGB(c)) {
            
            result = RGBtoHSV(c);
            result.v = result.v + 0.5;
            if (result.v > 1.0) {result.v = 1.0;}
            result = HSVtoRGB(result);

        } else if (isHSV(c)) {
            
            result.v = result.v + 0.5;
            if (result.v > 1.0) {result.v = 1.0;}
        
        } else {
        
            result = INTtoHSV(c);
            result.v = result.v + 0.5;
            if (result.v > 1.0) {result.v = 1.0;}
            result =  HSVtoINT(result);
        
        }

        return result;
    }

    function invertValue(c) {
        var result;
        if (isRGB(c)) {
            result   = RGBtoHSV(c);
            result.v = 1-result.v;
            result   = HSVtoRGB(result);
        } else if (isHSV(c)) {
            result.v = 1-result.v;
        } else {
            result   = INTtoHSV(c);
            result.v = 1-result.v;
            result   = HSVtoINT(result);
        }
        return result;
    }

    function desaturate(c) {
        var result;
        if (isRGB(c)) {
            result   = RGBtoHSV(c);
            result.s = 0.1;
            result   = HSVtoRGB(result);
        } else if (isHSV(c)) {
            result.s = 0.1;
        } else {
            result   = INTtoHSV(c);
            result.s = 0.1;
            result   = HSVtoINT(result);
        }
        return result;
    }

    // External API
    var API = {};

    API.names = {
        blue     : 0x0000FF,
        green    : 0x00FF00,
        red      : 0xFF0000,
        cyan     : 0x00FFFF,
        magenta  : 0xFF00FF,
        yellow   : 0xFFFF00,
        black    : 0x000000,
        darkGray : 0x444444,
        gray     : 0x888888,
        lightGray: 0xBBBBBB,
        white    : 0xFFFFFF
    }

    API.HexPalette = HexPalette;
    API.pastell = getRandomPastellColor;
    API.brighten = brighten;
    API.invertValue = invertValue;
    API.desaturate = desaturate;

    API.RGB = {
        isRGB: isRGB,
        toHSV: RGBtoHSV,
        toINT: RGBtoINT
    };
    API.HSV = {
        isHSV: isHSV,
        toRGB: HSVtoRGB,
        toINT: HSVtoINT,
    };
    API.INT = {
        isINT: isINT,
        toHSV: INTtoHSV,
        toRGB: INTtoRGB
    };

    return API;

}());