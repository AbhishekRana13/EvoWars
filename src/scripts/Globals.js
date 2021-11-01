import * as PIXI from 'pixi.js';

export const Globals = {
    resources: {},
    world : null,
    worldBounds : new PIXI.Bounds(),
    get isMobile() {
      //  return true;
        return PIXI.utils.isMobile.any;
    },
    entities : {},
    heroName : "Abhi"
};

export const gameSettings = {
    speed : 4,
    boostedSpeed : 8,
    CollisionGroups : {
        DEFAULT : 1,
        SWORD : 2,
        COLLECTIBLE : 4,
        HERO : 8,
        ENTITY : 16,
        SIGHT : 32
    },
    depleteValue : 1
};



export const PlayerStats = {
    level : 1,
    xp : 0,
    xpMax : 204.0816327,
    x : 0.07,
    y : 2,
    updateXP(value)
    {
        this.xp += value;
        this.reward += value;
        if(this.xp > this.xpMax)
        {
            const remainingXp = this.xp - this.xpMax;
            this.level++;
            this.xpMax = Math.pow((this.level / this.x), this.y);

            this.xp = remainingXp;

            if(this.onLevelUpdate != null)
                this.onLevelUpdate();
        }
    },
    depleteXP(value)
    {   
        this.xp -= value;
        this.reward -= value;
        
        if(this.xp < 0 && this.level == 1)
        {
            this.xp = 0;
            this.reward = 20;
            return;
        }

        if(this.xp < 0)
        {
          
            this.level--;
            this.xpMax = Math.pow((this.level / this.x), this.y);
            
            const remainingXp = this.xpMax + this.xp;
            this.xp = remainingXp;

            if(this.onLevelUpdate != null)
                this.onLevelUpdate(true);

            
        }
    },
    onLevelUpdate : null,
    reward : 20,
    reset()
    {
        this.xp = 0;
        this.xpMax = 204.0816327,
        this.level = 1
    }
};

export const disposeData = {
    debugGraphic : [],
    containers : []
}