

import * as PIXI from 'pixi.js';
import { appConfig } from './appConfig';
import { Background } from './Background';
import { Entity } from './Entity';
import { gameSettings, Globals } from './Globals';
import { Hero } from './Hero';
import { getAngleBetween, getAngleInRadian, getDirectionBetween, getMagnitude, getMousePosition, getPointOnCircle, normalize } from './Utilities';
import * as P2 from './p2';
import { iBounds } from './iBounds';
import { DebugCircle } from './DebugCircle';
import { DebugText } from './DebugText';

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

        console.log(Globals.isMobile);
        if(Globals.isMobile)
        {
            this.initiateMobileInputs();
            this.mobileDir = new PIXI.Point(0, 0);
        }

        
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
        

       

        if(Globals.isMobile)
            this.updateWithAnalog(dt);
        else
            this.updateWithMouse(dt);
        

        this.entities.forEach(entity => {
            entity.update(dt);
        });
    }

    updateWithMouse(dt)
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
            

            this.heroContainer.angle = getAngleBetween({x: 0, y : -1}, this.mobileDir);


            this.backgroundContainer.x -= this.mobileDir.x *this.currentSpeed*dt;
            this.backgroundContainer.y -= this.mobileDir.y *this.currentSpeed*dt;
           
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
            if(!Globals.isMobile)
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

       
        const radius = appConfig.height * 0.07;
        const analogPoint = new PIXI.Point(-appConfig.halfWidth + radius * 2, 0);
        const analogOuterCircle = new PIXI.Graphics();
        analogOuterCircle.beginFill(0xcccccc);
        analogOuterCircle.drawCircle(0 , 0, radius);
        analogOuterCircle.endFill();
        analogOuterCircle.x = analogPoint.x;

        this.analogInnerCircle = new PIXI.Graphics();
        this.analogInnerCircle.beginFill(0x5c5c5c);
        this.analogInnerCircle.drawCircle(0, 0, appConfig.height * 0.01);
        this.analogInnerCircle.endFill();
        this.analogInnerCircle.x = analogPoint.x;
        this.mobileContainer.addChild(analogOuterCircle);
        this.mobileContainer.addChild(this.analogInnerCircle);

        analogOuterCircle.interactive = true;
        
        this.analogInnerCircle.reset = () => {
           //console.log(analogOuterCircle.x);
            this.analogInnerCircle.x = analogOuterCircle.x;
            this.analogInnerCircle.y = analogOuterCircle.y;
            this.mobileDir = new PIXI.Point(0, 0);
        };

        console.log(this.mobileContainer);
        
        analogOuterCircle.on("pointerdown", (e) => {
            this.startPoint = e.data.global;
            this.hasMobileInputPressed = true;
        }, this);

        analogOuterCircle.on("pointermove", (e) => {
            if(this.hasMobileInputPressed)
            {
                const point = new PIXI.Point(e.data.global.x - this.mobileContainer.x, e.data.global.y - this.mobileContainer.y);
                
                const direction = getDirectionBetween(analogPoint, point);
                this.mobileDir = normalize(direction);
                if(getMagnitude(direction) < radius)
                {
                    this.analogInnerCircle.x = point.x;
                    this.analogInnerCircle.y = point.y;
                } else
                {
                    
                    this.analogInnerCircle.x = analogPoint.x + this.mobileDir.x * radius;
                    this.analogInnerCircle.y = analogPoint.y + this.mobileDir.y * radius;
                }
              
            }
        }, this);

        analogOuterCircle.on("pointerup", (e) => {
            this.hasMobileInputPressed = false;
            this.analogInnerCircle.reset();
            
        }, this);




        //Boost Button
        const boostBtn = new PIXI.Graphics();
        boostBtn.beginFill(0xFF7F50);
        boostBtn.drawCircle(0 , 0, radius * 0.6);
        boostBtn.endFill();
        boostBtn.x = -analogPoint.x + radius;
        boostBtn.y -= radius;

        boostBtn.interactive = true;
        const text = new DebugText("---", 0, 0, "#000", 48);
        this.mobileContainer.addChild(text);
        boostBtn.on("touchstart",(e) => {
            this.currentSpeed = gameSettings.boostedSpeed;
            console.log(e)
            text.text = e.data.identifier;
        }, this);

        boostBtn.on("touchend",(e) => {
            this.currentSpeed = gameSettings.speed;
            text.text = "---";
        }, this);

        this.mobileContainer.addChild(boostBtn);


        //Fire Button
        const swingBtn = new PIXI.Graphics();
        swingBtn.beginFill(0x3CB371);
        swingBtn.drawCircle(0 , 0, radius * 0.6);
        swingBtn.endFill();
        swingBtn.x = -analogPoint.x;
        swingBtn.y += radius * 0.5;
        swingBtn.interactive = true;

        swingBtn.on("touchstart",(e) => {
            console.log(e);
            this.heroContainer.swingSword();
        }, this);

        this.mobileContainer.addChild(swingBtn);

        this.mobileContainer.y -= analogOuterCircle.height;
        this.container.addChild(this.mobileContainer);

        
    }
}