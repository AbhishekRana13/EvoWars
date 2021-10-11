import * as PIXI from "pixi.js";
import { appConfig, gameConfig } from "./appConfig";
import { Globals } from "./Globals";

export class Background extends PIXI.TilingSprite {
    constructor(topImage, scaleSize = null) {

        super(topImage);


        this.width = appConfig.width;
        this.height = appConfig.height;

        if(scaleSize != null)
        {
            this.width *= scaleSize;
            this.height *= scaleSize;
        }
    }
}