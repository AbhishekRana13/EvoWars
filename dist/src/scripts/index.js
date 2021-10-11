

import { App } from "./App";
import { Globals } from "./Globals";



//SpineParser.registerLoaderPlugin();

Globals.App = new App();
Globals.App.run();
Globals.App.addOrientationCheck();


//Globals.socket = new Socket();



