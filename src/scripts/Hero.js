import * as PIXI from 'pixi.js'
import { appConfig, gameConfig } from './appConfig';
import { Globals, PlayerStats } from './Globals';
import TWEEN, { Easing } from "@tweenjs/tween.js";
import * as P2 from "./p2";
import { DebugCircle } from './DebugCircle';
import { fetchGlobalPosition, getDirectionBetween, getMagnitude, getMousePosition, normalize } from './Utilities';

export class Hero extends PIXI.Container
{
    constructor(world)
    {
        super();
        this.scale.set(gameConfig.widthRatio * 0.7);
        
        this.createHeroVisual();
        this.createBody(world);
        this.createSword(world);
        this.isSwinging = false;


        this.checkHit = false;

        
        //console.log(this.body.shapes[0]);
    }

    scaleUP()
    {
        this.scale.set(this.scale.x * 1.2);
        this.body.shapes[0].radius *= 1.2;
        this.sBody.shapes[0].radius *= 1.2;

    }

    createHeroVisual()
    {
        this.visual = new PIXI.Sprite(Globals.resources.hero.texture);
        this.visual.anchor.set(0.5);
        this.addChild(this.visual);
    }

    createBody(world)
    {
        this.body = new P2.Body({
            mass : 1,//type : P2.Body.KINEMATIC,
            position : [appConfig.halfWidth, appConfig.halfHeight],
            fixedRotation : true
        });

        this.circleShape = new P2.Circle({
            radius : this.globalWidth/2,
           sensor : true
        });

        this.body.addShape(this.circleShape);
        
        world.addBody(this.body);

        this.addBodyVisualisation(this.circleShape);

        console.log(this.circleShape);
    }

    addBodyVisualisation(circleShape)
    {
        this.bodyVisual = new PIXI.Graphics();
        this.bodyVisual.beginFill(0x00ff00, 0.3);
        
        this.bodyVisual.drawCircle(0, 0, circleShape.radius);
        this.bodyVisual.endFill();

       
    }

    

    createSword(world)
    {
        this.sword = new PIXI.Sprite(Globals.resources.sword.texture);
        this.sword.scale.set(0.8);
        this.sword.anchor.set(0.5, 1);

        this.sword.x -= this.visual.width * 0.8;
        this.sword.angle = -20;
        
        this.addChild(this.sword);

    

       this.createTriggerCenter();
       
       this.sBody = new P2.Body({
            mass : 1,//type : P2.Body.KINEMATIC,
            position : [0, 0],
            fixedRotation : true
        });

       

        const circleShape = new P2.Circle({
            radius : this.globalWidth * 0.8,
            sensor : true
        });

        this.sBody.addShape(circleShape);
        
        world.addBody(this.sBody);
        

        this.sBodyVisualization(circleShape);

       
    }

    createTriggerCenter()
    {
        this.triggerCenter = new PIXI.Container();
        
        this.triggerCenter.y =  - this.visual.width * 0.6;
        const center = new PIXI.Graphics();
        center.beginFill(0x00ffff);
        
        center.drawCircle(0, 0, 10);
        center.endFill();

        this.triggerCenter.addChild(center);

        this.addChild(this.triggerCenter);
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
        return this.visual.width * this.scale.x;
    }

    get globalHeight()
    {
        return this.visual.height * this.scale.y;
    }

    

    get getMouseDirection()
    {   

        
        
        if(this.isSwinging) return null;

        const position = this.position;
        const mousePosition = getMousePosition();
        
        const direction = getDirectionBetween(position, mousePosition);
        const widthToCompare = this.globalWidth/2;

        
        return (getMagnitude(direction) > widthToCompare) ? normalize(direction) : null;
    }

    CheckEnemyHit()
    {
        if(this.checkHit)
        {
            for (let i = Globals.entities.length-1; i >= 0; i--) {
                const entity = Globals.entities[i];
                
                if(this.sBody.overlaps(entity.body))
                {
                    console.log("OVERLAPED");
                    Globals.world.removeBody(entity.body);
                    
                    entity.destroy();
                    Globals.entities.splice(i, 1);

                    PlayerStats.updateXP(30);
                    this.emit("xpUpdated");
                }
            }
        }
    }
    
    update(dt)
    {

        this.sBody.position = [fetchGlobalPosition(this.triggerCenter).x, fetchGlobalPosition(this.triggerCenter).y];


        this.sBodyVisual.x = this.sBody.position[0];
        this.sBodyVisual.y = this.sBody.position[1];
        this.sBodyVisual.rotation = this.sBody.angle;
        this.sBodyVisual.clear();
        this.sBodyVisual.beginFill(0x00ffff, 0.3);
        
        this.sBodyVisual.drawCircle(0, 0, this.sBody.shapes[0].radius);
        this.sBodyVisual.endFill();

        this.CheckEnemyHit();

        this.updateMovement(dt);
    }

    updateMovement(dt)
    {
        this.x = this.body.position[0];
        this.y = this.body.position[1];

        this.rotation = this.body.angle;
        
        this.bodyVisual.x = this.body.position[0];
        this.bodyVisual.y = this.body.position[1];
        
        this.bodyVisual.clear();
        this.bodyVisual.beginFill(0x00ff00, 0.3);
        
        this.bodyVisual.drawCircle(0, 0, this.body.shapes[0].radius);
        this.bodyVisual.endFill();
    }

    
}