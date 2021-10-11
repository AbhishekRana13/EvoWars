import * as PIXI from "pixi.js";

export class DebugCircle extends PIXI.Graphics
{
    constructor(component, radius = 5, container = null)
    {
        super();

        let point = new PIXI.Point();
        
        component.getGlobalPosition(point, false);



        this.lineStyle(0); 
        this.beginFill(0xDE3249, 1);
        this.drawCircle(point.x, point.y, radius);
        this.endFill();

        if(container)
            container.addChild(this);
    }
}