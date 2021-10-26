import { Globals } from "./Globals";
import * as PIXI from 'pixi.js';


export const getMousePosition = () => Globals.App.app.renderer.plugins.interaction.mouse.global;

export const getDirectionBetween = (vec1, vec2) => new PIXI.Point(vec2.x - vec1.x, vec2.y - vec1.y);

export const getMagnitude = (vec1) => Math.sqrt((vec1.x * vec1.x) + (vec1.y * vec1.y));

export const normalize = (vec1) => {
    const m = getMagnitude(vec1);
    
    if (m > 0) 
        return new PIXI.Point(vec1.x / m, vec1.y/m);
    else
        return vec1;
};

export const getAngleBetween = (vec1, vec2) => {
    
    
    return getAngleInRadian(vec1, vec2) * (180 / Math.PI);
};

export const getAngleInRadian = (vec1, vec2) => {
    const dotProduct = (vec1.x * vec2.x) + (vec1.y * vec2.y);
    
    const m1 = getMagnitude(vec1);
    const m2 = getMagnitude(vec2);

    const angleInRadian = Math.acos(dotProduct / (m1 * m2)) * (vec2.x/Math.abs(vec2.x));

    return angleInRadian;
};

export const degreeToRadian = (angleInDeg) => angleInDeg * (Math.PI / 180);

export const getPointOnCircle = (cVec1, radius, angle) => new PIXI.Point(cVec1.x + radius * Math.cos(angle), cVec1.y + radius * Math.sin(angle));

export const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

export const fetchGlobalPosition = (component) => {
    let point = new PIXI.Point();
    
    component.getGlobalPosition(point, false);
    return point;
};