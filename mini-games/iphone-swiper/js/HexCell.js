// requires HexMath.js

function HexCell( position, scale, color, conf) {
    this._graphics = new PIXI.Graphics();
    this._graphics.position.x = position.x
    this._graphics.position.y = position.y
    this._graphics.scale.x = scale.x;
    this._graphics.scale.y = scale.y;
    this.color = color;

    this.radialVertexLines     = [];
    this.radialVertexLineWidth = 0;
    this.radialVertexLineColor = 0;

    this.radialSideLines     = [];
    this.radialSideLineWidth = 0;
    this.radialSideLineColor = 0;

    this.edges     = [];
    this.edgeWidth = 0;
    this.edgeColor = 0;

    this.stroke      = false;
    this.strokeWidth = 0;
    this.strokeColor = 0;

    if (conf) {
        this.radialVertexLines     = [];
        this.radialVertexLineWidth = conf.radial.vertex.width;
        this.radialVertexLineColor = conf.radial.vertex.color;

        this.radialSideLines     = [];
        this.radialSideLineWidth = conf.radial.side.width;
        this.radialSideLineColor = conf.radial.side.color;

        this.edges     = [];
        this.edgeWidth = conf.edge.width;
        this.edgeColor = conf.edge.color;

        this.stroke      = conf.stroke.color !== undefined;
        this.strokeWidth = conf.stroke.width;
        this.strokeColor = conf.stroke.color;
    }

    this._colorStack = [];

    this.isHighlighted = false;
}

HexCell.prototype._pushColor = function (newColor) {
    this._colorStack.push(this.color);
    this.color = newColor;
}
HexCell.prototype._popColor = function () {
    if (this._colorStack) {
        this.color = this._colorStack.pop()
    }
}

HexCell.prototype.highlight = function (doHighlight) {
    if (doHighlight === undefined) {
        this.isHighlighted = !this.isHighlighted;
    } else if (doHighlight) {
        this.isHighlighted = true;
    } else {
        this.isHighlighted = false;
    }
    this.draw()
    // TODO: Signal dirty cell
}

HexCell.prototype.draw = function () {
    var color;
    if (this.isHighlighted) {
        color = HexColor.brighten(this.color);
    } else {
        color = this.color;
    }

    // Main hexagon
    this._graphics.clear(); // Important, otherwise mem-consumption will explode!
    this._graphics.beginFill(color);
    this._graphics.drawShape(HexMath.hexShape);
    this._graphics.endFill();

    // Radial lines to vertecies
    if (this.radialVertexLines.length) {
        this._graphics.beginFill(this.radialVertexLineColor);
        for (var i = this.radialVertexLines.length - 1; i >= 0; --i) {
            var line      = this.radialVertexLines[i];
            var edgeShape = HexMath.hexRadialLineVertex[line](this.radialVertexLineWidth);
            this._graphics.drawShape(edgeShape);
        };
        this._graphics.endFill();
    }

    // Radial lines to sides
    if (this.radialSideLines.length) {
        this._graphics.beginFill(this.radialSideLineColor);
        for (var i = this.radialSideLines.length - 1; i >= 0; --i) {
            var line      = this.radialSideLines[i];
            var edgeShape = HexMath.hexRadialLineSide[line](this.radialSideLineWidth);
            this._graphics.drawShape(edgeShape);
        };
        this._graphics.endFill();
    }

    // Specific edges
    if (this.edges.length) {
        this._graphics.beginFill(this.edgeColor);
        for (var i = this.edges.length - 1; i >= 0; --i) {
            var edge      = this.edges[i];
            var edgeShape = HexMath.hexEdge[edge](this.edgeWidth);
            this._graphics.drawShape(edgeShape);
        };
        this._graphics.endFill();
    }

    // Stroke
    if (this.stroke) {
        this._graphics.lineStyle( this.strokeWidth, this.strokeColor, 1 );
        this._graphics.drawShape( HexMath.hexOutlineShape );
        this._graphics.lineStyle( this.strokeWidth, this.strokeColor, 0 );
    };

    // Text
}

HexCell.prototype.renderWith = function ( renderer ) {
    renderer.render(this._graphics);
}