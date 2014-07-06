//the equivalent of a namespace in javascript
var GGUI = {};

//functions from starter code
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

GGUI.drawText = function(context, text, position){
	context.fillText(text, position.x, position.y);
}

GGUI.drawTextBlock = function(context, block, x, y, lineHeight, maxLines){
	maxLines = block.length < maxLines ? block.length : maxLines;
	for(var i = 0; i < maxLines; i++){
		context.fillText(block[i], x, y);
		y+= lineHeight;
	}
}

//Wraps text to a specified width. Based on behaviour of notepad.
GGUI.wrapText = function(context, text, maxWidth) {
	var words = text.split(" ");
	var line = "";
	var lines = [];
	var wordsInLine = 0;
	var addWord = true;
	var i = 0;
	while(i < words.length) {
		var tempLine = null;
		if(addWord === true){
			tempLine = line + words[i] + " ";
			wordsInLine++;
		}
		else {
			tempLine = line;
		} 
		//gets pixel size of text
		var tempWidth = context.measureText(tempLine).width;
		//Handle all cases where our line doesn't fit.
		if (tempWidth > maxWidth) {
			//When there is more than one word on this line, just put the
			//last word on a new line so that the words before that one fit on
			//one line
			if(wordsInLine > 1){
				lines.push(line);
				line = words[i] + " ";
				wordsInLine = 1;
				//hold off on adding a new word in case last word doesn't fit either
				addWord = false; 
			}
			//There is only one word on this line, so we should split it up.
			else {
				//gonna have to loop char by char
				var splitLine = "";
				for(var c = 0; c < tempLine.length; c++){
					splitLine = splitLine + tempLine.charAt(c);
					var tempWidth = context.measureText(splitLine).width;
					if(tempWidth > maxWidth){
						splitLine = splitLine.slice(0, -1); //remove extra char
						break;
					}
				}
				lines.push(splitLine);
				//put rest of word on next line (note space is already there)
				line = tempLine.slice(splitLine.length);
				wordsInLine = 1;
				//once again, the word may be too long, so hold off on adding additional words
				addWord = false;
			}
		}
		//our current line fits, so add a new word
		else {
			line = tempLine;
			addWord = true;
			i++;
		}
	}
	lines.push(line);
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
	setLabel: function(text){
		
	},
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
	//note mouseDown has the functionality of "select", so we dont
	//need a special function for that.
	unselect: function(){

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
	unselect: function(){

	},
	draw: function(context2D){
		GGUI.drawRect(context2D, this.rect, false, this.outlineColor);
		var color = this.emptyColor;
		if(this.checked)
			color = this.fillColor;
		GGUI.drawRect(context2D, this.innerRect, true, color);
	}		
};

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

//An basic text box you can type text into.
GGUI.TextBox = function(x, y, width, height, fontSize) {
	this.rect = new GGUI.Rect(x, y, width, height);
	this.rawText = "";
	this.formattedText = [];
	this.needReformat = true;
	this.fontSize = fontSize;
	//hide overflow text. Limiting input could also work.
	this.maxLines = height / fontSize - 1;
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

	},
	inputText: function(text){
		this.rawText += text;
		this.needReformat = true;
	},
	specialKey: function(key){
		if(key === 8){
			this.deleteText(1);
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
	unselect: function(){

	},
	draw: function(context2D){
		GGUI.drawRect(context2D, this.rect, false, this.outlineColor);
		GGUI.styleText(context2D, this.textColor, this.fontSize);
		//lets save those cycles
		if(this.needReformat){
			this.formattedText = GGUI.wrapText(context2D, this.rawText, this.rect.width);
			this.needReformat = false;
		}
		GGUI.drawTextBlock(context2D, this.formattedText, this.textPosition.x, this.textPosition.y,
			this.fontSize, this.maxLines);
	}
};

/*
	One panel per canvas means we can use different canvases for different layers,
	which apparently is more efficient. Having said this, I didn't add support
	for multiple layers, so clicking and stuff will affect all layers.
	http://www.html5rocks.com/en/tutorials/canvas/performance/
*/
//
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
		context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		var i;
		for(i = 0; i < this.interactiveObjs.length; i++){
			this.interactiveObjs[i].draw(this.context2D);
		}
		for(i = 0; i < this.staticObjs.length; i++){
			this.staticObjs[i].draw(this.context2D);
		}
	},
	//If I were to look more into the type system of javascript, I could probably 
	//overload this function for each type of object and add it to the appropriate list.
	//For now I'm just using duck typing.
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

		//only call on interactiveObjs hit by pointer
		for(var i = 0; i < this.interactiveObjs.length; i++){
			if(this.interactiveObjs[i].rect.containsPoint(mousePointer)){
				var selected = this.interactiveObjs[i];
				selected.mouseDown();
				//change reference of selected item.
				if(selected !== this.selectedChild){
					if(this.selectedChild !== null)
						this.selectedChild.unselect();
					this.selectedChild = selected;
				}
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
	_moveEvent: function(mEvent){

	},
	//An easy way to filter unprintable keys is to use keypress and keydown,
	//applying keydown special keys but not using them as text input.
	//Firefox counts backspace and enter as keypress, and chrome doesnt...
	_keyEvent: function(kEvent){

		//Hanle special keys
		if(kEvent.keyCode === 8 || kEvent.keyCode === 13){ //backspace

			if(this.selectedChild && typeof this.selectedChild.specialKey === 'function'){
				//implementationn dependent, just pass the key
				this.selectedChild.specialKey(kEvent.keyCode); 
			}
			kEvent.preventDefault();
			kEvent.stopPropagation();
			return false;
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
