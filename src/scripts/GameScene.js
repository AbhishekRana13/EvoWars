

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

        Globals.world = new P2.World({
            gravity : [0, 0],
            broadphase : new P2.SAPBroadphase()
        });

        this.container = new PIXI.Container();
        this.currentSpeed = gameSettings.speed;
        


        
        this.createWorld(3);
        this.heroContainer();

        this.createEntities(10);

        this.initiateMobileInputs();

        this.mobileDir = new PIXI.Point(0, 0);
        
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
        

       

        
        this.updateWithAnalog();
        

        this.entities.forEach(entity => {
            entity.update(dt);
        });
    }

    updateWithMouse()
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

        
            // if(this.backgroundContainer.x < this.backgroundContainer.iBounds.sLeft)
            // {
            //     this.backgroundContainer.x = this.backgroundContainer.iBounds.sLeft ;
            // } else if ( this.backgroundContainer.x > this.backgroundContainer.iBounds.sRight)
            // {
            //     this.backgroundContainer.x = this.backgroundContainer.iBounds.sRight;
            // }
        }
    }

    updateWithAnalog(dt)
    {

        if(getMagnitude(this.mobileDir) != 0)
        {
            console.log(this.mobileDir);
            this.heroContainer.angle = getAngleBetween({x: 0, y : -1}, this.mobileDir);


            this.backgroundContainer.x -= this.mobileDir.x *this.currentSpeed*dt;
            this.backgroundContainer.y -= this.mobileDir.y *this.currentSpeed* dt;
        }


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
        } else if(msgType == "leftMouseUp")
        {
            this.hasMobileInputPressed = false;
            this.analogInnerCircle.reset();
        }
        
        
    }

   

    initiateMobileInputs()
    {
        this.mobileContainer = new PIXI.Container();
        this.mobileContainer.position = new PIXI.Point(appConfig.halfWidth, appConfig.height);

        const analogOuterCircle = new PIXI.Graphics();
        analogOuterCircle.beginFill(0xcccccc);
        analogOuterCircle.drawCircle(0, 0, appConfig.width * 0.06);
        analogOuterCircle.endFill();

        this.analogInnerCircle = new PIXI.Graphics();
        this.analogInnerCircle.beginFill(0x5c5c5c);
        this.analogInnerCircle.drawCircle(0, 0, appConfig.width * 0.01);
        this.analogInnerCircle.endFill();

        analogOuterCircle.interactive = true;

        this.analogInnerCircle.reset = () => {
            this.analogInnerCircle.x = 0;
            this.analogInnerCircle.y = 0;
        };
        
        analogOuterCircle.on("pointerdown", (e) => {
            this.startPoint = e.data.global;
            this.hasMobileInputPressed = true;
        }, this);

        analogOuterCircle.on("pointermove", (e) => {
            if(this.hasMobileInputPressed)
            {
                const point = new PIXI.Point(e.data.global.x - this.mobileContainer.x, e.data.global.y - this.mobileContainer.y);
                const direction = getDirectionBetween(analogOuterCircle.position, point);
                this.mobileDir = normalize(direction);
                if(getMagnitude(direction) < appConfig.width * 0.05)
                {
                    this.analogInnerCircle.x = point.x;
                    this.analogInnerCircle.y = point.y;
                } else
                {
                    
                    this.analogInnerCircle.x = this.mobileDir.x * appConfig.width * 0.05;
                    this.analogInnerCircle.y = this.mobileDir.y * appConfig.width * 0.05;
                }
              
            }
        }, this);

        analogOuterCircle.on("pointerup", (e) => {
            this.hasMobileInputPressed = false;
            this.analogInnerCircle.reset();
        }, this);



        this.mobileContainer.addChild(analogOuterCircle);
        this.mobileContainer.addChild(this.analogInnerCircle);

        this.mobileContainer.y -= analogOuterCircle.height;
        this.container.addChild(this.mobileContainer);
    }
}