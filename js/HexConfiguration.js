// Requires HexMath.js
// Requires HexColor.js

var HexConfiguration = function () {

	var API = {};

	var colorPalette = new HexColor.HexPalette( HexColor.pastell, 1 );

	function Configuration () {
		var self = this;

		// View default configruation
		this.view = {
            size    : { w:320, h:320 },
            padding : {
                        top: 31*HexMath.sin_60, 
                        right: 16,
                        bottom: 31*HexMath.sin_60,
                        left: 16
                       },
        };

        // Grid default configruation
        this.grid = {
        	colorPalette: colorPalette,

            lineColor: HexColor.desaturate(HexColor.invertValue(colorPalette.colors[0])),
            lineWidth: 0.15,

            position : { x: 25, y: 40 },
            scale    : { x: 7 , y: 7  },
             size    : { w:30 , h: 20 },
            // size     : hexesInCanvas
        };

        // Hexway's Game of Life default configruation
        this.life = {
            stepsPerSecond: 2
        };
	}

	Configuration.prototype.center = function() {

		var sideLength = {	x: 4 * HexMath.cos_60 * this.grid.scale.x,
							y: 2 * HexMath.sin_60 * this.grid.scale.y
						 };

		var isOdd     = {	x:(this.grid.size.w % 2),
							y:(this.grid.size.h % 2),
						};
		var evenWidth = this.grid.size.w - isOdd.x;

		var gridHeight = sideLength.y * this.grid.size.h;

		var gridLength = { 	x: 3/4 * sideLength.x * this.grid.size.w,
							y:  (this.grid.size.h >= 2)
								?  (gridHeight + sideLength.y / 2)
								:  (gridHeight),
							};

		var padding = {
			x: this.view.size.w - gridLength.x,
			y: this.view.size.h - gridLength.y,
		}

		this.view.padding.top    = padding.y / 2;
		this.view.padding.right  = padding.x / 2;
		this.view.padding.bottom = padding.y / 2;
		this.view.padding.left   = padding.x / 2;

		this.grid.position.x = this.view.padding.left + sideLength.x / 2 - this.grid.lineWidth*this.grid.scale.x/2;
		this.grid.position.y = this.view.padding.top  + sideLength.y     - this.grid.lineWidth/2;

	}

	Configuration.prototype.fill = function () {
        var sizePixels = {
            w: this.view.size.w
                - this.view.padding.left
                - this.view.padding.right,
            h: this.view.size.h
                - this.view.padding.top
                - this.view.padding.bottom
        }
        var hexSide = {
            w: this.grid.scale.x * (2 - 0.5),
            h: this.grid.scale.y * 2 * HexMath.sin_60
        }
        var w = sizePixels.w/hexSide.w;
        var h = sizePixels.h/hexSide.h;

        this.grid.size.w = Math.ceil(w);
        this.grid.size.h = Math.ceil(h);
    }

	// External API
	API.Configuration = Configuration;

	return API;

}();