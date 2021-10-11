import * as PIXI from 'pixi.js';
import { gameConfig } from './appConfig';
import { Globals } from './Globals';
import { getAngleBetween } from './Utilities';
import TWEEN from "@tweenjs/tween.js";

export class Entity extends PIXI.Container
{
    constructor(parentContainer)
    {
        super();

        const visual = new PIXI.Sprite(Globals.resources.entity.texture);
        visual.anchor.set(0.5);

        this.addChild(visual);
        
        this.scale.set(gameConfig.widthRatio * 0.7);
        
        
        this.x = (Math.random() * parentContainer.width) - parentContainer.width/2;
        this.y = (Math.random() * parentContainer.height) - parentContainer.height/2;


        parentContainer.addChild(this);

        this.direction = new PIXI.Point((Math.random() * 2) - 1, (Math.random() * 2) - 1);
        this.lastDirection = new PIXI.Point();
        this.currentDirection = this.direction;
        setInterval(() => {
            this.direction = new PIXI.Point((Math.random() * 2) - 1, (Math.random() * 2) - 1);

            new TWEEN.Tween(this.currentDirection).to({x : this.direction.x, y : this.direction.y}, 2000).start();
        }, 10000);
    }


    update(dt)
    {
        this.angle = getAngleBetween({x : 0, y : -1}, this.currentDirection);
        
        this.x += this.currentDirection.x * dt;
        this.y += this.currentDirection.y * dt;
    }
}