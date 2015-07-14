function HexGrid( position, size, scale, colorArray ) {

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

    self._toPixelCoordinates = function (c) {
        if        (c && c.x && c.y && c.z === undefined) {
            return c;
        } else if (c && c.i && c.j) {
            return self._offset.toPixelCoordinates;
        } else if (c && c.x && c.y && c.z) {
            return self._cube.toPixelCoordinates(c);
        } else if (c && c.q && c.r) {
            return self._axial.toPixelCoordinates(c);
        }
    }
    /**
     * Converts the current coordinate object to offset coordinates.
     * @param  {pixel|offset|cube|axial} c coordinates given in any of the four coordinate types.
     * @return {offset} the same coordinate in the offset coordinate system.
     */
    self._toOffsetCoordinates = function (c) {
        if        (c && c.x && c.y && c.z === undefined) {
            return self._pixel.toOffsetCoordinates(c);
        } else if (c && c.i && c.j) {
            return c;
        } else if (c && c.x && c.y && c.z) {
            return self._cube.toOffsetCoordinates(c);
        } else if (c && c.q && c.r) {
            return self._axial.toOffsetCoordinates(c);
        }
    }
    self._toCubeCoordinates = function (c) {
        if        (c && c.x && c.y && c.z === undefined) {
            return self._pixel.toCubeCoordinates(c);
        } else if (c && c.i && c.j) {
            return self._offset.toCubeCoordinates(c);
        } else if (c && c.x && c.y && c.z) {
            return c;
        } else if (c && c.q && c.r) {
            return self._axial.toCubeCoordinates(c);
        }
    }
    self._toAxialCoordinates = function (c) {
        if        (c && c.x && c.y && c.z === undefined) {
            return self._pixel.toAxialCoordinates(c);
        } else if (c && c.i && c.j) {
            return self._offset.toAxialCoordinates(c);
        } else if (c && c.x && c.y && c.z) {
            return self._cube.toAxialCoordinates(c);
        } else if (c && c.q && c.r) {
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

    self._axial = {}
    self._axial.toPixelCoordinates = function (axialCoord) {
        var x = self.scale.x * 3/2 * axialCoord.q;
        var y = self.scale.y * Math.sqrt(3) * (axialCoord.r + axialCoord.q/2);
        var pixelCoord = {x:x,y:y};
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
    self._graphics.position.x = position.x;
    self._graphics.position.y = position.y;
    self._graphics.scale.x = scale.x;
    self._graphics.scale.y = scale.y;

    self.scale = scale;

    self.size = {};
    self.size.w = size.w;
    self.size.h = size.h;

    self._graphics = new PIXI.Graphics();

    self.cells = []
    for (var iy = 0; iy < self.size.h; ++iy) {
        for (var ix = 0; ix < self.size.w; ++ix) {

            var position = self._offset.toPixelCoordinates({i:ix, j:iy});
            console.log(position);

            var color    = colorPalette.random();
            var cell     = new HexCell(position, scale, color);
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
    var index = offsetCoord.i + offsetCoord.j * this.size.w;
    return this.cells[index];
}

HexGrid.prototype.renderWith = function ( renderer ) {
    renderer.render(this._graphics);
}

HexGrid.prototype.highlightCells = function () {

}
