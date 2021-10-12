

import * as PIXI from 'pixi.js';
import { appConfig } from './appConfig';
import { Background } from './Background';
import { Entity } from './Entity';
import { gameSettings, Globals } from './Globals';
import { Hero } from './Hero';
import { getAngleBetween, getAngleInRadian, getDirectionBetween, getMagnitude, getMousePosition, getPointOnCircle, normalize } from './Utilities';
import * as P2 from './p2';
import { iBounds } from './iBounds';

export class GameScene
{
    constructor()
    {
        this.container = new PIXI.Container();
        this.currentSpeed = gameSettings.speed;
        


        
        this.createWorld(3);
        this.heroContainer();

        this.createEntities(10);

        
    }

   
    createWorld(sizeMultiplier)
    {
        this.backgroundContainer = new PIXI.Container();
        
        const background = new Background(Globals.resources.background.texture, sizeMultiplier);
        background.anchor.set(0.5);

        this.backgroundContainer.x = appConfig.halfWidth;
        this.backgroundContainer.y = appConfig.halfHeight;

        this.backgroundContainer.addChild(background);
        
        this.backgroundContainer.iBounds = new iBounds(this.backgroundContainer);

        
        this.container.addChild(this.backgroundContainer);


    }


    heroContainer()
    {
        this.heroContainer = new Hero();
        
        this.container.addChild(this.heroContainer);
    }

    createEntities(noOfEntities)
    {
        this.entities = [];

        for (let i = 0; i < noOfEntities; i++) {
            const entity = new Entity(this.backgroundContainer);

            this.entities.push(entity);
        }
    }


    update(dt)
    {
        const heroPosition = this.heroContainer.position;
        const mousePosition = getMousePosition();
        

        const direction = getDirectionBetween(heroPosition, mousePosition);
        const widthToCompare = this.heroContainer.visual.width * this.heroContainer.scale.x;
        
        if(getMagnitude(direction) > widthToCompare/2)
        {
            const normalizeDir = normalize(direction);

            this.heroContainer.angle = getAngleBetween({x: 0, y : -1}, normalizeDir);


            this.backgroundContainer.x -= normalizeDir.x *this.currentSpeed*dt;
            this.backgroundContainer.y -= normalizeDir.y *this.currentSpeed* dt;

        
            if(this.backgroundContainer.x < this.backgroundContainer.iBounds.sLeft)
            {
                this.backgroundContainer.x = this.backgroundContainer.iBounds.sLeft;
            } else if ( this.backgroundContainer.x > this.backgroundContainer.iBounds.sRight)
            {
                this.backgroundContainer.x = this.backgroundContainer.iBounds.sRight;
            }
        }

        

        this.entities.forEach(entity => {
            entity.update(dt);
        });
    }

    recievedMessage(msgType, msgParams)
    {
        //Input Message

        if(msgType == "rightMouseDown")
        {
            this.currentSpeed = gameSettings.boostedSpeed;
        } else if (msgType == "rightMouseUp")
        {
            this.currentSpeed = gameSettings.speed;
        } else if (msgType == "leftMouseDown")
        {
            this.heroContainer.swingSword();
        }
        
        
    }
}