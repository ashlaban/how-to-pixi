HexCoordinate = function () {

    var API = {};

    // ========================================================================
    // === Coordinate system ==================================================
    // ========================================================================
    // 
    // Applies coordinate handling and conversion to the HexGrid prototype.
    //
    // There are five coordinate types.
    // Pixel:
    //      Basis: x, y
    // Offset:
    //      Basis: i, j
    // Cube:
    //      Basis: x, y, z
    // Axial:
    //      Basis: q, r
    // Linear:
    //      Basis: integer
    
    /**
     * Constructs a new Coordinate System for use. Should be fed an object
     * containing the w and h properties. These fields specify the size of the
     * heaxgon coordinate system.
     * 
     * @param {Object} size Must contain a w and h property.
     */
    function System ( size, scale, originPixel ) {
        var self = this;

        this.pixel  = {};
        this.offset = {};
        this.cube   = {};
        this.axial  = {};
        this.linear = {};

        this.originPixel = originPixel; /*For pixel-to-cell conversion*/
        this.origin   = {i:0, j:0}; /*For future use*/
        this.scale  = scale;
        this.size   = size;

        // --------------------------------------------------------------------
        // --- Methods declared on sub-objects --------------------------------
        // --------------------------------------------------------------------
        self.pixel.toOffsetCoordinates = function (pixelCoord) {
            var cubeCoord   = self.pixel.toCubeCoordinates(pixelCoord);
            var offsetCoord = self.cube.toOffsetCoordinates(cubeCoord);
            return offsetCoord;
        }
        self.pixel.toCubeCoordinates = function (pixelCoord) {
            var axialCoord = self.pixel.toAxialCoordinates(pixelCoord);
            var cubeCoord  = self.axial.toCubeCoordinates(axialCoord);
            return cubeCoord;
        }
        self.pixel.toAxialCoordinates = function (pixelCoord) {
            pixelCoord.x -= self.originPixel.x;
            pixelCoord.y -= self.originPixel.y;
            var q = pixelCoord.x * 2/3 / self.scale.x;
            var r = (-pixelCoord.x / 3 + Math.sqrt(3)/3 * pixelCoord.y) / self.scale.y;
            var axialCoord = {q:q,r:r};
            return self.axialRound( axialCoord );
        }
        self.pixel.toLinearCoordinates = function (pixelCoord) {
            var offsetCoord = self.pixel.toOffsetCoordinates(pixelCoord);
            var linearCoord = self.offset.toLinearCoordinates(offsetCoord);
            return linearCoord;
        }

        self.offset.toPixelCoordinates = function (offsetCoord) {
            var cubeCoord  = self.offset.toCubeCoordinates(offsetCoord);
            var pixelCoord = self.cube.toPixelCoordinates(cubeCoord);
            return pixelCoord;
        }
        self.offset.toCubeCoordinates = function (offsetCoord) {
            var x = offsetCoord.i;
            var z = offsetCoord.j - (offsetCoord.i + (offsetCoord.i&1)) / 2;
            var y = -x-z;
            cubeCoord = {x:x,y:y,z:z};
            return cubeCoord;
        }
        self.offset.toAxialCoordinates = function (offsetCoord) {
            var cubeCoord  = self.offset.toCubeCoordinates(offsetCoord);
            var axialCoord = self.cube.toAxialCoordinates(cubeCoord);
            return axialCoord;
        }
        self.offset.toLinearCoordinates = function (offsetCoord) {
            return offsetCoord.i + (offsetCoord.j * self.size.w);
        }
        self.offset.inBounds = function (offsetCoord) {
            return  (   (
                                offsetCoord.i >= 0
                            &&  offsetCoord.i  < self.size.w
                        )
                        &&
                        (
                                offsetCoord.j >= 0
                            &&  offsetCoord.j  < self.size.h
                        ));
        }

        self.cube.toPixelCoordinates = function (cubeCoord) {
            var axialCoord = self.cube.toAxialCoordinates(cubeCoord);
            var pixelCoord = self.axial.toPixelCoordinates(axialCoord);
            return pixelCoord;
        }
        self.cube.toOffsetCoordinates = function (cubeCoord) {
            var i = cubeCoord.x;
            var j = cubeCoord.z + (cubeCoord.x + (cubeCoord.x&1)) / 2;
            var offsetCoord = {i:i,j:j};
            return offsetCoord;
        }
        self.cube.toAxialCoordinates = function (cubeCoord) {
            var q = cubeCoord.x;
            var r = cubeCoord.z;
            var axialCoord = {q:q,r:r};
            return axialCoord;
        }
        self.cube.toLinearCoordinates = function (cubeCoord) {
            var offsetCoord = self.cube.toOffsetCoordinates(cubeCoord);
            var linearCoord = self.offset.toLinearCoordinates(offsetCoord);
            return linearCoord;
        }
        self.cube.inBounds = function (cubeCoord) {
            var offsetCoord = self.cube.toOffsetCoordinates(cubeCoord);
            return self.offset.inBounds(offsetCoord);
        }

        self.axial.toPixelCoordinates = function (axialCoord) {
            var x = self.scale.x * 3/2 * axialCoord.q;
            var y = self.scale.y * Math.sqrt(3) * (axialCoord.r + axialCoord.q/2);
            var pixelCoord = {
                x:x + self.originPixel.x,
                y:y + self.originPixel.y,
            };
            return pixelCoord;
        }
        self.axial.toOffsetCoordinates = function (axialCoord) {
            var cubeCoord = self.axial.toCubeCoordinates(cubeCoord);
            var offsetCoord = self.cube.toOffsetCoordinates(axialCoord);
            return offsetCoord;
        }
        self.axial.toCubeCoordinates = function (axialCoord) {
            var x = axialCoord.q;
            var z = axialCoord.r;
            var y = -x-z
            return {x:x,y:y,z:z};
        }
        self.axial.toLinearCoordinates = function (axialCoord) {
            var offsetCoord = self.axial.toOffsetCoordinates(axialCoord);
            var linearCoord = self.offset.toLinearCoordinates(offsetCoord);
            return linearCoord;
        }

        self.linear.toPixelCoordinates  = function (linearCoord) {
            var offsetCoord = self.linear.toOffsetCoordinates(linearCoord);
            var pixelCoord  = self.offset.toPixelCoordinates(offsetCoord);
            return pixelCoord;
        }
        self.linear.toOffsetCoordinates = function (linearCoord) {
            var i = linearCoord % self.size.w;
            var j = linearCoord / self.size.w;
            return {i:i,j:j};
        }
        self.linear.toCubeCoordinates   = function (linearCoord) {
            var offsetCoord = self.linear.toOffsetCoordinates(linearCoord);
            var cubeCoord   = self.offset.toCubeCoordinates(offsetCoord);
            return cubeCoord;
        }
        self.linear.toAxialCoordinates  = function (linearCoord) {
            var offsetCoord = self.linear.toOffsetCoordinates(linearCoord);
            var axialCoord  = self.offset.toAxialCoordinates(offsetCoord);
            return axialCoord;
        }
        self.linear.inBounds            = function (linearCoord) {
            var offsetCoord = self.linear.toOffsetCoordinates(linearCoord);
            return self.offset.inBounds();
        }
    }

    // ========================================================================
    // === Ordinary methods ===================================================
    // ========================================================================

    System.prototype.cubeRound = function (h) {
        // From amit
        var rx = Math.round(h.x);
        var ry = Math.round(h.y);
        var rz = Math.round(h.z);

        var x_diff = Math.abs(rx - h.x);
        var y_diff = Math.abs(ry - h.y);
        var z_diff = Math.abs(rz - h.z);

        if (x_diff > y_diff && x_diff > z_diff) {
            rx = -ry-rz;
        } else if (y_diff > z_diff) {
            ry = -rx-rz;
        } else {
            rz = -rx-ry;
        }

        return {x:rx, y:ry, z:rz};
    }

    System.prototype.axialRound = function (axialCoord) {
        // From amit
        var cubeCoord;
        cubeCoord  = this.axial.toCubeCoordinates(axialCoord);
        cubeCoord  = this.cubeRound(cubeCoord);
        axialCoord = this.cube.toAxialCoordinates(cubeCoord);
        return axialCoord;
    }

    function isPixelCoordinates(c) {
        return c 
                && c.x !== undefined
                && c.y !== undefined
                && c.z === undefined;
    }
    function isOffsetCoordinates(c) {
        return c 
                && c.i !== undefined
                && c.j !== undefined;
    }
    function isCubeCoordinates(c) {
        return c 
                && c.x !== undefined
                && c.y !== undefined
                && c.z !== undefined;

    }
    function isAxialCoordinates(c) {
        return c
                && c.q !== undefined
                && c.r !== undefined;
    }
    function isLinearCoordinates(c) {
        return Number.isInteger(c);
    }

    System.prototype.toPixelCoordinates = function (c) {
        if        (isPixelCoordinates(  c )) {
            return c;
        } else if (isOffsetCoordinates( c )) {
            return this.offset.toPixelCoordinates;
        } else if (isCubeCoordinates(   c )) {
            return this.cube.toPixelCoordinates(c);
        } else if (isAxialCoordinates(  c )) {
            return this.axial.toPixelCoordinates(c);
        } else if (isLinearCoordinates( c )) {
            return this.linear.toPixelCoordinates(c);
        }
    }
    /**
     * Converts the current coordinate object to offset coordinates.
     * @param  {pixel|offset|cube|axial} c coordinates given in any of the four coordinate types.
     * @return {offset} the same coordinate in the offset coordinate system.
     */
    System.prototype.toOffsetCoordinates = function (c) {
        if        (isPixelCoordinates(  c )) {
            return this.pixel.toOffsetCoordinates(c);
        } else if (isOffsetCoordinates( c )) {
            return c;
        } else if (isCubeCoordinates(   c )) {
            return this.cube.toOffsetCoordinates(c);
        } else if (isAxialCoordinates(  c )) {
            return this.axial.toOffsetCoordinates(c);
        } else if (isLinearCoordinates( c )) {
            return this.linear.toOffsetCoordinates(c);
        }
    }
    System.prototype.toCubeCoordinates = function (c) {
        if        (isPixelCoordinates(  c )) {
            return this.pixel.toCubeCoordinates(c);
        } else if (isOffsetCoordinates( c )) {
            return this.offset.toCubeCoordinates(c);
        } else if (isCubeCoordinates(   c )) {
            return c;
        } else if (isAxialCoordinates(  c )) {
            return this.axial.toCubeCoordinates(c);
        }
         else if (isLinearCoordinates( c )) {
            return this.linear.toCubeCoordinates(c);
        }
    }
    System.prototype.toAxialCoordinates = function (c) {
        if        (isPixelCoordinates(  c )) {
            return this.pixel.toAxialCoordinates(c);
        } else if (isOffsetCoordinates( c )) {
            return this.offset.toAxialCoordinates(c);
        } else if (isCubeCoordinates(   c )) {
            return this.cube.toAxialCoordinates(c);
        } else if (isAxialCoordinates(  c )) {
            return c;
        } else if (isLinearCoordinates( c )) {
            return this.linear.toAxialCoordinates(c);
        }
    }
    System.prototype.toLinearCoordinates = function (c) {
        if        (isPixelCoordinates(  c )) {
            return this.pixel.toLinearCoordinates(c);
        } else if (isOffsetCoordinates( c )) {
            return this.offset.toLinearCoordinates(c);
        } else if (isCubeCoordinates(   c )) {
            return this.cube.toLinearCoordinates(c);
        } else if (isAxialCoordinates(  c )) {
            return this.axial.toLinearCoordinates(c);
        } else if (isLinearCoordinates( c )) {
            return c;
        }
    }

    API.System = System;

    return API;

}();