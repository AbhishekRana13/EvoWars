import * as PIXI from "pixi.js";
import { Loader } from "./Loader";
import { Globals } from "./Globals";
import { SceneManager } from "./SceneManager";
import { appConfig, gameConfig } from "./appConfig";
import { MyEmitter } from "./MyEmitter";
import { GameScene } from "./GameScene";


export class App {
    run() {
        // create canvas
        this.app = new PIXI.Application({width : window.innerWidth, height : window.innerHeight});

        document.body.appendChild(this.app.view);
        appConfig.width = this.app.screen.width;
        appConfig.height = this.app.screen.height;


        this.app.view.oncontextmenu = (e) => {
            e.preventDefault();

        };

        window.onresize = (e) => {
            console.log(e);

            //this.app.resizeTo = window;
//this.app.resize();
           // appConfig.width = this.app.screen.width;
           // appConfig.height = this.app.screen.height;
            
        }

        this.app.view.onpointerdown = (e) => {
            if(e.button == 0)
            {
                Globals.emitter.Call("leftMouseDown");
            } else if (e.button == 2)
            {
                Globals.emitter.Call("rightMouseDown");
            }
        };

        

        this.app.view.onpointerup = (e) => {
            if(e.button == 0)
            {
                Globals.emitter.Call("leftMouseUp");
            } else if (e.button == 2)
            {
                Globals.emitter.Call("rightMouseUp");
            }
        };
        
       
        
        Globals.emitter = new MyEmitter();
        

        Globals.scene = new SceneManager();
        this.app.stage.addChild(Globals.scene.container);
        this.app.ticker.add(dt => Globals.scene.update(dt));

        // load sprites
        const loaderContainer = new PIXI.Container();
        this.app.stage.addChild(loaderContainer);
        
        this.loader = new Loader(this.app.loader, loaderContainer);
        


        this.loader.preload().then(() => {
            setTimeout(() => {
                loaderContainer.destroy();

                Globals.scene.start(new GameScene());
            }, 1000);
        });

        this.loader.preloadSounds();
        
    }

    addOrientationCheck()
    {
        if(PIXI.utils.isMobile)
        {

            window.addEventListener("orientationchange", function() {
                if (window.orientation == 90 || window.orientation == -90) {
                    Globals.scene.drawImageAbove();
                } else {
                    Globals.scene.removeImageAbove();
                }
                });
        }
    }

}