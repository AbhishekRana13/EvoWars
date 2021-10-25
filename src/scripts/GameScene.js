

import * as PIXI from 'pixi.js';
import {config } from './appConfig';
import { Background } from './Background';
import { Entity } from './Entity';
import { gameSettings, Globals, PlayerStats } from './Globals';
import { Hero } from './Hero';
import { clamp, getAngleBetween, getAngleInRadian, getDirectionBetween, getMagnitude, getMousePosition, getPointOnCircle, normalize } from './Utilities';
import * as P2 from './p2';
import { DebugCircle } from './DebugCircle';
import { DebugText } from './DebugText';
import { XPBar } from './XPBar';
import { CollectibleManager } from './CollectibleManager';
import { Label } from './LabelScore';

export class GameScene
{
    constructor()
    {
        this.sceneContainer = new PIXI.Container();

        this.container = new PIXI.Container();
        this.uiContainer = new PIXI.Container();

        this.currentSpeed = gameSettings.speed;

        this.container.scale.set(config.scaleFactor);
        this.container.x = config.leftX;
        this.container.y = config.topY;

        
        this.uiContainer.scale.set(config.minScaleFactor);
        this.uiContainer.x = config.minLeftX;
        this.uiContainer.y = config.minTopY;
       

        this.fullBG = new PIXI.Graphics();
        this.fullBG.beginFill(0x808080);
        this.fullBG.drawRect(0, 0, window.innerWidth, window.innerHeight);
        this.fullBG.endFill();

        
        //fullBG.
        this.sceneContainer.addChild(this.fullBG);
        this.sceneContainer.addChild(this.container);
        this.sceneContainer.addChild(this.uiContainer);
       

        this.createWorld(3);

        
        this.createHeroContainer();
        


        const debugBG = new PIXI.Graphics();
        debugBG.beginFill(0x808080, 0.4);
        debugBG.drawRect(0, 0, config.logicalWidth, config.logicalHeight);
        debugBG.endFill();
        
        //this.container.addChild(debugBG);

        const debugBG2 = new PIXI.Graphics();
        debugBG2.beginFill(0x3c8c3c, 0.4);
        debugBG2.drawRect(0, 0, config.logicalWidth, config.logicalHeight);
        debugBG2.endFill();
        
       // this.uiContainer.addChild(debugBG2);
        
        this.createEntities(10);
        this.createCollectibles(50);


        setInterval(() => {
            if(Globals.entities.length < 30)
                this.createEntities(10);
        },
        10000
        );

        console.log(Globals.isMobile);
        if(Globals.isMobile)
        {
            this.initiateMobileInputs();
            this.mobileDir = new PIXI.Point(0, 0);
        }


        this.worldBounds = {};
        
        this.worldBounds.left = config.logicalWidth/2 - this.backgroundContainer.width/2 + this.heroContainer.globalWidth;
        this.worldBounds.right = config.logicalWidth/2 + this.backgroundContainer.width/2 - this.heroContainer.globalWidth;


        this.worldBounds.top = config.logicalHeight/2 - this.backgroundContainer.height/2 + this.heroContainer.globalHeight;
        this.worldBounds.bottom = config.logicalHeight/2 + this.backgroundContainer.height/2 - this.heroContainer.globalHeight;


        this.createHeroXPBar();
        

        //
        this.counterText = new Label(config.logicalWidth, 0, 0, "Enemies Counter : 0", 34, 0x000000);
        this.counterText.anchor.set(1, 0);
        this.counterText.x -= config.logicalWidth * 0.05;
        this.uiContainer.addChild(this.counterText);


       
    }

    resize()
    {
        

        //FullBG
        this.fullBG.clear();
        this.fullBG.beginFill(0x808080);
        this.fullBG.drawRect(0, 0, window.innerWidth, window.innerHeight);
        this.fullBG.endFill();


        this.heroContainer.sizeReset();
        
     

     // 


        this.container.scale.set(config.scaleFactor);
        this.container.x = config.leftX;
        this.container.y = config.topY;



        Globals.entities.forEach(entity => {
            entity.sizeReset();
        });

        this.collectibleManager.resize();
        
        this.uiContainer.scale.set(config.minScaleFactor);
        this.uiContainer.x = config.minLeftX;
        this.uiContainer.y = config.minTopY;



    }



   
    createWorld(sizeMultiplier)
    {

        Globals.world = new P2.World({
            gravity : [0, 0]
        });

       

        this.backgroundContainer = new PIXI.Container();
        
        const background = new Background(Globals.resources.background.texture,config.logicalWidth, config.logicalHeight, sizeMultiplier);
        background.anchor.set(0.5);

        this.backgroundContainer.x = config.logicalWidth/2;
        this.backgroundContainer.y = config.logicalHeight/2;

        this.backgroundContainer.addChild(background);
        
       // this.createCheckCollision()
      //  this.checkGroupCollision();
        
        this.container.addChild(this.backgroundContainer);


    }

    checkGroupCollision()
    {
        Globals.world.on("beginContact", (evt) => {
            
            if((evt.shapeA.group & evt.shapeB.groupMask) != 0 && (evt.shapeB.group & evt.shapeA.groupMask) != 0)
            {
                console.log("COLLIDED", evt.shapeA.collisionGroup, evt.shapeB.collisionGroup);
               // return;
                const collectibleBody = (evt.shapeA.collisionGroup == gameSettings.CollisionGroups.COLLECTIBLE) ? evt.bodyA : evt.bodyB;
                
                if(collectibleBody != null && collectibleBody != undefined)
                {
                    const entityBody = (evt.shapeA.collisionGroup != gameSettings.CollisionGroups.COLLECTIBLE) ? evt.bodyA : evt.bodyB;
                    this.collectCollectible(collectibleBody, entityBody);
                }
                    

            }

        }, this);
    }

    collectCollectible(collectibleBody, entityBody)
    {
        const filtered = this.collectibleManager.collectibles.filter(item => item.body == collectibleBody)

        for (let i = filtered.length - 1; i >= 0; i--) {
            const element = filtered[i];
            
           
            
            this.collectibleManager.collectibles.splice(this.collectibleManager.collectibles.indexOf(element), 1);
            Globals.world.removeBody(element.body);
            element.destroy();
            
            if(entityBody.shapes[0].group == gameSettings.CollisionGroups.HERO)
            {
                PlayerStats.updateXP(element.xpPoint);
                Globals.xpBar.updateProgress(PlayerStats.xp/PlayerStats.xpMax);
            } else
            {
                console.log(entityBody);
                entityBody.parentEntity.updateXP(element.xpPoint);
            }
                
        }
    }


    createHeroContainer()
    {
        this.heroContainer = new Hero(Globals.world);
        
        this.container.addChild(this.heroContainer);

        //this.sceneContainer.addChild(this.heroContainer.bodyVisual);
       // this.sceneContainer.addChild(this.heroContainer.sBodyVisual);

        this.heroContainer.on("xpUpdated", () => {
            Globals.xpBar.updateProgress(PlayerStats.xp/PlayerStats.xpMax);
        }, this);
        
        PlayerStats.onLevelUpdate = () => {
            this.heroContainer.scaleUP();
            
        };
    }

    createHeroXPBar()
    {
        Globals.xpBar = new XPBar();
        Globals.xpBar.x = config.logicalWidth/2;
        Globals.xpBar.y = config.logicalHeight - Globals.xpBar.height/2;
        this.uiContainer.addChild(Globals.xpBar);
    }

    createEntities(noOfEntities)
    {
        if(Globals.entities == undefined)
            Globals.entities = [];

        for (let i = 0; i < noOfEntities; i++) {
            const entity = new Entity(this.backgroundContainer, Globals.world);
           // this.sceneContainer.addChild(entity.bodyVisual);
            Globals.entities.push(entity);


            
        }
    }

    createCollectibles(noOfCollectibles)
    {
        this.collectibleManager = new CollectibleManager(this.backgroundContainer, noOfCollectibles);

        
    }


    update(dt)
    {
       // return;
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

       this.collectibleManager.update(this.heroContainer, dt);



       this.counterText.text = "Enemies Counter : "+ ((Globals.entities == undefined) ? 0 : Globals.entities.length);
    }

    updateWithMouse(dt)
    {
        console.log(this.backgroundContainer.width);
        const dir = this.heroContainer.getMouseDirection;
        
        if(dir != null)
        {
            this.heroContainer.body.angle = getAngleInRadian({x: 0, y : -1}, dir);

            this.backgroundContainer.x -= dir.x *this.currentSpeed*dt;
            this.backgroundContainer.y -= dir.y *this.currentSpeed*dt;
           
            

            
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