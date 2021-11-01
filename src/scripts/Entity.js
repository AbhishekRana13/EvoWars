import * as PIXI from 'pixi.js';
import { disposeData, gameSettings, Globals, PlayerStats, States } from './Globals';
import { clamp, fetchGlobalPosition, getAngleBetween, getAngleInRadian, getDirectionBetween, getMagnitude, normalize } from './Utilities';
import TWEEN, { Easing } from "@tweenjs/tween.js";
import * as P2 from "./p2";
import { config } from './appConfig';
import { Label } from './LabelScore';
import { AttackState, CollectState, EscapeState } from './States/aiStates';
export class Entity extends PIXI.Container
{
    constructor(parentContainer, world, name)
    {
        super();
        
        this.backgroundContainer = parentContainer;

        this.scaleValue = 0.4;
        this.scale.set(this.scaleValue);
        
        this.createEntityVisual();

        this.createBody(parentContainer, world);
        this.createSword(world);
        

       // parentContainer.addChild(this);
        this.isTurning = false;
        this.followTarget = null;
        this.isSwinging = false;
        this.readyToSwing = false;
        this.noOfAttempts = 0;


       this.direction = new PIXI.Point(0, 0);
       this.currentDirection = this.direction;

        this.isInBoostedMode = false;


        this.stats = {
            level : 1,
            xp : 0,
            xpMax : 10,
            x : 0.07,
            y : 2,
            reward : 30
        }

        this.xpText = new Label(this.visual.x, this.visual.y, 0.5, this.stats.xp, 56);
        this.xpText.style.fontWeight = "bold";

        this.addChild(this.xpText);

        this.nameText = new Label(this.visual.x, 0 - this.globalRadius, 0.5, name, 28, 0x3c3c3c);
        this.nameText.anchor.set(0.5, 0);
       
        this.uuid = PIXI.utils.uid();
       // this.nameText.text += (" " +this.uuid)
        Globals.entities[this.uuid] = this;

        this.initializeStates();    
    }

    changeDirection(direction, time = 2000)
    {
        this.isTurning = true;
        this.direction = direction;

        new TWEEN.Tween(this.currentDirection).to({x : this.direction.x, y : this.direction.y}, time).onComplete(() => {
            this.isTurning = false;
        }).start();
    }

    initializeStates()
    {
        this.states = {
            COLLECT : new CollectState(this),
            ATTACK : new AttackState(this),
            ESCAPE : new EscapeState(this)
        }

        this.anyTransitions = [];


        this.states.COLLECT.addTransition(this.states.ATTACK, () => {
            return this.followTarget != null  && this.checkRandomValue;
        });

        this.states.COLLECT.addTransition(this.states.ESCAPE, () => {
            return (this.followTarget != null && this.followTarget.level > this.level && this.checkRandomValue);
        });

        this.states.ATTACK.addTransition(this.states.COLLECT, () => {
            return this.followTarget == null;
        });

        this.states.ATTACK.addTransition(this.states.ESCAPE, () => {
            return (this.followTarget != null && (this.noOfAttempts > 3 || this.followTarget.level > this.level)  && this.checkRandomValue);
        });

        this.states.ESCAPE.addTransition(this.states.COLLECT, () => {
            return this.followTarget == null;
        });

       
        this.switchState(this.states.COLLECT);


    }

    get checkRandomValue()
    {
        const randomValue = Math.random();

        return randomValue > 0.5;
    }

    switchState(state)
    {
        if(this.currentState == state || state == null || state == undefined)
            return;
        
        this.currentState?.onExit();
        
        this.currentState = state;

        this.currentState.onEnter();
        
    }

    checkTransitions()
    {
        this.anyTransitions.forEach(element => {
            if(element.Condition())
            {
                this.switchState(element.To);
                return;
            }
        });

        this.currentState.transitions.forEach(element => {
            if(element.Condition())
            {
                this.switchState(element.To);
                return;
            }
        });
    }



    sizeReset()
    {
      //  console.log("RESET");
        //this.scale.set(this.scaleValue);

        this.body.shapes[0].radius = this.globalWidth/2;
        
        this.sBody.shapes[0].width = this.sword.width * this.scale.x * config.scaleFactor;
        this.sBody.shapes[0].height = this.sword.height * this.scale.x * config.scaleFactor;

        this.sBody.shapes[0].position[1] = (-this.sword.height/2) * this.scale.y * config.scaleFactor

        this.sightBody.shapes[0].radius = this.body.shapes[0].radius * 4;
    }

    updateXP(value)
    {
        this.stats.xp += value;
        this.stats.reward += value;
        if(this.stats.xp > this.stats.xpMax)
        {
            const remainingXp = this.stats.xp - this.stats.xpMax;
            this.stats.level++;
            
            this.stats.xpMax = Math.pow((this.stats.level / this.stats.x), this.stats.y);

            this.stats.xp = remainingXp;

            this.upScale();
        }
    }

    depleteXP(value)
    {   
        this.stats.xp -= value;
        this.stats.reward -= value;
        
        if(this.stats.xp < 0 && this.stats.level == 1)
        {
            this.stats.xp = 0;
            this.stats.reward = 20;
           return;
        }

        if(this.stats.xp < 0)
        {
            
            this.stats.level--;
            this.stats.xpMax = Math.pow((this.stats.level / this.stats.x), this.stats.y);
            
            const remainingXp = this.stats.xpMax - this.stats.xp;
            this.stats.xp = remainingXp;
           // console.log("Depleted");

            this.upScale(true);
        }
    }

    upScale(toDeplete = false)
    {

        if(toDeplete)
        {
            this.scaleValue /= 1.2;
        } else
        {
            this.scaleValue *= 1.2;
        }
           

            


        this.scale.set(this.scaleValue);
        this.body.shapes[0].radius = this.globalWidth/2;

        this.sBody.shapes[0].width = this.sword.width * this.scale.x * config.scaleFactor;
        this.sBody.shapes[0].height = this.sword.height * this.scale.x * config.scaleFactor;

        this.sBody.shapes[0].position[1] = (-this.sword.height/2) * this.scale.y * config.scaleFactor

        this.sightBody.shapes[0].radius = this.body.shapes[0].radius * 4;

        this.visual.gotoAndStop(this.stats.level <= 10 ? this.stats.level - 1 : 9);
        this.sword.gotoAndStop(this.stats.level <= 5 ? this.stats.level - 1 : 5);
    }

    createEntityVisual()
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

    createBody(parentContainer, world)
    {
        this.offsetX = (Math.random() * parentContainer.width) - (parentContainer.width/2);
        this.offsetY = (Math.random() * parentContainer.height) - (parentContainer.width/2);

        let xPos = (this.offsetX + this.backgroundContainer.x) * config.scaleFactor;
        xPos += config.leftX;

        let yPos = (this.offsetY + this.backgroundContainer.y) * config.scaleFactor;
        yPos += config.topY;

        this.body = new P2.Body({
            mass : 1,
            position : [xPos, yPos],
            fixedRotation : true
        });

        
        //console.log(parentContainer.width, parentContainer.height)
       // console.log(this.offsetX, this.offsetY);
        const circleShape = new P2.Circle({
            radius : this.globalWidth/2,
           // sensor : true
        });

      
         circleShape.group = gameSettings.CollisionGroups.ENTITY;
        
        this.body.parentEntity = this;
        this.body.addShape(circleShape);
       
        // this.body.isDebug = true;
        world.addBody(this.body);

       // this.addBodyVisualisation(circleShape);

       // console.log(circleShape);

        this.createSightRadius();
    }

    createSightRadius()
    {
        this.sightBody = new P2.Body({
            type : P2.Body.KINEMATIC
        });

        //this.sightBody.isDebug = true;
        this.sightBody.debugColor = 0x00ff00;
        const circleShape = new P2.Circle({
            radius : this.body.shapes[0].radius * 4,
            sensor : true
        });
        circleShape.group = gameSettings.CollisionGroups.SIGHT;
        this.sightBody.addShape(circleShape);
        this.sightBody.parentEntity = this;
        Globals.world.addBody(this.sightBody);
    }

    addBodyVisualisation(circleShape)
    {
        
        this.bodyVisual = new PIXI.Graphics();
        this.bodyVisual.beginFill(0xff0000, 0.3);
        
        this.bodyVisual.drawCircle(0, 0, circleShape.radius);
        this.bodyVisual.endFill();

        //this.addChild(this.bodyVisual);
    }

    createSword(world)
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

        // this.sBody.isDebug = true;
        
        const rectShape = new P2.Box({
            width : this.sword.width * this.scale.x * config.scaleFactor,
            height : this.sword.height * this.scale.y * config.scaleFactor,
            sensor : true
        })

        

        rectShape.group = gameSettings.CollisionGroups.SWORD;

        this.sBody.addShape(rectShape);
        this.sBody.shapes[0].position[1] = (-this.sword.height/2) * this.scale.y * config.scaleFactor
       // console.log(this.sBody.shapes[0].position);
        world.addBody(this.sBody);
        

       // this.sBodyVisualization(circleShape);

       
    }

    get globalWidth()
    {
        return this.visual.width * this.scale.x * config.scaleFactor;
    }

    get globalHeight()
    {
        return this.visual.height * this.scale.y * config.scaleFactor;
    }

    get globalRadius()
    {
        return this.globalWidth/2;
    }

    get globalPosition()
    {
        let point = new PIXI.Point();

        this.getGlobalPosition(point, false);
        
        return point;
    }

    update(dt)
    {

        this.checkTransitions();

        this.currentState?.onUpdate(dt);

        this.xpText.text =""// this.uuid;//Math.round(this.stats.xp)

        let speed = this.isInBoostedMode ? gameSettings.boostedSpeed : gameSettings.speed;

        if(this.isInBoostedMode)
        {
            if((this.stats.level > 1 || this.stats.xp > 0 ))
            {
                this.depleteXP(gameSettings.depleteValue);
            } else
            {
                speed = gameSettings.speed;
            }
        }



        this.syncSword();
        this.syncBodyAndVisual(dt, speed);
        this.updateBodyVisual(dt);


        this.nameText.x = this.x;
        this.nameText.y = this.y + this.globalRadius;

    }

    syncSword()
    {
        const position = fetchGlobalPosition(this.sword);
        this.sBody.position = [position.x, position.y];

         this.sBody.angle =  this.sword.rotation + this.rotation
    }

    syncBodyAndVisual(dt, speed)
    {
        //this.currentDirection = new PIXI.Point(1, 0);
        
        if(this.currentDirection.x == 0 && this.currentDirection.y == 0)
        {
            this.body.angle = 0;
        } else
        {
            this.body.angle = getAngleInRadian({x : 0, y : -1}, this.currentDirection);
        }
        
        this.offsetX += this.currentDirection.x * dt * speed;
        this.offsetY += this.currentDirection.y * dt * speed;
        
        const width = this.visual.width * this.scale.x;
        const height = this.visual.height * this.scale.y;

        this.offsetX = clamp(this.offsetX, -this.backgroundContainer.width/2 + width, this.backgroundContainer.width/2 - width);
        this.offsetY = clamp(this.offsetY, -this.backgroundContainer.height/2 + height, this.backgroundContainer.height/2 - height);

        this.body.position[0] = this.backgroundContainer.x + this.offsetX;
        this.body.position[0] *= config.scaleFactor;
        this.body.position[0] += config.leftX;

        this.body.position[1] = this.backgroundContainer.y + this.offsetY;
        this.body.position[1] *= config.scaleFactor;
        this.body.position[1] += config.topY;
       
        this.sightBody.position = this.body.position;

        this.x = ((this.body.position[0] - config.leftX) / config.scaleFactor) //- this.backgroundContainer.x;
        this.y = ((this.body.position[1] - config.topY) / config.scaleFactor) //- this.backgroundContainer.y;

        this.rotation = this.body.angle;
    }

    updateBodyVisual(dt)
    {
        if(this.bodyVisual == undefined || this.bodyVisual == null) return;
        
        this.bodyVisual.clear();
        this.bodyVisual.beginFill(0xff0000, 0.3);
        this.bodyVisual.drawCircle(0, 0, this.body.shapes[0].radius);
        this.bodyVisual.endFill();
        this.bodyVisual.x = this.body.position[0];
        this.bodyVisual.y = this.body.position[1];
    }

    checkDistanceFromHero(hero)
    {
        if(this.followTarget != null || hero == null) return;

        const ownPos = new PIXI.Point(this.body.position[0], this.body.position[1]);
        const heroPos = new PIXI.Point(hero.body.position[0], hero.body.position[1]);

        const direction = getDirectionBetween(ownPos, heroPos);
        if(getMagnitude(direction) <= ((this.body.shapes[0].radius * 3) +  hero.body.shapes[0].radius)
            && !this.isTurning)

        {
            this.followTarget = hero;


            
        }
    }

    checkNearbyTarget(entityBody)
    {
        if(this.followTarget != null || entityBody == null) return;

        
        this.followTarget = entityBody.parentEntity;
           
    }

    get followTargetDistance()
    {
        return ((this.body.shapes[0].radius * 4) +  this.followTarget.body.shapes[0].radius);
    }

    get swingSwordRange()
    {
        return (this.body.shapes[0].radius + this.followTarget.body.shapes[0].radius);
    }


    
    swingSword()
    {

        if(!this.readyToSwing) return;

        if(this.isSwinging) return;
        this.isSwinging = true;

        this.checkHit = true; 

        this.noOfAttempts++;
        const randomTimer = (Math.random() * 200) + 100;

        new TWEEN.Tween(this.sword)
            .to({angle : 90, x : 0, y : -this.visual.width * 0.8, scale : {x : 0.7, y : 0.9} }, randomTimer)
            .easing(Easing.Back.In)
            .onComplete((object) => {
                this.checkHit = false;
                new TWEEN.Tween(object)
                    .to({angle : -20, x : -this.visual.width * 0.8, y : 0, scale : {x : 0.8, y : 0.8}}, randomTimer)
                    .delay(randomTimer)
                    .onComplete(() => {
                        this.isSwinging = false;
                    })
                    .start();
            })
            .start();
    }

    CheckEnemyHit()
    {
        if(this.checkHit && this.followTarget != null)
        {  
                if(this.sBody.overlaps(this.followTarget.body))
                {
                   
                   this.followTarget.removeBodyData();

                   this.updateXP(this.followTarget.reward);
           
                   this.followTarget.destroyObj();

                    this.followTarget = null;
                    
                }

                
                let keys = Object.keys(Globals.entities);
                keys = keys.filter(key => (key != this.uuid));
            
                for (let i = keys.length-1; i >= 0; i--) {    
                    const entity = Globals.entities[keys[i]];
                    
                    if(this.sBody.overlaps(entity.body))
                    {
                    
                        entity.removeBodyData();
                        
                        this.updateXP(this.followTarget?.reward);
                        entity.destroyObj();  

                        this.followTarget = null;
                        
                    }
                }

                // if(this.sBody.overlaps(Globals.heroBody))
                // {
                //     Globals.heroBody.parentContainer.removeBodyData();
                //     this.updateXP(Globals.heroBody.parentContainer.reward);
                    
                //     Globals.heroBody.parentContainer.destroyObj();  

                //     this.followTarget = null;
                // }

                
                
        }
    }

    get reward()
    {
        return this.stats.reward;
    }

    get level()
    {
        return this.stats.level;
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

        if(this.sightBody.isDebug)
        {
            disposeData.debugGraphic.push(this.sightBody.graphic);
        }


        Globals.world.removeBody(this.body);
        Globals.world.removeBody(this.sBody);
        Globals.world.removeBody(this.sightBody);
    }

    destroyObj()
    {
        console.log("Destoryed ENTITY " + this.uuid);
        
        if(this.uuid in Globals.entities)
        {
            delete Globals.entities[this.uuid];
            this.nameText.destroy();
            this.destroy();
        }
    }
}