//the equivalent of a namespace in javascript
var GGUI = {};

/*-------functions from starter code*/
GGUI.drawRect = function(context, rect, filled, color)
{
    if (filled)
    {
        context.fillStyle = color;
        context.fillRect(rect.position.x, rect.position.y, rect.width, rect.height);
    }
    else
    {
        context.strokeStyle = color;
        context.strokeRect(rect.position.x, rect.position.y, rect.width, rect.height);
    }
}

GGUI.clearRect = function(context, rect)
{
    context.clearRect(rect.position.x, rect.position.y, rect.width, rect.height);
}

GGUI.styleText = function(context, color, size, bold)
{
    var boldText = "";
    if (bold)
    {
        boldText = "bold";
    }
    context.font = boldText + (size.toString() + "px Arial");
    context.fillStyle = color;
}


/*--------text formatting/drawing functions--------*/
GGUI.drawText = function(context, text, position){
	context.fillText(text, position.x, position.y);
}

//Lines are split up as elements in array
GGUI.drawTextBlock = function(context, block, x, y, lineHeight, maxLines){
	maxLines = block.length < maxLines ? block.length : maxLines;
	for(var i = 0; i < maxLines; i++){
		context.fillText(block[i], x, y);
		y+= lineHeight;
	}
}

//Truncates word based on a max canvas relative width
GGUI.truncateWord = function(context, word, maxWidth){
	var choppedWord = word;
	//Since there is no consistent way to predict length, measure text char by char
	for(var i = 0; i < word.length; i++){
		var choppedWord = word.slice(0, i);
		var slicedWidth = context.measureText(choppedWord).width;
		//we're done but we went one character over.
		if(slicedWidth > maxWidth){
			choppedWord = choppedWord.slice(0, -1); //remove extra char
			break;
		}
	}
	return choppedWord;
}

//Wraps a body of text to a specified width. Based on observed behaviour of windows notepad.
GGUI.wrapText = function(context, text, maxWidth) {
	var words = text.split(" ");
	var fittingLine = "";
	var lines = [];
	var wordsInLine = 0;
	var addWord = true;
	var i = 0;
	while(i < words.length) {
		var lineBuffer = fittingLine;

		if(addWord){
			lineBuffer = fittingLine + words[i] + " ";
			wordsInLine++;
		}
		//gets pixel size of text
		var measuredWidth = context.measureText(lineBuffer).width;
		//Handle all cases where our line doesn't fit.
		if (measuredWidth > maxWidth) {
			//When there is more than one word on this line, move the last word to a new line
			if(wordsInLine > 1){
				lines.push(fittingLine);
				fittingLine = words[i] + " ";
			}
			//There is only one word on this line, but it doesnt fit, so we should split it up.
			else {
				var splitLine = GGUI.truncateWord(context, lineBuffer, maxWidth);
				lines.push(splitLine);
				//put rest of word on next line (note space is already there)
				fittingLine = lineBuffer.slice(splitLine.length);
			}
			//back to one word in both cases
			wordsInLine = 1;
			//even the split up word may be too long, so hold off on adding additional words
			addWord = false;
		}
		//current line fits, so add a new word
		else {
			fittingLine = lineBuffer;
			addWord = true;
			i++;
		}
	}

	lines.push(fittingLine);
	return lines;
}


/*------Utility objects--------*/
GGUI.Point = function(x, y) {
	this.x = x || 0;
	this.y = y || 0;
};

//get rect
GGUI.Rect = function (x, y, width, height) {
	this.position =  new GGUI.Point(x, y);
	this.width = width || 0;
	this.height = height || 0;
};

GGUI.Rect.prototype = {
	constructor: GGUI.Rect,
	//basic intersection check
	containsPoint: function (point) {
		if(point.x < this.position.x) return false;
		if(point.x > this.position.x + this.width) return false;
		if(point.y < this.position.y) return false;
		if(point.y > this.position.y + this.height) return false;
		return true;
	}
};

/*---- UI objects------*/

//A button that can call a function when clicked on.
GGUI.Button = function(x, y, width, height, normal, pressed) {
	this.rect = new GGUI.Rect(x, y, width, height);
	this.normalColor = normal || "grey";
	this.pressedColor = pressed || "black";
	this.hoverColor = this.normalColor;
	this.currColor = this.normalColor;
	this.clickCallback = null; //could allow multiple callbacks in the future
	this.labelText = "";
	this.pressed = false;
};

GGUI.Button.prototype = {
	contructor: GGUI.Button,
	setOnClick: function(callback) {
		this._clickCallback = callback;
	},
	mouseDown: function() {
		this.pressed = true;
		this.currColor = this.pressedColor;
		if(typeof this._clickCallback === 'function')
			this._clickCallback();
	},
	mouseUp: function() {
		if(this.pressed === false)
			return;
		this.pressed = false;
		this.currColor = this.normalColor;
	},
	draw: function(context2D) {
		context2D.fillStyle = this.currColor;
		context2D.fillRect(this.rect.position.x, this.rect.position.y, 
			this.rect.width, this.rect.height);
	}
};

//A checkbox that's useful for its checked boolean
GGUI.CheckBox = function(x, y, width, height, emptyColor, fillColor, outlineColor){
	this.rect = new GGUI.Rect(x, y, width, height);
	var innerPadding =  width * 0.2;

	this.innerRect = new GGUI.Rect(x + innerPadding, y + innerPadding,
					 width - 2 *innerPadding, height - 2 *innerPadding);

	this.emptyColor = emptyColor || "white";
	this.fillColor = fillColor || "green";
	this.outlineColor = outlineColor || "black";
	this.checked = false;
};

GGUI.CheckBox.prototype = {
	constructor: GGUI.CheckBox,
	mouseDown: function(){
		this.checked = !this.checked;
	},
	draw: function(context2D){
		GGUI.drawRect(context2D, this.rect, false, this.outlineColor);
		var color = this.emptyColor;
		if(this.checked)
			color = this.fillColor;
		GGUI.drawRect(context2D, this.innerRect, true, color);
	},
	isChecked: function(){
		return this.checked;
	}	
};

//Simple text label
GGUI.Label = function(x, y, text, fontSize, color){
	this.position = new GGUI.Point(x, y);
	this.text = text || "";
	this.fontSize = fontSize;
	this.color = color || "black";
};

GGUI.Label.prototype = {
	constructor: GGUI.Label,
	setText: function(text){
		this.text = text;
	},
	draw : function(context2D){
		GGUI.styleText(context2D, this.color, this.fontSize);
		GGUI.drawText(context2D, this.text, this.position);
	}
};

//An basic text box you can type text into. Does not show a cursor or
//support special characters like tab or enter
GGUI.TextBox = function(x, y, width, height, fontSize) {
	this.rect = new GGUI.Rect(x, y, width, height);
	this.rawText = "";
	this.formattedText = [];
	this.needReformat = true;
	this._ignoreInput = false;
	this.fontSize = fontSize;
	//The lines that can fit in the box
	this.maxLines = Math.floor(height / fontSize - 1);
	//this.fontSize = height / lines;
	this.textPosition = new GGUI.Point(this.rect.position.x, 
						this.rect.position.y + this.fontSize);
	this.outlineColor = "black";
	this.textColor = "black";
	this.backgroundColor = "white";
};

GGUI.TextBox.prototype = {
	constructor: GGUI.TextBox,
	mouseDown: function(){
		//could be used to set cursor position or hightlight text box
	},
	setText: function(text){
		this.rawText = text;
		this.needReformat = true;
	},
	inputText: function(text){
		if(!this._ignoreInput){
			this.rawText += text;
			this.needReformat = true;
		}
	},
	specialKey: function(key){
		if(key === 8){
			this.deleteText(1);
		}
		else if(key === 13){
			this.inputText("\n");
		}
	},
	//removes a certain amount of characters off the end.
	deleteText: function(count){
		if(count <= this.rawText.length){
			this.rawText = this.rawText.slice(0, -count);
			this.needReformat = true;
		}
	},
	//clears all text
	clearText: function(){
		this.rawText = "";
		this.needReformat = true;
	},
	draw: function(context2D){
		GGUI.drawRect(context2D, this.rect, false, this.outlineColor);
		GGUI.styleText(context2D, this.textColor, this.fontSize);
		//lets save those cycles
		if(this.needReformat){
			this.formattedText = GGUI.wrapText(context2D, this.rawText, this.rect.width);
			//Dont' allow further text input. Last word may still wrap. possible solution is a callback
			this._ignoreInput = this.formattedText.length > this.maxLines;
			this.needReformat = false;
		}
		GGUI.drawTextBlock(context2D, this.formattedText, this.textPosition.x, this.textPosition.y,
			this.fontSize, this.maxLines);
	}
};

/*
	One panel per canvas means we can use different canvases for different layers,
	which apparently is more efficient. Having said this, I didn't actually add support
	for multiple layers, so clicking and stuff will affect all layers.
	http://www.html5rocks.com/en/tutorials/canvas/performance/
*/

//Handles draw calls of all children, as well as mouse and keyboard events
GGUI.Panel = function(canvas){
	this.canvas = canvas;
	this.canvas.addEventListener('mousedown', this._downEvent.bind(this), false);
	this.canvas.addEventListener('mouseup', this._upEvent.bind(this), false);	
	this.canvas.addEventListener('mousemove', this._moveEvent.bind(this), false);

	this.canvas.addEventListener('keypress', this._keyEvent.bind(this), false);
	this.canvas.addEventListener('keydown', this._keyEvent.bind(this), false);
	this.context2D = this.canvas.getContext("2d");
	this.interactiveObjs = [];
	this.staticObjs = [];
	this.selectedChild = null; //aka "the chosen one"

	//http://stackoverflow.com/a/17130415
	var bRect = this.canvas.getBoundingClientRect();
	//client offset for canvas
	this._cOffset = new GGUI.Point(bRect.left, bRect.top);
};

GGUI.Panel.prototype = {
	contructor: GGUI.Panel,
	draw: function(){
		this.context2D.clearRect(0, 0, this.canvas.width, this.canvas.height);
		var i;
		for(i = 0; i < this.interactiveObjs.length; i++){
			this.interactiveObjs[i].draw(this.context2D);
		}
		for(i = 0; i < this.staticObjs.length; i++){
			this.staticObjs[i].draw(this.context2D);
		}
	},

	//In hindsight this should have been converted to a set of factory functions (like addButton).
	// For now I'm just using duck typing.
	addChild: function(child){
		if(child){
			if(typeof child.mouseDown === 'function'){
				this.interactiveObjs.push(child);
			}
			else{
				this.staticObjs.push(child);
			}
		}
	},

	_downEvent: function(mEvent){
		var mousePointer = new GGUI.Point(mEvent.clientX - this._cOffset.x,
							 mEvent.clientY - this._cOffset.y);

		//only notify interactiveObjs hit by pointer
		for(var i = 0; i < this.interactiveObjs.length; i++){
			if(this.interactiveObjs[i].rect.containsPoint(mousePointer)){
				var selected = this.interactiveObjs[i];
				selected.mouseDown();
				this.selectedChild = selected;
				break;
			}
		}
	},
	_upEvent: function(mEvent){
		//call on all interactiveObjs
		for(var i = 0; i < this.interactiveObjs.length; i++){
			if(typeof this.interactiveObjs[i].mouseUp === 'function')
				this.interactiveObjs[i].mouseUp();
		}
	},
	//could be used for fancy hover effects.
	_moveEvent: function(mEvent){

	},
	//An easy way to filter unprintable keys is to use keypress and keydown,
	//applying keydown special keys but not using them as text input.
	//Firefox counts backspace and enter as keypress, and chrome doesnt...
	_keyEvent: function(kEvent){

		//Hanle special keys
		if(kEvent.keyCode === 8 || kEvent.keyCode === 13){ //backspace and enter

			if(this.selectedChild && typeof this.selectedChild.specialKey === 'function'){
				//implementation dependant, just pass the key
				this.selectedChild.specialKey(kEvent.keyCode); 
			}
			kEvent.preventDefault();
			kEvent.stopPropagation();
			return false; //some browsers use this to stop propagation
		}

		//don't take every key as text input, wait for keypress event
		if(kEvent.type === 'keydown')
			return;

		//if the ui element that is selected (has focus) can receive key input, send key
		if(this.selectedChild && typeof this.selectedChild.inputText === 'function'){
			this.selectedChild.inputText(String.fromCharCode(kEvent.charCode));
		}
	}
};
