

import * as PIXI from 'pixi.js';
import { appConfig } from './appConfig';
import { Background } from './Background';
import { Entity } from './Entity';
import { gameSettings, Globals } from './Globals';
import { Hero } from './Hero';
import { clamp, getAngleBetween, getAngleInRadian, getDirectionBetween, getMagnitude, getMousePosition, getPointOnCircle, normalize } from './Utilities';
import * as P2 from './p2';
import { DebugCircle } from './DebugCircle';
import { DebugText } from './DebugText';
import { XPBar } from './XPBar';

export class GameScene
{
    constructor()
    {


        this.container = new PIXI.Container();
        this.currentSpeed = gameSettings.speed;
        


        
        this.createWorld(3);
        this.createHeroContainer();
        
        this.createEntities(10);

        console.log(Globals.isMobile);
        if(Globals.isMobile)
        {
            this.initiateMobileInputs();
            this.mobileDir = new PIXI.Point(0, 0);
        }

        
        
        this.worldBounds = {};
        
        this.worldBounds.left = appConfig.halfWidth - this.backgroundContainer.width/2 + this.heroContainer.globalWidth;
        this.worldBounds.right = appConfig.halfWidth + this.backgroundContainer.width/2 - this.heroContainer.globalWidth;


        this.worldBounds.top = appConfig.halfHeight - this.backgroundContainer.height/2 + this.heroContainer.globalHeight;
        this.worldBounds.bottom = appConfig.halfHeight + this.backgroundContainer.height/2 - this.heroContainer.globalHeight;
        //this.createTestBlock();

        this.createHeroXPBar();
    }


    createTestBlock()
    {
        const boxShape = new P2.Box({ width: 200, height: 100 });
       // boxShape.sensor = true;
        this.boxBody = new P2.Body({
            //type : P2.Body.STATIC,
                mass : 0,
                position:[appConfig.halfWidth,appConfig.halfHeight + 200],
                angle : 30
            });
        this.boxBody.addShape(boxShape);
        
        this.world.addBody(this.boxBody);

        this.graphicBox = new PIXI.Graphics();
        this.graphicBox.beginFill(0xff0000);
        this.graphicBox.drawRect(-boxShape.width/2, -boxShape.height/2, boxShape.width, boxShape.height);

            // Add the box to our container
        this.container.addChild(this.graphicBox);
    }
   
    createWorld(sizeMultiplier)
    {

        Globals.world = new P2.World({
            gravity : [0, 0]
        });

        Globals.world.on("beginContact", (evt) => {
            if(evt.bodyA == this.heroContainer.body || evt.bodyB == this.heroContainer.body)
            {
                console.log("Hero collided ");
            }
            //console.log(evt.bodyA);
           // console.log(evt.bodyB);
        }, this);

        this.backgroundContainer = new PIXI.Container();
        
        const background = new Background(Globals.resources.background.texture, sizeMultiplier);
        background.anchor.set(0.5);

        this.backgroundContainer.x = appConfig.halfWidth;
        this.backgroundContainer.y = appConfig.halfHeight;

        this.backgroundContainer.addChild(background);
        
        
        
        
        this.container.addChild(this.backgroundContainer);


    }


    createHeroContainer()
    {
        this.heroContainer = new Hero(Globals.world);
        
        this.container.addChild(this.heroContainer);

        this.container.addChild(this.heroContainer.bodyVisual);
        this.container.addChild(this.heroContainer.sBodyVisual);

    }

    createHeroXPBar()
    {
        this.xpBar = new XPBar();
        this.xpBar.x = appConfig.halfWidth;
        this.xpBar.y = appConfig.height * 0.95;
        this.container.addChild(this.xpBar);
    }

    createEntities(noOfEntities)
    {
        Globals.entities = [];

        for (let i = 0; i < noOfEntities; i++) {
            const entity = new Entity(this.backgroundContainer, Globals.world);
            this.container.addChild(entity.bodyVisual);
            Globals.entities.push(entity);


            
        }
    }


    update(dt)
    {
        
        Globals.world.step(dt);

        // this.graphicBox.x = this.boxBody.position[0];
        // this.graphicBox.y = this.boxBody.position[1];
        // this.graphicBox.rotation = this.boxBody.angle;

        if(Globals.isMobile)
            this.updateWithAnalog(dt);
        else
            this.updateWithMouse(dt);

        this.backgroundContainer.x = clamp(this.backgroundContainer.x, this.worldBounds.left, this.worldBounds.right);
        this.backgroundContainer.y = clamp(this.backgroundContainer.y, this.worldBounds.top, this.worldBounds.bottom);
        
        this.heroContainer.update(dt);

        Globals.entities.forEach(entity => {
            entity.update(dt);
        });
    }

    updateWithMouse(dt)
    {
        const dir = this.heroContainer.getMouseDirection;
        
        if(dir != null)
        {
            this.heroContainer.body.angle = getAngleInRadian({x: 0, y : -1}, dir);

            this.backgroundContainer.x -= dir.x *this.currentSpeed*dt;
            this.backgroundContainer.y -= dir.y *this.currentSpeed*dt;
            console.log(this.backgroundContainer.width);
            

            
        }
    }

    updateWithAnalog(dt)
    {

        if(getMagnitude(this.mobileDir) != 0 && !this.heroContainer.isSwinging)
        {
            this.heroContainer.body.angle = getAngleInRadian({x: 0, y : -1}, this.mobileDir);

            this.backgroundContainer.x -= this.mobileDir.x *this.currentSpeed*dt;
            this.backgroundContainer.y -= this.mobileDir.y *this.currentSpeed*dt;
            

            //his.backgroundContainer.x = Math.cl
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
            if(PIXI.utils.isMobile.any)
            {
                this.hasMobileInputPressed = false;
                this.analogInnerCircle.reset();
            }
            
            
            
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
        this.analogPointerID = -1;
        analogOuterCircle.on("touchstart", (e) => {
            
            this.analogPointerID = e.data.identifier;
            this.startPoint = e.data.global;
            this.hasMobileInputPressed = true;
        }, this);

        analogOuterCircle.on("touchmove", (e) => {
            if(this.hasMobileInputPressed && this.analogPointerID == e.data.identifier)
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

        analogOuterCircle.on("touchend", (e) => {
            this.hasMobileInputPressed = false;
            this.analogInnerCircle.reset();
            this.analogPointerID = -1;
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

        this.boostBtnID = -1;
        boostBtn.on("touchstart",(e) => {
                this.boostBtnID = e.data.identifier;
                this.currentSpeed = gameSettings.boostedSpeed;
                console.log(e)
                text.text = e.data.identifier;
        }, this);

        boostBtn.on("touchend",(e) => {
            if(this.boostBtnID  == e.data.identifier)
            {
                this.currentSpeed = gameSettings.speed;
                text.text = "---";
                this.boostBtnID = -1;
            }
            
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