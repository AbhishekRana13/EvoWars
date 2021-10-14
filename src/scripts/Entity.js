import * as PIXI from 'pixi.js';
import { gameConfig } from './appConfig';
import { Globals } from './Globals';
import { clamp, getAngleBetween, getAngleInRadian } from './Utilities';
import TWEEN from "@tweenjs/tween.js";
import * as P2 from "./p2";
export class Entity extends PIXI.Container
{
    constructor(parentContainer, world)
    {
        super();
        this.scale.set(gameConfig.widthRatio * 0.7);
        
        this.createEntityVisual();

        this.createBody(parentContainer, world);

        parentContainer.addChild(this);

        this.direction = new PIXI.Point((Math.random() * 2) - 1, (Math.random() * 2) - 1);
        this.lastDirection = new PIXI.Point();
        this.currentDirection = this.direction;
        setInterval(() => {
            this.direction = new PIXI.Point((Math.random() * 2) - 1, (Math.random() * 2) - 1);

            new TWEEN.Tween(this.currentDirection).to({x : this.direction.x, y : this.direction.y}, 2000).start();
        }, 10000);

        
    }

    createEntityVisual()
    {
        this.visual = new PIXI.Sprite(Globals.resources.entity.texture);
        this.visual.anchor.set(0.5);

        this.addChild(this.visual);
    }

    createBody(parentContainer, world)
    {
        const randomX = (Math.random() * parentContainer.width) - parentContainer.width/2;
        const randomY = (Math.random() * parentContainer.height) - parentContainer.height/2;

        this.body = new P2.Body({
            mass : 1,
            position : [randomX, randomY],
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
        this.bodyVisual.beginFill(0xff0000, 0.3);
        
        this.bodyVisual.drawCircle(0, 0, this.visual.width/2);
        this.bodyVisual.endFill();

        this.addChild(this.bodyVisual);
    }

    get globalWidth()
    {
        return this.visual.width * this.scale.x;
    }

    get globalHeight()
    {
        return this.visual.height * this.scale.y;
    }

    update(dt)
    {
        this.body.angle = getAngleInRadian({x : 0, y : -1}, this.currentDirection);
        

        
        this.body.position[0] += this.currentDirection.x * dt;
        this.body.position[1] += this.currentDirection.y * dt;

        this.body.position[0] = clamp(this.body.position[0], -this.parent.width/2 + this.width, this.parent.width/2 - this.width);
        this.body.position[1] = clamp(this.body.position[1], -this.parent.height/2 + this.width, this.parent.height/2 - this.width);

        this.x = this.body.position[0];
        this.y = this.body.position[1];
        this.rotation = this.body.angle;
    }
}