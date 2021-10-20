import * as PIXI from "pixi.js";
import { gameConfig } from "./appConfig";
import { Collectible } from "./Collectible";
import { clamp } from "./Utilities";


export class CollectibleManager
{
    constructor(backgroundContainer, noOfCollectibles)
    {
        
        this.collectibles = [];
        for (let i = 0; i < noOfCollectibles; i++) {

            const randomX = Math.floor((Math.random()* backgroundContainer.width) - backgroundContainer.width/2);
            const randomY = Math.floor((Math.random()* backgroundContainer.height) - backgroundContainer.height/2);

            const offset = 100 * gameConfig.widthRatio;
            randomX = clamp(randomX, -backgroundContainer.width/2 + offset, backgroundContainer.width/2 - offset);
            randomY = clamp(randomY, -backgroundContainer.height/2 + offset, backgroundContainer.height/2 - offset);
            
            
            
            const collectible = new Collectible(randomX, randomY, backgroundContainer);


            this.collectibles.push(collectible);
        }

        
        
    }

    update(dt)
    {
        this.collectibles.reverse().forEach(collectible => {
            collectible.update(dt);
        });
    }
}