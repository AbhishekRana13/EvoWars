import * as PIXI from 'pixi.js';

export const Globals = {
    resources: {},
    world : null,
    worldBounds : new PIXI.Bounds(),
    get isMobile() {
        // return true;
        return PIXI.utils.isMobile.any;
    },
};

export const gameSettings = {
    speed : 4,
    boostedSpeed : 8
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

        if(this.xp > this.xpMax)
        {
            const remainingXp = this.xp - this.xpMax;
            this.level++;
            this.xpMax = Math.pow((this.level / this.x), this.y);

            this.xp = remainingXp;
        }
    }
};