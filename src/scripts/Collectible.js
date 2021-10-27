import * as PIXI from 'pixi.js';
import { config } from './appConfig';
import { gameSettings, Globals } from './Globals';
import * as P2 from "./p2";
import { fetchGlobalPosition } from './Utilities';
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
        

        this.body = new P2.Body({
            // mass :1 ,
            // position : [0, 0],
            // fixedRotation : true
            type : P2.Body.STATIC 
        });

        const circleShape = new P2.Circle({
            radius : this.radius * config.scaleFactor,
            sensor : true
        })
        circleShape.group = gameSettings.CollisionGroups.COLLECTIBLE;
        
        this.body.addShape(circleShape);
       // this.body.isDebug = true;
        
      
        Globals.world.addBody(this.body);
        
        
        const visualGraphic = new PIXI.Graphics();
        visualGraphic.beginFill(randomColor)
        visualGraphic.drawCircle(0, 0, this.radius);
        visualGraphic.endFill();
        
        this.addChild(visualGraphic);

        this.x = x;
       this.y = y;
    }

    get globalRadius()
    {
        return this.radius * config.scaleFactor;
    }

    update(dt)
    {
        const position = fetchGlobalPosition(this);
        this.body.position[0] = position.x;
        this.body.position[1] = position.y;

        
    }

    sizeReset()
    {
        this.body.shapes[0].radius =   this.radius * config.scaleFactor;
    }
}