

import { App } from "./App";
import { Globals } from "./Globals";
import Stats from "stats.js";


//SpineParser.registerLoaderPlugin();




//Globals.socket = new Socket();

Globals.fpsStats = new Stats();
Globals.fpsStats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
Globals.fpsStats.domElement.style.cssText = "position:absolute;top:25px;left:40px;";


Globals.stats = new Stats();
Globals.stats.showPanel( 2 ); // 0: fps, 1: ms, 2: mb, 3+: custom
Globals.stats.domElement.style.cssText = "position:absolute;top:25px;left: 125px;";


Globals.App = new App();
Globals.App.run();
Globals.App.addOrientationCheck();