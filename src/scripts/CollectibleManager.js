import * as PIXI from "pixi.js";
import { Collectible } from "./Collectible";
import { Globals, PlayerStats } from "./Globals";
import { clamp, fetchGlobalPosition, getDirectionBetween, getMagnitude } from "./Utilities";


export class CollectibleManager
{
    constructor(backgroundContainer, noOfCollectibles)
    {
        
        this.collectibles = [];
        for (let i = 0; i < noOfCollectibles; i++) {

            const randomX = Math.floor((Math.random()* backgroundContainer.width) - backgroundContainer.width/2);
            const randomY = Math.floor((Math.random()* backgroundContainer.height) - backgroundContainer.height/2);

            const offset = 100;
            randomX = clamp(randomX, -backgroundContainer.width/2 + offset, backgroundContainer.width/2 - offset);
            randomY = clamp(randomY, -backgroundContainer.height/2 + offset, backgroundContainer.height/2 - offset);
            
            
            
            const collectible = new Collectible(randomX, randomY, backgroundContainer);


            this.collectibles.push(collectible);
        }

        
        
    }
    addMore(contianer, noOfCollectibles)
    {
        for (let i = 0; i < noOfCollectibles; i++) {

            const randomX = Math.floor((Math.random()* contianer.width) - contianer.width/2);
            const randomY = Math.floor((Math.random()* contianer.height) - contianer.height/2);

            const offset = 100;
            randomX = clamp(randomX, -contianer.width/2 + offset, contianer.width/2 - offset);
            randomY = clamp(randomY, -contianer.height/2 + offset, contianer.height/2 - offset);
            
            
            
            const collectible = new Collectible(randomX, randomY, contianer);


            this.collectibles.push(collectible);
        }
    }

    update(hero, dt)
    {
        
        

        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.collectibles[i];

            collectible.update();

            // if(this.checkIfCollide(collectible, hero))
            // {
            //     this.collectCollectible(collectible, hero)
            // } else
            // {
            //     // Globals.entities.forEach(entity => {
            //     //     if(this.checkIfCollide(collectible, entity))
            //     //     {
            //     //       //  this.collectCollectible(collectible, entity)
            //     //     }
            //     // });
            // }
        }
    }



    collectCollectible(collectible, entity)
    {
           
       
        
    }

    resize()
    {
        this.collectibles.reverse().forEach(collectible => {
            collectible.sizeReset();
        });
    }
}