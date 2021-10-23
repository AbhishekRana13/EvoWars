import * as PIXI from 'pixi.js';
import { Globals } from './Globals';
import { clamp, getAngleBetween, getAngleInRadian } from './Utilities';
import TWEEN from "@tweenjs/tween.js";
import * as P2 from "./p2";
import { config } from './appConfig';
export class Entity extends PIXI.Container
{
    constructor(parentContainer, world)
    {
        super();

        this.scaleValue = 0.4;
        this.scale.set(this.scaleValue);
        
        this.createEntityVisual();

        this.createBody(parentContainer, world);

        parentContainer.addChild(this);

        this.direction = new PIXI.Point((Math.random() * 2) - 1, (Math.random() * 2) - 1);
        this.lastDirection = new PIXI.Point();
        this.currentDirection = this.direction;
        setInterval(() => {
            this.direction = new PIXI.Point((Math.random() * 2) - 1, (Math.random() * 2) - 1);

            new TWEEN.Tween(this.currentDirection).to({x : this.direction.x, y : this.direction.y}, 2000).start();
        }, 3000);

        
    }

    sizeReset()
    {
        console.log("RESET");
        //this.scale.set(this.scaleValue);
        

        console.log(this.parent.scale.x);
        this.body.shapes[0].radius = this.globalWidth/2;
        
    }

    createEntityVisual()
    {
        this.visual = new PIXI.Sprite(Globals.resources.entity.texture);
        this.visual.anchor.set(0.5);

        this.addChild(this.visual);
    }

    createBody(parentContainer, world)
    {
        this.offsetX = (Math.random() * parentContainer.width) - (parentContainer.width/2);
        this.offsetY = (Math.random() * parentContainer.height) - (parentContainer.width/2);
        
        let xPos = (this.offsetX + parent.x) * config.scaleFactor;
        xPos += config.leftX;

        let yPos = (this.offsetY + parent.y) * config.scaleFactor;
        yPos += config.topY;

        this.body = new P2.Body({
            mass : 1,
            position : [xPos, yPos],
            fixedRotation : true
        });
        //console.log(parentContainer.width, parentContainer.height)
       // console.log(this.offsetX, this.offsetY);
        const circleShape = new P2.Circle({
            radius : this.globalWidth/2,
          // sensor : true
        });

        this.body.addShape(circleShape);
        
        world.addBody(this.body);

       // this.addBodyVisualisation(circleShape);

       // console.log(circleShape);

        
    }

    addBodyVisualisation(circleShape)
    {
        
        this.bodyVisual = new PIXI.Graphics();
        this.bodyVisual.beginFill(0xff0000, 0.3);
        
        this.bodyVisual.drawCircle(0, 0, circleShape.radius);
        this.bodyVisual.endFill();

        //this.addChild(this.bodyVisual);
    }

    get globalWidth()
    {
        return this.visual.width * this.scale.x * config.scaleFactor;
    }

    get globalHeight()
    {
        return this.visual.height * this.scale.y * config.scaleFactor;
    }

    get globalPosition()
    {
        let point = new PIXI.Point();

        this.getGlobalPosition(point, false);
        
        return point;
    }

    update(dt)
    {
        
        //return;
        this.body.angle = getAngleInRadian({x : 0, y : -1}, this.currentDirection);
        
        this.offsetX += this.currentDirection.x * dt * 5;
        this.offsetY += this.currentDirection.y * dt * 5;
        const width = this.visual.width * this.scale.x;
        const height = this.visual.height * this.scale.y;
        this.offsetX = clamp(this.offsetX, -this.parent.width/2 + width, this.parent.width/2 - width);
        this.offsetY = clamp(this.offsetY, -this.parent.height/2 + height, this.parent.height/2 - height);

        this.body.position[0] = this.parent.x + this.offsetX;
        this.body.position[0] *= config.scaleFactor;
        this.body.position[0] += config.leftX;

        this.body.position[1] = this.parent.y + this.offsetY;
        this.body.position[1] *= config.scaleFactor;
        this.body.position[1] += config.topY;

        

        this.x = ((this.body.position[0] - config.leftX) / config.scaleFactor) - this.parent.x;
        this.y = ((this.body.position[1] - config.topY) / config.scaleFactor) - this.parent.y;

        this.rotation = this.body.angle;

      //  console.log(this.globalPosition);
      //  console.log(this.parent.position);
      //  console.log(this.body.position);
        this.updateBodyVisual(dt);
    }

    updateBodyVisual(dt)
    {
        if(this.bodyVisual == undefined || this.bodyVisual == null) return;
        
        this.bodyVisual.clear();
        this.bodyVisual.beginFill(0xff0000, 0.3);
        this.bodyVisual.drawCircle(0, 0, this.body.shapes[0].radius);
        this.bodyVisual.endFill();
        this.bodyVisual.x = this.body.position[0];
        this.bodyVisual.y = this.body.position[1];
    }
}