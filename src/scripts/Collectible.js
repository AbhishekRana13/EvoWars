import * as PIXI from 'pixi.js';
import { config } from './appConfig';
import { Globals } from './Globals';
import * as P2 from "./p2";
export class Collectible extends PIXI.Container
{
    constructor(x, y, parent)
    {
        
         
        super();
        parent.addChild(this);

    

        const range = {min : config.logicalWidth * 0.01, max : config.logicalWidth * 0.02};
        
        this.radius = Math.floor((Math.random()* range.max) + range.min);

        this.xpPoint = 20 * (this.radius / (config.logicalWidth * 0.01 * config.scaleFactor));
        const randomColor = Math.floor(Math.random()*16777215);//.toString(16);
        
        this.offsetX = x;
        this.offsetY = y;
        
        let xPos = (x + parent.x) * config.scaleFactor;
        xPos += config.leftX;

        let yPos = (y + parent.y) * config.scaleFactor;
        yPos += config.topY;
        



        this.body = new P2.Body({
            mass : 1,
            position : [xPos, yPos],
            fixedRotation : true
        });

    

        const circleShape = new P2.Circle({
            radius : this.radius * parent.scale.x * config.scaleFactor,
            sensor : true
        });

        this.body.addShape(circleShape);

        Globals.world.addBody(this.body);

        
        
        
        const visualGraphic = new PIXI.Graphics();
        visualGraphic.beginFill(randomColor)
        visualGraphic.drawCircle(0, 0, this.radius);
        visualGraphic.endFill();
       
        this.addChild(visualGraphic);

        //this.x = x;
       // this.y = y;
    }

    sizeReset()
    {
        this.body.shapes[0].radius = this.radius * this.parent.scale.x * config.scaleFactor;
    }


    update(dt)
    {
        this.body.position[0] = this.parent.x + this.offsetX;
        this.body.position[0] *= config.scaleFactor;
        this.body.position[0] += config.leftX;

        this.body.position[1] = this.parent.y + this.offsetY;
        this.body.position[1] *= config.scaleFactor;
        this.body.position[1] += config.topY;

        this.x = (this.body.position[0] - config.leftX) / config.scaleFactor - this.parent.x;
        this.y = (this.body.position[1] - config.topY) / config.scaleFactor - this.parent.y;

      
    }
}