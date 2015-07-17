function HexGrid( gridConf, colorArray ) {

    var self = this;

    // ========================================================================
    // === Coordinate system ==================================================
    // ========================================================================
    // 
    // Applies coordinate handling and conversion to the HexGrid prototype.
    // 
    // TODO: Apply to any prototype with the correct fields?
    //
    // There are four coordinate types.
    // Pixel:
    //      
    //      Basis: x, y
    // Offset:
    //      
    //      Basis: i, j
    // Cube:
    //      
    //      Basis: x, y, z
    // Axial:
    //      
    //      Basis: q, r

    self.cubeRound = function (h) {
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

    self.axialRound = function (axialCoord) {
        // From amit
        var cubeCoord;
        cubeCoord  = this._axial.toCubeCoordinates(axialCoord);
        cubeCoord  = this.cubeRound(cubeCoord);
        axialCoord = this._cube.toAxialCoordinates(cubeCoord);
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

    self._toPixelCoordinates = function (c) {
        if        (isPixelCoordinates(  c )) {
            return c;
        } else if (isOffsetCoordinates( c )) {
            return self._offset.toPixelCoordinates;
        } else if (isCubeCoordinates(   c )) {
            return self._cube.toPixelCoordinates(c);
        } else if (isAxialCoordinates(  c )) {
            return self._axial.toPixelCoordinates(c);
        }
    }
    /**
     * Converts the current coordinate object to offset coordinates.
     * @param  {pixel|offset|cube|axial} c coordinates given in any of the four coordinate types.
     * @return {offset} the same coordinate in the offset coordinate system.
     */
    self._toOffsetCoordinates = function (c) {
        if        (isPixelCoordinates(  c )) {
            return self._pixel.toOffsetCoordinates(c);
        } else if (isOffsetCoordinates( c )) {
            return c;
        } else if (isCubeCoordinates(   c )) {
            return self._cube.toOffsetCoordinates(c);
        } else if (isAxialCoordinates(  c )) {
            return self._axial.toOffsetCoordinates(c);
        }
    }
    self._toCubeCoordinates = function (c) {
        if        (isPixelCoordinates(  c )) {
            return self._pixel.toCubeCoordinates(c);
        } else if (isOffsetCoordinates( c )) {
            return self._offset.toCubeCoordinates(c);
        } else if (isCubeCoordinates(   c )) {
            return c;
        } else if (isAxialCoordinates(  c )) {
            return self._axial.toCubeCoordinates(c);
        }
    }
    self._toAxialCoordinates = function (c) {
        if        (isPixelCoordinates(  c )) {
            return self._pixel.toAxialCoordinates(c);
        } else if (isOffsetCoordinates( c )) {
            return self._offset.toAxialCoordinates(c);
        } else if (isCubeCoordinates(   c )) {
            return self._cube.toAxialCoordinates(c);
        } else if (isAxialCoordinates(  c )) {
            return c;
        }
    }

    self._pixel = {}
    self._pixel.toOffsetCoordinates = function (pixelCoord) {
        var cubeCoord   = self._pixel.toCubeCoordinates(pixelCoord);
        var offsetCoord = self._cube.toOffsetCoordinates(cubeCoord);
        return offsetCoord;
    }
    self._pixel.toCubeCoordinates = function (pixelCoord) {
        var axialCoord = self._pixel.toAxialCoordinates(pixelCoord);
        var cubeCoord  = self._axial.toCubeCoordinates(axialCoord);
        return cubeCoord;
    }
    self._pixel.toAxialCoordinates = function (pixelCoord) {
        pixelCoord.x -= self.position.x;
        pixelCoord.y -= self.position.y;
        var q = pixelCoord.x * 2/3 / self.scale.x;
        var r = (-pixelCoord.x / 3 + Math.sqrt(3)/3 * pixelCoord.y) / self.scale.y;
        var axialCoord = {q:q,r:r};
        return self.axialRound( axialCoord );
    }

    self._offset = {}
    self._offset.toPixelCoordinates = function (offsetCoord) {
        var cubeCoord  = self._offset.toCubeCoordinates(offsetCoord);
        var pixelCoord = self._cube.toPixelCoordinates(cubeCoord);
        return pixelCoord;
    }
    self._offset.toCubeCoordinates = function (offsetCoord) {
        var x = offsetCoord.i;
        var z = offsetCoord.j - (offsetCoord.i + (offsetCoord.i&1)) / 2;
        var y = -x-z;
        cubeCoord = {x:x,y:y,z:z};
        return cubeCoord;
    }
    self._offset.toAxialCoordinates = function (offsetCoord) {
        var cubeCoord  = self._offset.toCubeCoordinates(offsetCoord);
        var axialCoord = self._cube.toAxialCoordinates(cubeCoord);
        return axialCoord;
    }
    self._offset.inBounds = function (offsetCoord) {
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

    self._cube = {}
    self._cube.toPixelCoordinates = function (cubeCoord) {
        var axialCoord = self._cube.toAxialCoordinates(cubeCoord);
        var pixelCoord = self._axial.toPixelCoordinates(axialCoord);
        return pixelCoord;
    }
    self._cube.toOffsetCoordinates = function (cubeCoord) {
        var i = cubeCoord.x;
        var j = cubeCoord.z + (cubeCoord.x + (cubeCoord.x&1)) / 2;
        var offsetCoord = {i:i,j:j};
        return offsetCoord;
    }
    self._cube.toAxialCoordinates = function (cubeCoord) {
        var q = cubeCoord.x;
        var r = cubeCoord.z;
        var axialCoord = {q:q,r:r};
        return axialCoord;
    }
    self._cube.inBounds = function (cubeCoord) {
        var offsetCoord = self._cube.toOffsetCoordinates(cubeCoord);
        return self._offset.inBounds(offsetCoord);
    }

    self._axial = {}
    self._axial.toPixelCoordinates = function (axialCoord) {
        var x = self.scale.x * 3/2 * axialCoord.q;
        var y = self.scale.y * Math.sqrt(3) * (axialCoord.r + axialCoord.q/2);
        var pixelCoord = {
            x:x + self.position.x,
            y:y + self.position.y,
        };
        return pixelCoord;
    }
    self._axial.toOffsetCoordinates = function (axialCoord) {
        var cubeCoord = self._axial.toCubeCoordinates(cubeCoord);
        var offsetCoord = self._cube.toOffsetCoordinates(axialCoord);
        return offsetCoord;
    }
    self._axial.toCubeCoordinates = function (axialCoord) {
        var x = axialCoord.q;
        var z = axialCoord.r;
        var y = -x-z
        return {x:x,y:y,z:z};
    }

    // ========================================================================
    // === Constructor       ==================================================
    // ========================================================================
    self._graphics = new PIXI.Graphics()
    self.position = gridConf.position;
    self._graphics.scale.x = gridConf.scale.x;
    self._graphics.scale.y = gridConf.scale.y;

    self.scale = gridConf.scale;
    self.size  = gridConf.size;

    self._graphics = new PIXI.Graphics();

    self.cells = []
    for (var iy = 0; iy < self.size.h; ++iy) {
        for (var ix = 0; ix < self.size.w; ++ix) {

            var cellPosition = self._offset.toPixelCoordinates({i:ix, j:iy});
            var color = (colorArray!==null) ? colorArray[ix+iy*self.size.w] : (0xffffff);
            var cell     = new HexCell(     cellPosition,
                                            self.scale,
                                            color,
                                            gridConf.cell
                                        );
            self._graphics.addChild(cell._graphics)
            self.cells.push(cell)
        }
    }
}

HexGrid.prototype.draw = function () {
    // TODO: clear first
    for (var key in this.cells) {
        var obj = this.cells[key];
        obj.draw()
    }
}

HexGrid.prototype.drawCell = function ( cell ) {
    cell.draw()
}

HexGrid.prototype.getCell = function ( coordinate ) {
    var offsetCoord = this._toOffsetCoordinates(coordinate);

    if (offsetCoord.i < 0 || offsetCoord.i >= this.size.w) {return null;}
    if (offsetCoord.j < 0 || offsetCoord.j >= this.size.h) {return null;}

    var index = offsetCoord.i + offsetCoord.j * this.size.w;
    
    if (index > 0 || index < this.cells.length) {
        return this.cells[index];    
    }

    return null;
}

HexGrid.prototype.renderWith = function ( renderer ) {
    renderer.render(this._graphics);
}

HexGrid.prototype.highlightCells = function () {

}
