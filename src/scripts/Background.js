import * as PIXI from "pixi.js";
import {config } from "./appConfig";
import { Globals } from "./Globals";

export class Background extends PIXI.TilingSprite {
    constructor(topImage,width = config.logicalWidth, height= config.logicalHeight, scaleSize = null) {

        super(topImage);


        this.width = width;
        this.height = height;

        if(scaleSize != null)
        {
            this.width *= scaleSize;
            this.height *= scaleSize;
        }
    }
}