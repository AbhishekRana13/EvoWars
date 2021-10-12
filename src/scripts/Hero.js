import * as PIXI from 'pixi.js'
import { appConfig, gameConfig } from './appConfig';
import { Globals } from './Globals';
import TWEEN, { Easing } from "@tweenjs/tween.js";
import * as P2 from "./p2";
import { iBounds } from './iBounds';

export class Hero extends PIXI.Container
{
    constructor()
    {
        super();

        this.visual = new PIXI.Sprite(Globals.resources.hero.texture);
        this.visual.anchor.set(0.5);
        
        this.addChild(this.visual);
        
        this.scale.set(gameConfig.widthRatio * 0.7);
        this.x = appConfig.halfWidth;
        this.y = appConfig.halfHeight;

        this.createSword();
        this.isSwinging = false;

        this.visual.iBounds = new iBounds(this.visual);
        //this.createBody();
    }

    createBody()
    {
        const body = new P2.Body({
            mass : 1,
            position : [0, 0]
        });

        const circleShape = new P2.Circle({
            radius : 5
        });

        body.addShape(circleShape);
        Globals.world.addBody(body);

        console.log(body);

    }


    createSword()
    {
        this.sword = new PIXI.Sprite(Globals.resources.sword.texture);
        this.sword.scale.set(0.8);
        this.sword.anchor.set(0.5, 1);

        this.sword.x -= this.visual.width * 0.8;
        this.sword.angle = -20;
        this.addChild(this.sword);

        
    }

    swingSword()
    {
        if(this.isSwinging) return;
        this.isSwinging = true;
        new TWEEN.Tween(this.sword)
            .to({angle : 90, x : 0, y : -this.visual.width * 0.8}, 350)
            .easing(Easing.Back.In)
            .onComplete((object) => {
                new TWEEN.Tween(object)
                    .to({angle : -20, x : -this.visual.width * 0.8, y : 0}, 150)
                    .delay(500)
                    .onComplete(() => {
                        this.isSwinging = false;
                    })
                    .start();
            })
            .start();
    }

    
}