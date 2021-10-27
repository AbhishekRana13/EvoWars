import * as PIXI from 'pixi.js';
import { config } from './appConfig';
import { Globals } from './Globals';
import { Label } from './LabelScore';
import { MainScene } from './MainScene';

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


        const buttonConfig = {
            width: 200,
            height : 60
        }

        const button = new PIXI.Graphics();
        button.beginFill(0x008000, 1);
        button.drawRect(-buttonConfig.width/2, -buttonConfig.height/2, buttonConfig.width, buttonConfig.height);
        button.endFill();

        

        button.x = config.logicalWidth/2;
        button.y = config.logicalHeight/2 + button.height * 1.2;


        button.interactive = true;

        button.on("pointerdown", () => {
            Globals.scene.start(new MainScene());
        }, this );

        this.addChild(button);

        const label = new Label(button.x, button.y, 0.5, "Play", 38, 0xffffff);
        label.style.fontWeight = "bold";
        this.addChild(label);
        
    }

    
}