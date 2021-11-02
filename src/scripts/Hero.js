import * as PIXI from 'pixi.js'
import { config } from './appConfig';
import { disposeData, gameSettings, Globals, PlayerStats } from './Globals';
import TWEEN, { Easing } from "@tweenjs/tween.js";
import * as P2 from "./p2";
import { DebugCircle } from './DebugCircle';
import { fetchGlobalPosition, getAngleInRadian, getDirectionBetween, getMagnitude, getMousePosition, normalize } from './Utilities';
import { Label } from './LabelScore';

export class Hero extends PIXI.Container
{
    constructor(world, name)
    {
        super();
//        this.scale.set(gameConfig.widthRatio * 0.7);
        this.scaleValue = 0.4;
        this.scale.set(this.scaleValue);
        
        this.createHeroVisual();
        this.createBody(world);
        this.createSword(world);
        this.isSwinging = false;


        this.checkHit = false;

        this.isHero = true;

        
        this.nameText = new Label(this.visual.x, 0 - this.globalRadius, 0.5, name, 28, 0x3c3c3c);
        this.nameText.anchor.set(0.5, 0);
        //console.log(this.body.shapes[0]);

        this.uuid = PIXI.utils.uid;
    }

    scaleUP(isDepleted = false)
    {

        if(isDepleted)
        {
            this.scaleValue /= 1.2;
        } else
        {
            this.scaleValue *= 1.2;
        }

        this.visual.gotoAndStop(PlayerStats.level <= 10 ? PlayerStats.level - 1 : 9);
        this.sword.gotoAndStop(PlayerStats.level <= 5 ? PlayerStats.level - 1 : 5)

        this.sizeReset(false);
    }

    sizeReset(resetPosition = true)
    {
        if(resetPosition)
        {
            let xPos = (config.logicalWidth/2) * config.scaleFactor;
            let yPos = (config.logicalHeight/2) * config.scaleFactor;
            xPos += config.leftX;
            yPos += config.topY;
    
            this.body.position[0] = xPos;
            this.body.position[1] = yPos;
        }
        

        this.scale.set(this.scaleValue);
        this.body.shapes[0].radius = this.globalWidth/2;
        this.sBody.shapes[0].width = this.sword.width * this.scale.x * config.scaleFactor;
        this.sBody.shapes[0].height = this.sword.height * this.scale.x * config.scaleFactor;

        this.sBody.shapes[0].position[1] = (-this.sword.height/2) * this.scale.y * config.scaleFactor

        

    }

    createHeroVisual()
    {
        const tiles = [];
        for(let i = 1 ; i <= 10; i++)
        {
            tiles.push(Globals.resources["hero"+i].texture);
        }
        this.visual = new PIXI.AnimatedSprite(tiles);

        
        this.visual.anchor.set(0.5);
        this.addChild(this.visual);
    }

    createBody(world)
    {

        let xPos = (config.logicalWidth/2) * config.scaleFactor;
        let yPos = (config.logicalHeight/2) * config.scaleFactor;

        xPos += config.leftX;
        yPos += config.topY;

        this.body = new P2.Body({
            mass : 1,//type : P2.Body.KINEMATIC,
            position : [xPos, yPos],
            fixedRotation : true
        });

        this.body.parentEntity = this;

        const circleShape = new P2.Circle({
            radius : (this.globalWidth/2),
    //       sensor : true
        });

        console.log(circleShape.id, "bodyHuman");

       circleShape.group = gameSettings.CollisionGroups.HERO;

        this.body.addShape(circleShape);
        
        world.addBody(this.body);

        //this.addBodyVisualisation(this.circleShape);

        //console.log(circleShape);

        Globals.heroBody = this.body;
    }

    

    

    createSword()
    {

        const textures = [];

        for(let i = 1; i <= 5; i++)
        {
            textures.push(Globals.resources['sword'+i].texture);
        }

        this.sword = new PIXI.AnimatedSprite(textures);
        this.sword.scale.set(0.8);
        this.sword.anchor.set(0.5, 1);


        this.sword.x -= this.visual.width * 0.8;
        this.sword.angle = -20;
        
        this.addChild(this.sword);

    

       this.sBody = new P2.Body({
            mass : 1,//type : P2.Body.KINEMATIC,
            position : [0, 0],
            fixedRotation : true
        });

    //    this.sBody.isDebug = true;       
        
        const rectShape = new P2.Box({
            width : this.sword.width * this.scale.x * config.scaleFactor,
            height : this.sword.height * this.scale.y * config.scaleFactor,
            sensor : true
        })

        

        rectShape.group = gameSettings.CollisionGroups.SWORD;
        console.log(rectShape.id, "HumanSword");
        this.sBody.addShape(rectShape);
        this.sBody.shapes[0].position[1] = (-this.sword.height/2) * this.scale.y * config.scaleFactor
      //  console.log(this.sBody.shapes[0].position);
        Globals.world.addBody(this.sBody);
        

        Globals.world.disableBodyCollision(this.sBody, this.body);
       

       
    }

 
  


    sBodyVisualization(shape)
    {
        this.sBodyVisual = new PIXI.Graphics();
        this.sBodyVisual.beginFill(0x00ffff, 0.3);
        
        this.sBodyVisual.drawCircle(0, 0, shape.radius);
        this.sBodyVisual.endFill();
    }


    swingSword()
    {
        if(this.isSwinging) return;
        this.isSwinging = true;
        this.checkHit = true;
        new TWEEN.Tween(this.sword)
            .to({angle : 90, x : 0, y : -this.visual.width * 0.8, scale : {x : 0.7, y : 0.9} }, 150)
            .easing(Easing.Back.In)
            .onComplete((object) => {
                this.checkHit = false;
                new TWEEN.Tween(object)
                    .to({angle : -20, x : -this.visual.width * 0.8, y : 0, scale : {x : 0.8, y : 0.8}}, 150)
                    .delay(150)
                    .onComplete(() => {
                        this.isSwinging = false;
                    })
                    .start();
            })
            .start();
    }

    

    get globalWidth()
    {
        return this.visual.width * this.scale.x * config.scaleFactor;
    }

    get globalRadius()
    {
        return this.globalWidth/2;
    }

    get globalHeight()
    {
        return this.visual.height * this.scale.y * config.scaleFactor;
    }

    

    get getMouseDirection()
    {   

        
        
        if(this.isSwinging) return null;

        const position = fetchGlobalPosition(this);
        const mousePosition = getMousePosition();
        
        const direction = getDirectionBetween(position, mousePosition);
        const widthToCompare = this.globalWidth/2;

        
        return (getMagnitude(direction) > widthToCompare) ? normalize(direction) : null;
    }

    get level()
    {
        return PlayerStats.level;
    }

    CheckEnemyHit()
    {
        if(this.checkHit)
        {
            const keys = Object.keys(Globals.entities);

            for (let i = keys.length-1; i >= 0; i--) {    
                const entity = Globals.entities[keys[i]];
                
                if(entity?.body != null && this.sBody?.overlaps(entity.body))
                {
                //    console.log("Hero overlaped with ", entity);
                   
                    entity.removeBodyData();
                    
                    PlayerStats.updateXP(entity.reward);
                    entity.destroyObj();          
                    this.emit("xpUpdated");
                }
            }
        }
    }

    
    
    update(dt)
    {
        const position = fetchGlobalPosition(this.sword);
        this.sBody.position = [position.x, position.y];

       this.sBody.angle =  this.sword.rotation + this.rotation
        if(this.sBodyVisual)
        {
            this.sBodyVisual.x = this.sBody.position[0];
            this.sBodyVisual.y = this.sBody.position[1];
            this.sBodyVisual.rotation = this.sBody.angle;
            this.sBodyVisual.clear();
            this.sBodyVisual.beginFill(0x00ffff, 0.3);
            
            this.sBodyVisual.drawCircle(0, 0, this.sBody.shapes[0].radius);
            this.sBodyVisual.endFill();
        }


        this.CheckEnemyHit();

        this.updateMovement(dt);
    }

    updateMovement(dt)
    {
        this.x = (this.body.position[0]- config.leftX) / config.scaleFactor;
        this.y = (this.body.position[1]- config.topY) / config.scaleFactor;


      


        this.rotation = this.body.angle;

        this.nameText.x = this.x;
        this.nameText.y = this.y + this.globalRadius;
        
        if(this.bodyVisual)
        {
            this.bodyVisual.y = this.body.position[1];
            this.bodyVisual.x = this.body.position[0];
            
            this.bodyVisual.clear();
            this.bodyVisual.beginFill(0x00ff00, 0.3);
            
            this.bodyVisual.drawCircle(0, 0, this.body.shapes[0].radius);
            this.bodyVisual.endFill();
        }


    }

    removeBodyData()
    {
        if(this.body.isDebug)
        {
            disposeData.debugGraphic.push(this.body.graphic);
        }

        if(this.sBody.isDebug)
        {
            disposeData.debugGraphic.push(this.sBody.graphic);
        }

        Globals.world.removeBody(this.body);
        Globals.world.removeBody(this.sBody);
    }

    destroyObj()
    {
        disposeData.containers.push(this);
    }

    get reward()
    {
        return PlayerStats.reward;
    }
}