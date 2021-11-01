


export const config = {
	logicalWidth: 1920,
	logicalHeight: 1080,
	scaleFactor: 1,
    minScaleFactor : 1,
	get topY()
	{
		return (window.innerHeight - (this.logicalHeight * this.scaleFactor))/2;
	},
	get bottomY()
	{
		return window.innerHeight - this.topX;
	},
	get leftX()
	{
		return (window.innerWidth - (this.logicalWidth * this.scaleFactor))/2;
	},
	get rightX()
	{
		return window.innerWidth - this.leftX;
	},
    get minTopY()
	{
		return (window.innerHeight - (this.logicalHeight * this.minScaleFactor))/2;
	},
	get minBottomY()
	{
		return window.innerHeight - this.topX;
	},
	get minLeftX()
	{
		return (window.innerWidth - (this.logicalWidth * this.minScaleFactor))/2;
	},
	get minRightX()
	{
		return window.innerWidth - this.leftX;
	}
}

export const CalculateScaleFactor = () => {
    const maxScaleFactor = Math.max(
        window.innerWidth/config.logicalWidth,
        window.innerHeight/config.logicalHeight,
    );

    const minScaleFactor = Math.min(
        window.innerWidth/config.logicalWidth,
        window.innerHeight/config.logicalHeight,
    );

    config.scaleFactor = maxScaleFactor;
    config.minScaleFactor = minScaleFactor;

    // console.log(config.leftX, config.rightX);
    // console.log(window.innerWidth + "x" + window.innerHeight);
    // console.log(config.scaleFactor);
    // console.log(config.minScaleFactor);
};