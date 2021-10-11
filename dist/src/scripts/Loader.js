import * as PIXI from 'pixi.js';
import { fontData, LoaderConfig, LoaderSoundConfig, preloaderConfig } from "./LoaderConfig";
import { Globals } from "./Globals";
import { appConfig, gameConfig } from './appConfig';
import {DebugText} from './DebugText';
import {Background} from './Background';
import {Howl, Howler} from 'howler';
import "pixi-spine";
import * as FFC from 'fontfaceobserver';

export class Loader {
    constructor(loader, container) {
        this.loader = loader;
        
        
        
        this.background = new Background(PIXI.Texture.from('../src/sprites/Prototype/Orange/texture_08.png'));

        container.addChild(this.background);

        this.loaderBarContainer = new PIXI.Container();

        this.logo = PIXI.Sprite.from('../src/sprites/monkey.png');
        
        this.logo.anchor.set(0.5, 1);
        this.logo.position = new PIXI.Point(0, 0);
        this.loaderBarContainer.addChild(this.logo);

        this.progressBox = new PIXI.Graphics()
        this.progressBar = new PIXI.Graphics();

        this.progressBox.beginFill(0x3c3c3c, 0.8);
        this.progressBox.drawRect(-240, 0, 480, 20);
        this.progressBox.endFill();

        this.progressText = new DebugText("0%", 0, 0, '#FFF');
        this.progressText.anchor.set(1, 0);
        this.progressText.position = new PIXI.Point( 230, this.progressBox.height);
        
        this.loaderBarContainer.addChild(this.progressBox);
        this.loaderBarContainer.addChild(this.progressBar);
        this.loaderBarContainer.addChild(this.progressText);

        this.loaderBarContainer.scale.set(gameConfig.heightRatio);
        
        this.loaderBarContainer.x = appConfig.width/2;
        this.loaderBarContainer.y = appConfig.height/2;

        container.addChild(this.loaderBarContainer);
        this.loader.onProgress.add((e) => {
           let value = e.progress / 100;
           this.progressBar.clear();
            this.progressBar.beginFill(0xffffff, 1);
            this.progressBar.drawRect(-235, 5, 470 * value, 10);
            this.progressText.text = `${Math.ceil(e.progress)}%`;
            this.progressBar.endFill();
        });

        this.loader.onComplete.add((e) => {
            this.progressBar.clear();
            this.progressBar.beginFill(0xffffff, 1);
            this.progressBar.drawRect(-235, 5, 470 , 10);
            this.progressBar.endFill();
        });
        
        this.resources = LoaderConfig;

       
    }

    


    preload() {
        return new Promise(resolve => {
            for (let key in this.resources) {
                this.loader.add(key, this.resources[key]);
            }
    
            this.loader.load((loader, res) => {
                Globals.resources = res;  

                const fontArray =[];
                fontData.forEach(fontName => {
                    fontArray.push(new FFC(fontName).load());
                });

                if(fontArray.length == 0)
                    resolve();
                else
                {
                    Promise.all(fontArray).then(() => {
                        resolve();
                    });
                }
                    

              
            });
        });
    }

    preloadSounds()
    {
        for (let key in LoaderSoundConfig)
        {
            const sound = new Howl({
                src : [LoaderSoundConfig[key]]
            });

            sound.on("load",() => {
                Globals.soundResources[key] = sound;
            }, this);
        }
    }

    

}