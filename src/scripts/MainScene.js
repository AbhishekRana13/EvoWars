import * as PIXI from 'pixi.js';
import { config } from "./appConfig";
import { Background } from './Background';
import { disposeData, Globals, PlayerStats } from './Globals';
import * as PIXIINPUT from "pixi-text-input";
import { GameScene } from './GameScene';
import { Label } from './LabelScore';


export class MainScene
{
    constructor()
    {

        globalThis.consoleEntity = (index) => Globals.entities[index];

        this.resetAllGlobals();

        this.sceneContainer = new PIXI.Container();

        this.container = new PIXI.Container();
        this.container.scale.set(config.scaleFactor);
        this.container.x = config.leftX;
        this.container.y = config.topY;

        this.background = new Background(Globals.resources.background.texture, window.innerWidth, window.innerHeight, 1);

        this.sceneContainer.addChild(this.background);

        this.sceneContainer.addChild(this.container);

        const input = new PIXIINPUT({
            input: {
                fontSize: '25pt',
                padding: '14px',
                width: '500px',
                color: '#26272E',
            },
            box:
             {
                default: {fill: 0xE8E9F3, rounded: 16, stroke: {color: 0xCBCEE0, width: 4}},
                focused: {fill: 0xE1E3EE, rounded: 16, stroke: {color: 0xABAFC6, width: 4}},
                disabled: {fill: 0xDBDBDB, rounded: 16}
            }
        });

       // console.log(input);
        input._placeholder = "Enter Username";
        input.x = config.logicalWidth/2 - input.width/2;
        input.y = config.logicalHeight/2 - input.height/2;

        this.container.addChild(input);

        const buttonConfig = {
            width : input.width * 0.5,
            height : input.height * 0.8,

        }
        const button = new PIXI.Graphics();
        button.beginFill(0x008000, 1);
        button.drawRect(-buttonConfig.width/2, -buttonConfig.height/2, buttonConfig.width, buttonConfig.height);
        button.endFill();

        

        button.x = config.logicalWidth/2;
        button.y = config.logicalHeight/2 + input.height;


        button.interactive = true;

        button.on("pointerdown", () => {
            Globals.heroName = input.text;
            Globals.scene.start(new GameScene());
        }, this );

        this.container.addChild(button);

        const label = new Label(button.x, button.y, 0.5, "Play", 38, 0xffffff);
        label.style.fontWeight = "bold";
        this.container.addChild(label);
        
        
       // globalThis.logInput = () => console.log(input.text);

     //  Globals.scene.start(new GameScene());

    }


    resize()
    {
        this.background.width = window.innerWidth;
        this.background.height = window.innerHeight;

        this.container.scale.set(config.scaleFactor);
        this.container.x = config.leftX;
        this.container.y = config.topY;
    }

    resetAllGlobals()
    {
        Globals.world = null;
        Globals.entities = {};
        Globals.heroName = "";

        PlayerStats.reset();

        disposeData.debugGraphic = [];
        disposeData.containers = [];
    }


}