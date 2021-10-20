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
    xpMax : 100
};