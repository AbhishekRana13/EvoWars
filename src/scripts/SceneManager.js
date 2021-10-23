import * as PIXI from "pixi.js";
import TWEEN from "@tweenjs/tween.js";
import { Background } from "./Background";
import { Globals } from "./Globals";
import { DebugText } from "./DebugText";

export class SceneManager {
    constructor() {
        this.container = new PIXI.Container();
        this.scene = null;
    }

    start(scene) {
        if (this.scene) {
            this.scene.sceneContainer.destroy();
        }

        this.scene = scene;
        this.container.addChild(this.scene.sceneContainer);


        if( window.orientation == 90 || window.orientation == -90)
            {
                
                this.drawImageAbove();
            }
    }

    update(dt) {
        TWEEN.update();
        
        if (this.scene && this.scene.update) {
            this.scene.update(dt);
        }

        Globals.stats.update();
        Globals.fpsStats.update();

        // Globals.stats.begin();

        // // monitored code goes here

        // Globals.stats.end();
    }

    resize()
    {
        if (this.scene && this.scene.resize) {
            this.scene.resize();
        }
    }

    recievedMessage(msgType, msgParams)
    {
		if(this.scene && this.scene.recievedMessage)
        {
            this.scene.recievedMessage(msgType, msgParams);
        }
    }

    drawImageAbove()
    {
        this.aboveBackground = new Background(Globals.resources.cover.texture,Globals.resources.cover.texture);
        this.labelText = new DebugText("Move Back To Portrait Mode", window.innerWidth/2, window.innerHeight/2, "#FFF");
        this.container.addChild(this.aboveBackground.container);
        this.container.addChild(this.labelText);
    }

    removeImageAbove()
    {
        if(this.aboveBackground)
        {
            this.aboveBackground.container.destroy();
            this.labelText.destroy();
            this.labelText = null;
            this.aboveBackground = null;
        }
    }
}