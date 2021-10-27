

import * as PIXI from 'pixi.js';
import {config } from './appConfig';
import { Background } from './Background';
import { Entity } from './Entity';
import { disposeData, gameSettings, Globals, PlayerStats } from './Globals';
import { Hero } from './Hero';
import { clamp, fetchGlobalPosition, getAngleBetween, getAngleInRadian, getDirectionBetween, getMagnitude, getMousePosition, getPointOnCircle, normalize } from './Utilities';
import * as P2 from './p2';
import { DebugCircle } from './DebugCircle';
import { DebugText } from './DebugText';
import { XPBar } from './XPBar';
import { CollectibleManager } from './CollectibleManager';
import { Label } from './LabelScore';
import { PromptMessage } from './PromptMessage';

export class GameScene
{
    constructor()
    {
        this.sceneContainer = new PIXI.Container();

        this.container = new PIXI.Container();
        this.container.sortableChildren = true;
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
                this.createEntities(5);
            if(this.collectibleManager.collectibles.length < 50)
                this.createCollectibles(5);
        },
        10000
        );

       


        this.worldBounds = {};
        
        this.worldBounds.left = config.logicalWidth/2 - this.backgroundContainer.width/2 + this.heroContainer.globalWidth;
        this.worldBounds.right = config.logicalWidth/2 + this.backgroundContainer.width/2 - this.heroContainer.globalWidth;


        this.worldBounds.top = config.logicalHeight/2 - this.backgroundContainer.height/2 + this.heroContainer.globalHeight;
        this.worldBounds.bottom = config.logicalHeight/2 + this.backgroundContainer.height/2 - this.heroContainer.globalHeight;


        this.createHeroXPBar();
        

        
        this.counterText = new Label(config.logicalWidth, 0, 0, "Enemies Counter : 0", 34, 0x000000);
        this.counterText.anchor.set(1, 0);
        this.counterText.x -= config.logicalWidth * 0.05;
        this.uiContainer.addChild(this.counterText);

        this.collectibleCounter = new Label(config.logicalWidth, 0, 0, "Collectibles : 0", 34, 0x000000);
        this.collectibleCounter.anchor.set(1, 0);
        this.collectibleCounter.x -= config.logicalWidth * 0.05;
        this.collectibleCounter.y += config.logicalWidth * 0.05;

        this.uiContainer.addChild(this.collectibleCounter);
        
        console.log(Globals.isMobile);
        if(Globals.isMobile)
        {
            this.initiateMobileInputs();
            this.mobileDir = new PIXI.Point(0, 0);
        }

        
    }

    resize()
    {
        

        //FullBG
        this.fullBG.clear();
        this.fullBG.beginFill(0x808080);
        this.fullBG.drawRect(0, 0, window.innerWidth, window.innerHeight);
        this.fullBG.endFill();


        this.heroContainer?.sizeReset();
        
     

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
        this.checkGroupCollision();
        
        this.container.addChild(this.backgroundContainer);


    }

    checkGroupCollision()
    {
        Globals.world.on("beginContact", (evt) => {
    
            if((evt.shapeA.group == gameSettings.CollisionGroups.HERO && evt.shapeB.group == gameSettings.CollisionGroups.COLLECTIBLE) ||
                (evt.shapeB.group == gameSettings.CollisionGroups.HERO && evt.shapeA.group == gameSettings.CollisionGroups.COLLECTIBLE))
            {
                this.collectCollectible(evt.bodyA, evt.bodyB);
            } else  if((evt.shapeA.group == gameSettings.CollisionGroups.ENTITY && evt.shapeB.group == gameSettings.CollisionGroups.COLLECTIBLE) ||
            (evt.shapeB.group == gameSettings.CollisionGroups.ENTITY && evt.shapeA.group == gameSettings.CollisionGroups.COLLECTIBLE))
            {
                this.collectCollectible(evt.bodyA, evt.bodyB);
            } else if((evt.shapeA.group == gameSettings.CollisionGroups.ENTITY && evt.shapeB.group == gameSettings.CollisionGroups.SIGHT)||
                        (evt.shapeB.group == gameSettings.CollisionGroups.ENTITY && evt.shapeA.group == gameSettings.CollisionGroups.SIGHT))
            {
                
                const body1 = evt.bodyA;
                const body2 = evt.bodyB; 
                
                if(body1.parentEntity == body2.parentEntity) return;
                const sightBody = (body1.shapes[0].group == gameSettings.CollisionGroups.SIGHT) ? body1 : body2;
                const entityBody = (body1.shapes[0].group == gameSettings.CollisionGroups.SIGHT) ? body2 : body1;

                sightBody.parentEntity.checkNearbyTarget(entityBody);
                
            }


            
        }, this);
    }

    collectCollectible(body1, body2)
    {

        const collectibleBody = (body1.shapes[0].group == gameSettings.CollisionGroups.COLLECTIBLE) ? body1 : body2;
        const entityBody = (body1.shapes[0].group == gameSettings.CollisionGroups.COLLECTIBLE) ? body2 : body1;
    
        const filtered = this.collectibleManager.collectibles.filter(item => item.body == collectibleBody)

        for (let i = filtered.length - 1; i >= 0; i--) {
            const element = filtered[i];
            
            
            this.collectibleManager.collectibles.splice(this.collectibleManager.collectibles.indexOf(element), 1);
            if(element.body.isDebug == true)
            {
                disposeData.debugGraphic.push(element.body.graphic);
            
            }

            Globals.world.removeBody(element.body);
            element.destroy();
            
            if(entityBody.shapes[0].group == gameSettings.CollisionGroups.HERO)
            {
                PlayerStats.updateXP(element.xpPoint);
                Globals.xpBar.updateProgress(PlayerStats.xp/PlayerStats.xpMax);
            } else
            {
          
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

       this.heroContainer.on("destroyed", () => {
           console.log("DESTROYED")
            this.heroContainer = null;
       }, this);
        
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

        if(Globals.isMobile)
        {
            Globals.xpBar.y = Globals.xpBar.height;
        } else
        {
            Globals.xpBar.y = config.logicalHeight - Globals.xpBar.height/2;
        }
        this.uiContainer.addChild(Globals.xpBar);
    }

    createEntities(noOfEntities)
    {
        if(Globals.entities == undefined)
            Globals.entities = [];

        for (let i = 0; i < noOfEntities; i++) {
            const entity = new Entity(this.backgroundContainer, Globals.world);
           // this.sceneContainer.addChild(entity.bodyVisual);
            this.container.addChild(entity);
            Globals.entities.push(entity);


            
        }
    }

    createCollectibles(noOfCollectibles)
    {
        if(this.collectibleManager != undefined && this.collectibleManager != null)
        {
            this.collectibleManager.addMore(this.backgroundContainer, noOfCollectibles);

        } else
            this.collectibleManager = new CollectibleManager(this.backgroundContainer, noOfCollectibles);

        
    }


    update(dt)
    {
       // return;
        Globals.world.step(dt);

        // this.graphicBox.x = this.boxBody.position[0];
        // this.graphicBox.y = this.boxBody.position[1];
        // this.graphicBox.rotation = this.boxBody.angle;
        
        if(this.heroContainer != undefined && this.heroContainer != null)
        {
            global.heroCast = () => console.log(this.heroContainer);

            if(Globals.isMobile)
                this.updateWithAnalog(dt);
            else
                this.updateWithMouse(dt);

            this.backgroundContainer.x = clamp(this.backgroundContainer.x, this.worldBounds.left, this.worldBounds.right);
            this.backgroundContainer.y = clamp(this.backgroundContainer.y, this.worldBounds.top, this.worldBounds.bottom);
            
            this.heroContainer.update(dt);
        }
        

        Globals.entities.forEach(entity => {
            entity?.update(dt);
            entity?.checkDistanceFromHero(this.heroContainer);
        });

       this.collectibleManager.update(this.heroContainer, dt);



       this.counterText.text = "Enemies Counter : "+ ((Globals.entities == undefined) ? 0 : Globals.entities.length);
    
       this.collectibleCounter.text = "Collectibles : "+ ((this.collectibleManager == undefined) ? 0 : this.collectibleManager.collectibles.length);

       this.debug();

       for (let i = disposeData.containers.length - 1; i >= 0; i--) {
            const element = disposeData.containers[i];
            disposeData.containers.splice(i, 1);

            element.destroy();
            
            if(element.isHero)
                this.heroContainer = null;

            const message = new PromptMessage("You Died! Noob!");
            this.container.addChild(message);
        }

    }

    debug()
    {
        Globals.world.bodies.forEach(body => {

            if(body.isDebug != true) return;

            if(body.graphic == undefined)
            {
                body.graphic = new PIXI.Graphics();
                this.sceneContainer.addChild(body.graphic);
                //console.log("Graphic Created ", body.id);

                //console.log(body.shapes[0].type == 8);
            }

            body.graphic.clear();
            body.graphic.beginFill((body.debugColor != undefined) ? body.debugColor : 0xff0ff0, 0.7);

            body.shapes.forEach(shape => {
                if(shape.type == 8)
                {
                    body.graphic.drawRect(shape.width/2 + shape.position[0],  shape.height/2 + shape.position[1], -shape.width, -shape.height);
                    body.graphic.x = body.position[0];
                    body.graphic.y = body.position[1];
    
                } else
                {
                    body.graphic.drawCircle(shape.position[0], shape.position[1], shape.radius);
                    body.graphic.x = body.position[0];
                    body.graphic.y = body.position[1];
                }
                   
            });
           

            
            body.graphic.endFill();
            //body.graphic.angle = 15;
            body.graphic.rotation = body.angle;
        });

        for (let i = disposeData.debugGraphic.length - 1; i >= 0; i--) {
            const element = disposeData.debugGraphic[i];
            disposeData.debugGraphic.splice(i, 1);

            element.destroy();
        }

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
                this.heroContainer?.swingSword();
        } else if(msgType == "leftMouseUp")
        {
            
            
            
            
        } else if(msgType == "touchEnd")
        {
            if(PIXI.utils.isMobile.any)
            {
                this.hasMobileInputPressed = false;

                if(msgParams.identifier == this.analogPointerID)
                    this.analogInnerCircle.reset();
            }
        }
        
        
    }

   

    initiateMobileInputs()
    {
        this.mobileContainer = new PIXI.Container();
        this.mobileContainer.position = new PIXI.Point(config.logicalWidth/2, config.logicalHeight);

       
        const radius = 150;
        const analogPoint = new PIXI.Point(-radius*4, 0);
        const analogOuterCircle = new PIXI.Graphics();
        analogOuterCircle.beginFill(0xcccccc);
        analogOuterCircle.drawCircle(0 , 0, radius);
        analogOuterCircle.endFill();
        analogOuterCircle.x = analogPoint.x;

        this.analogInnerCircle = new PIXI.Graphics();
        this.analogInnerCircle.beginFill(0x5c5c5c);
        this.analogInnerCircle.drawCircle(0, 0, radius * 0.25);
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
            this.startPoint = fetchGlobalPosition(analogOuterCircle);
            this.hasMobileInputPressed = true;
        }, this);

        analogOuterCircle.on("touchmove", (e) => {
            if(this.hasMobileInputPressed && this.analogPointerID == e.data.identifier)
            {
                const point = new PIXI.Point(e.data.global.x, e.data.global.y);
                
                const direction = getDirectionBetween(this.startPoint, point);
                this.mobileDir = normalize(direction);
                console.log(this.mobileDir);
                const mag = getMagnitude(direction);
                if(mag < radius)
                {
                    this.analogInnerCircle.x = analogPoint.x + (this.mobileDir.x * radius) * mag/radius;
                    this.analogInnerCircle.y = analogPoint.y + (this.mobileDir.y * radius) * mag/radius;
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
        boostBtn.lineStyle(5, 0x000000);
        boostBtn.drawCircle(0 , 0, radius * 0.6);
        boostBtn.endFill();
        boostBtn.x = -analogPoint.x + radius;
        boostBtn.y -= radius;

        boostBtn.interactive = true;


        const boostBtnText = new Label(boostBtn.x, boostBtn.y, 0.5, "Boost", 44, 0x3c3c3c);
        boostBtnText.style.fontWeight = "bold";
        
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
        this.mobileContainer.addChild(boostBtnText);
        console.log(boostBtnText)

        //Fire Button
        const swingBtn = new PIXI.Graphics();
        swingBtn.beginFill(0x3CB371);
        swingBtn.lineStyle(5, 0x000000);
        swingBtn.drawCircle(0 , 0, radius * 0.6);
        swingBtn.endFill();
        swingBtn.x = -analogPoint.x;
        swingBtn.y += radius * 0.5;
        swingBtn.interactive = true;

        const swingBtnText = new Label(swingBtn.x, swingBtn.y, 0.5, "Swing", 44, 0x3c3c3c);
        swingBtnText.style.fontWeight = "bold";
       
        swingBtn.on("touchstart",(e) => {
            console.log(e);
            this.heroContainer.swingSword();
        }, this);



        this.mobileContainer.addChild(swingBtn);
        this.mobileContainer.addChild(swingBtnText);
        this.mobileContainer.y -= analogOuterCircle.height;
        this.uiContainer.addChild(this.mobileContainer);

        
    }
}