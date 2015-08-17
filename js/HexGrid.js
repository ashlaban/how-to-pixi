function HexGrid( gridConf, model ) {

    var self = this;

    // ========================================================================
    // === Constructor       ==================================================
    // ========================================================================
    self._graphics = new PIXI.Graphics()
    self.position  = gridConf.position;
    self._graphics.scale.x = gridConf.scale.x;
    self._graphics.scale.y = gridConf.scale.y;

    self.scale = gridConf.scale;
    self.size  = gridConf.size;

    self.coordinateSystem = new HexCoordinate.System(self.size, self.scale, self.position);

    self._graphics = new PIXI.Graphics();

    self.cells = []
    for (var iy = 0; iy < self.size.h; ++iy) {
        for (var ix = 0; ix < self.size.w; ++ix) {

            var cellPixelCoord  = self.coordinateSystem.offset.toPixelCoordinates(  {i:ix, j:iy} );
            var cellLinearCoord = self.coordinateSystem.offset.toLinearCoordinates( {i:ix, j:iy} );
            var color = (model!==null) ? model[cellLinearCoord].color : (0xffffff);
            var cell     = new HexCell(     cellPixelCoord,
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
    var offsetCoord = this.coordinateSystem.toOffsetCoordinates(coordinate);

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
