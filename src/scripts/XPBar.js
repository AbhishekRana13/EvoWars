import * as PIXI from 'pixi.js';
import { appConfig, gameConfig } from './appConfig';
import { clamp } from './Utilities';
import * as TWEEN from '@tweenjs/tween.js';
import { Label } from './LabelScore';
import { PlayerStats } from './Globals';

export class XPBar extends PIXI.Container
{
    constructor()
    {
        super();


        this.barWidth = appConfig.width * 0.8;
        this.barHeight = 100 * gameConfig.heightRatio;
        this.lastProgress = {x : 0};
        this.timeToFillBar = 1000;

        
        this.createBar();
        this.createLevelStatus();
       
       
       
       
        //testing
        //this.updateProgress(0);     
    }

    createBar()
    {
        const backBar = new PIXI.Graphics();
        backBar.beginFill(0x808080);
        backBar.drawRect(-this.barWidth/2, -this.barHeight, this.barWidth, this.barHeight);
        backBar.endFill();

        this.frontBar = new PIXI.Graphics();
        this.frontBar.beginFill(0x990000);
        this.frontBar.drawRect(-this.barWidth/2, -this.barHeight, 0, this.barHeight);
        this.frontBar.endFill();
        
        
        this.addChild(backBar);
        this.addChild(this.frontBar);
    }

    createLevelStatus()
    {
        const circle = new PIXI.Graphics();
        circle.beginFill(0xE69138);
        circle.drawCircle(-this.barWidth/2, -this.barHeight/2, this.barHeight);
        circle.endFill();


        this.levelText = new Label(-this.barWidth/2, -this.barHeight/2, 0.5, PlayerStats.level, 58, 0xffffff );
        this.levelText.style.fontWeight = "bold"

        this.addChild(circle);
        this.addChild(this.levelText);
    }

    updateLevel(level = null)
    {
        if(level != null)
            PlayerStats.level = level;

        this.levelText = PlayerStats.level;
    }

    updateProgress(progressRatio)
    {
        progressRatio = clamp(progressRatio, 0, 1);

        if(this.progressTween != null && this.progressTween.isPlaying)
            this.progressTween.stop();
        

        const duration = Math.abs(progressRatio - this.lastProgress.x) * this.timeToFillBar;
        console.log("Duration : " + duration);

        this.progressTween = new TWEEN.Tween(this.lastProgress)
            .to({x : progressRatio}, duration)
            .onUpdate((obj) => {
                this.frontBar.clear();
                this.frontBar.beginFill(0x990000);
                this.frontBar.drawRect(-this.barWidth/2, -this.barHeight, this.barWidth * obj.x, this.barHeight);
                this.frontBar.endFill();
                this.levelText.text = PlayerStats.level;
            })
            .start();
    }





}