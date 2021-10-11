import * as PIXI from 'pixi.js'
import { appConfig, gameConfig } from './appConfig';
import { Globals } from './Globals';
import TWEEN, { Easing, Tween } from "@tweenjs/tween.js";
import { degreeToRadian, getPointOnCircle } from './Utilities';
import { DebugCircle } from './DebugCircle';

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

        

    }

    createSword()
    {
        this.sword = new PIXI.Sprite(Globals.resources.sword.texture);
        this.sword.scale.set(0.8);
        this.sword.anchor.set(0.5, 1);

        //const radianAngle = getAngleInRadian({x: 0, y : -1}, normalizeDir);
        //this.sword.position = getPointOnCircle({x : this.x, y : this.y}, 50, Math.PI * 1.5);
        
        
        //this.sword.position = getPointOnCircle(this.position, this.visual.width, 90);

        //console.log(getPointOnCircle(this.position, this.visual.width, 90))
        this.sword.x -= this.visual.width * 0.8;
        this.sword.angle = -20;
       new DebugCircle(this.sword, 10, this);
        this.addChild(this.sword);

        
    }

    swingSword()
    {
        if(this.isSwinging) return;
        this.isSwinging = true;
        new TWEEN.Tween(this.sword)
            .to({angle : 45}, 350)
            .easing(Easing.Back.In)
            .onComplete((object) => {
                new TWEEN.Tween(object)
                    .to({angle : -20}, 150)
                    .delay(500)
                    .onComplete(() => {
                        this.isSwinging = false;
                    })
                    .start();
            })
            .start();
    }

    
}