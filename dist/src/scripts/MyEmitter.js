import * as PIXI from 'pixi.js';
import { Globals } from './Globals';

export class MyEmitter //extends PIXI.utils.EventEmitter
{
    constructor()
    {
        console.log("Emitter Created!");
    }

    Call(msgType, msgParams = {})
    {
        if(msgType != "timer" && msgType != "turnTimer")
            console.log(`Emitter Called : ${msgType}`);
        
            Globals.scene.recievedMessage(msgType, msgParams);
    }
    
}