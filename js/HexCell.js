function HexCell( position, scale, color) {
        this._graphics = new PIXI.Graphics();
        this._graphics.position.x = position.x
        this._graphics.position.y = position.y
        this._graphics.scale.x = scale.x;
        this._graphics.scale.y = scale.y;
        this.color = color;

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

        this._graphics.beginFill(color);
        this._graphics.drawShape(hexShape);        
        this._graphics.endFill();

        var lineWidth = Configuration.grid.lineWidth;
        var lineColor = Configuration.grid.lineColor;
        this._graphics.lineStyle( lineWidth, lineColor, 1 );
        this._graphics.drawShape(hexOutlineShape);
        this._graphics.lineStyle( lineWidth, lineColor, 0 );
    }

    HexCell.prototype.renderWith = function ( renderer ) {
        renderer.render(this._graphics);
    }