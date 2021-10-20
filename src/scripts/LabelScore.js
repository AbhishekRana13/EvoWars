import * as PIXI from "pixi.js";

export class Label extends PIXI.Text {
    constructor(x = 0, y = 0, anchor = 0, textToShow = "",size = 44, color = 0xff7f50, font = "Verdana") {
        super();


        this.x = x;
        this.y = y;
        this.anchor.set(anchor);
        this.style = {
            fontFamily: font,
            fontSize: size,
            fill: [color]
        };
        
        this.text = textToShow;
    }


}