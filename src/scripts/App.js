import * as PIXI from "pixi.js";
import { Loader } from "./Loader";
import { Globals } from "./Globals";
import { SceneManager } from "./SceneManager";
import { CalculateScaleFactor, config} from "./appConfig";
import { MyEmitter } from "./MyEmitter";
import { GameScene } from "./GameScene";


export class App {
    run() {
        // create canvas


        PIXI.settings.RESOLUTION = window.devicePixelRatio || 1;

        this.app = new PIXI.Application({width : window.innerWidth, height : window.innerHeight});
        document.body.appendChild(this.app.view);
        document.body.appendChild( Globals.fpsStats.dom );
        document.body.appendChild( Globals.stats.dom );

        CalculateScaleFactor();

     

        this.app.renderer.view.style.width = `${window.innerWidth}px`;
		this.app.renderer.view.style.height = `${window.innerHeight}px`;
		this.app.renderer.resize(window.innerWidth, window.innerHeight);

        this.app.view.oncontextmenu = (e) => {
            e.preventDefault();

        };

        window.onresize = (e) => {
            
            CalculateScaleFactor();

            this.app.renderer.view.style.width = `${window.innerWidth}px`;
            this.app.renderer.view.style.height = `${window.innerHeight}px`;
            this.app.renderer.resize(window.innerWidth, window.innerHeight);

            Globals.scene.resize();

        }

        this.app.view.onmousedown = (e) => {
            if(e.button == 0)
            {
                Globals.emitter.Call("leftMouseDown");
            } else if (e.button == 2)
            {
                Globals.emitter.Call("rightMouseDown");
            }
        };

        

        this.app.view.onmouseup = (e) => {
            if(e.button == 0)
            {
                Globals.emitter.Call("leftMouseUp");
            } else if (e.button == 2)
            {
                Globals.emitter.Call("rightMouseUp");
            }
        };

        this.app.view.ontouchend = (e) => {
          //  console.log(e);
            Globals.emitter.Call("touchEnd", {identifier : e.changedTouches[0].identifier});
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
        if(PIXI.utils.isMobile.any)
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