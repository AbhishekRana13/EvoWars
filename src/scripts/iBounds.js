

export class iBounds
{
    constructor(component)
    {
        this.component = component;
        this.startX = component.x;
        this.startY = component.y;
    }

    get sLeft()
    {
        return this.startX - this.component.width/2;
    }

    get sRight()
    {
        return this.startX + this.component.width/2;
    }

    get sTop()
    {
        return this.startY - this.component.width/2;
    }

    get sBottom()
    {
        return this.startY + this.component.width/2;
    }

    get left()
    {
        return this.component.x - this.component.width/2;
    }

    get right()
    {
        return this.component.x + this.component.width/2;
    }

    get top()
    {
        return this.component.y - this.component.height/2;
    }

    get bottom()
    {
        return this.component.y + this.component.height/2;
    }

    get globalPosition()
    {
        const point = new PIXI.Point();
        this.component.getGlobalPosition(point, false);

        return point;
    }

    get localPosition()
    {
        return this.component.position;
    }

    get gLeft()
    {
        return this.globalPosition.x - this.component.width/2;
    }

    get gRight()
    {
        return this.globalPosition.x + this.component.width/2;
    }

    get gTop()
    {
        return this.globalPosition.y - this.component.height/2;
    }

    get gBottom()
    {
        return this.globalPosition.y + this.component.height/2;
    }


}
