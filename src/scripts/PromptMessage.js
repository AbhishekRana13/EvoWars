import * as PIXI from 'pixi.js';
import { config } from './appConfig';
import { Label } from './LabelScore';

export class PromptMessage extends PIXI.Container
{
    constructor(msgToType = "")
    {
        super();

        const width = config.logicalWidth * 0.5;
        const height = config.logicalHeight * 0.4;

        const bgGraphic = new PIXI.Graphics();
        bgGraphic.beginFill(0x000000, 0.8);
        bgGraphic.drawRect(-width/2, -height/2, width, height);
        bgGraphic.endFill();

        bgGraphic.x = config.logicalWidth/2;
        bgGraphic.y = config.logicalHeight/2;

        this.label = new Label(bgGraphic.x, bgGraphic.y, 0.5, msgToType, 45, 0xffffff);
        this.label.style.fontWeight = "bold";
        this.addChild(bgGraphic);
        this.addChild(this.label);
    }

    
}