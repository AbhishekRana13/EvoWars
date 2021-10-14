import * as PIXI from 'pixi.js'
import { appConfig, gameConfig } from './appConfig';
import { Globals } from './Globals';
import TWEEN, { Easing } from "@tweenjs/tween.js";
import * as P2 from "./p2";
import { DebugCircle } from './DebugCircle';
import { getDirectionBetween, getMagnitude, getMousePosition, normalize } from './Utilities';

export class Hero extends PIXI.Container
{
    constructor(world)
    {
        super();
        this.scale.set(gameConfig.widthRatio * 0.7);
        
        this.createHeroVisual();
        this.createSword();
        this.createBody(world);
        
        this.isSwinging = false;
    }

    createHeroVisual()
    {
        this.visual = new PIXI.Sprite(Globals.resources.hero.texture);
        this.visual.anchor.set(0.5);
        this.addChild(this.visual);
    }

    createBody(world)
    {
        this.body = new P2.Body({
            mass : 1,//type : P2.Body.KINEMATIC,
            position : [appConfig.halfWidth, appConfig.halfHeight],
            fixedRotation : true
        });

        const circleShape = new P2.Circle({
            radius : this.globalWidth/2,
           // sensor : true
        });

        this.body.addShape(circleShape);
        
        world.addBody(this.body);

        this.addBodyVisualisation(circleShape);

        
    }

    addBodyVisualisation(circleShape)
    {
        this.bodyVisual = new PIXI.Graphics();
        this.bodyVisual.beginFill(0x00ff00, 0.3);
        console.log(circleShape);
        this.bodyVisual.drawCircle(0, 0, this.visual.width/2);
        this.bodyVisual.endFill();

        this.addChild(this.bodyVisual);
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

    get globalWidth()
    {
        return this.visual.width * this.scale.x;
    }

    get globalHeight()
    {
        return this.visual.height * this.scale.y;
    }

    get getMouseDirection()
    {
       // return null;
        if(this.isSwinging) return null;

        const position = this.position;
        const mousePosition = getMousePosition();
        
        const direction = getDirectionBetween(position, mousePosition);
        const widthToCompare = this.globalWidth/2;

        
        return (getMagnitude(direction) > widthToCompare) ? normalize(direction) : null;
    }

    

    update(dt)
    {
        this.x = this.body.position[0];
        this.y = this.body.position[1];

        this.rotation = this.body.angle;
    }

    
}