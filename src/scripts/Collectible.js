import * as PIXI from 'pixi.js';
import { gameConfig } from './appConfig';
import { Globals } from './Globals';
import * as P2 from "./p2";
export class Collectible extends PIXI.Container
{
    constructor(x, y, parent)
    {
        
         
        super();
        parent.addChild(this);

        

        const range = {min : 20 * gameConfig.widthRatio, max : 50 * gameConfig.widthRatio};
        
        const radius = Math.floor((Math.random()* range.max) + range.min);

        this.xpPoint = 20 * (radius / (30 * gameConfig.widthRatio));
        const randomColor = Math.floor(Math.random()*16777215);//.toString(16);
        
        this.offsetX = x;
        this.offsetY = y;
        
        
        this.body = new P2.Body({
            mass : 1,
            position : [x + parent.x , y + parent.y],
            fixedRotation : true
        });

    

        const circleShape = new P2.Circle({
            radius : radius * parent.scale.x,
            sensor : true
        });

        this.body.addShape(circleShape);

        Globals.world.addBody(this.body);

        
        
        
        const visualGraphic = new PIXI.Graphics();
        visualGraphic.beginFill(randomColor)
        visualGraphic.drawCircle(0, 0, radius);
        visualGraphic.endFill();
       
        this.addChild(visualGraphic);

        //this.x = x;
       // this.y = y;
    }


    update(dt)
    {
        this.body.position[0] = this.parent.x + this.offsetX;
        this.body.position[1] = this.parent.y + this.offsetY;
        this.x = this.body.position[0] - this.parent.x;
        this.y = this.body.position[1] - this.parent.y;
    }
}