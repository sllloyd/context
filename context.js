/*
	Context Weighting
	Version 1.0
	context.js
	
	Contains all JavaScript functions
	
	Copyright 2021 Steve Lloyd
	Permission is hereby granted, free of charge, to any person obtaining a copy of this software
	and associated documentation files (the "Software"), to deal in the Software without restriction,
	including without limitation the rights to use, copy, modify, merge, publish, distribute,
	sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or 
	substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
	INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
	PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
	FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
	ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

"use strict"

var version = 1.0;
var step = 1.2;
var widths = {};
var config = {};
var total = 0.0;
var startWidth = 300;
var startHeight = 200;
var startFontSize = 20;
var minWidth = 150;
var maxWidth = 800;

//                pink      yellow      cyan      green      purple   orange
var colours = ['#ffb6c1', '#faffc7', '#ccf1ff', '#90ee90', '#e0d7ff', '#ffdac1'];
var names = ['Family', 'Neighbourhood', 'Peer Group', 'School'];

//-----------------------------------------------------------------

function changeSize(id, scale, adjustOthers=true){
	let div = document.getElementById('context-' + id);
	let nameDiv = document.getElementById('context-name-' + id);
	let width = div.offsetWidth;
	let newWidth = width * scale;
	let newHeight = div.offsetHeight * scale;
	
	let plus = document.getElementById('context-plus-' + id);
	let minus = document.getElementById('context-minus-' + id);
	plus.classList.remove('disabled');
	minus.classList.remove('disabled');
	
	if (newWidth > maxWidth){
		newWidth = maxWidth;
		newHeight = newWidth * startHeight / startWidth;
		scale = newWidth / width;
		plus.classList.add('disabled');
	}
	if (newWidth < minWidth){
		newWidth = minWidth;
		newHeight = newWidth * startHeight / startWidth;
		scale = newWidth / width;
		minus.classList.add('disabled');
	}
	
	total = total - widths[id];
	let otherTotal = total;
	widths[id] = newWidth;
	total = total + widths[id];
	
	div.style.width =  newWidth + 'px';
	div.style.height = newHeight + 'px';
	
	let fontSize = nameDiv.style.fontSize;
	fontSize = fontSize.replace('pt', '');
	let newFontSize = fontSize * scale;
	nameDiv.style.fontSize = newFontSize + 'pt';

	config.state[id].width = newWidth;
	config.state[id].height = newHeight;
	config.state[id].font_size = newFontSize;
	config.state[id].scale = config.state[id].scale * scale;
	
	saveConfig();
	
	if (!adjustOthers) return;
	
	let diff = newWidth - width;
	for (let i=0; i<config.order.length; i++){
		let id2 = config.order[i];
		if (id2 == id) continue;
		
		let idiff = diff * widths[id2] / otherTotal;
		let newScale = (widths[id2] - idiff)/widths[id2];
		changeSize(id2, newScale, false)
	}
}

//-----------------------------------------------------------------

function createId(length){
	const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let id = ' ';
	for (let i = 0; i < length; i++) {
		id += characters.charAt(Math.floor(Math.random() * characters.length));
	}

	return id;
}

//-----------------------------------------------------------------

function decreaseSize(id){
	changeSize(id, 1.0/step);
}

//-----------------------------------------------------------------

function increaseSize(id){
	changeSize(id, step);
}

//-----------------------------------------------------------------

function initialise(){
	readConfig();
	for (let id of config.order){
		makeDiv(id);
	}
	setIcons(); 
}

//-----------------------------------------------------------------

function remove(id){
}

//-----------------------------------------------------------------

function rename(id){
}

//-----------------------------------------------------------------

function reset(){
	let result = confirm('Are you sure you want to reset? This will remove all your customisations and additional contexts.');
	if (!result) return;
	
	localStorage.removeItem('context-weighting');
	let container = document.getElementById('container');
	container.innerHTML = '';
	initialise();
}

//-----------------------------------------------------------------


//-----------------------------------------------------------------

function makeDiv(id){
	
	let container = document.getElementById('container');
	
	let context = document.createElement('div')
	let contextHeader = document.createElement('div')
	let contextMain = document.createElement('div')
	let contextName = document.createElement('div')
	
	let plus = document.createElement('span')
	let minus = document.createElement('span')
	let left = document.createElement('span')
	let right = document.createElement('span')
	let rename = document.createElement('span')
	let remove = document.createElement('span')
	
	plus.innerHTML = '&plus;&#xFE0E;';
	minus.innerHTML = '&minus;&#xFE0E;';
	left.innerHTML = '&nwarr;&#xFE0E;';
	right.innerHTML = '&searr;&#xFE0E;';
	rename.innerHTML = '&#9998;&#xFE0E;';
	remove.innerHTML = '&times;&#xFE0E;';

	plus.title = 'Increase Size';
	minus.title = 'Decrease Size';
	left.title = 'Move Left/Up';
	right.title = 'Move Right/Down';
	rename.title = 'Rename';
	remove.title = 'Delete';

	plus.classList.add('action-span');
	minus.classList.add('action-span');
	left.classList.add('action-span');
	right.classList.add('action-span');
	rename.classList.add('action-span');
	remove.classList.add('action-span');
	
	plus.addEventListener('click', function(){increaseSize(id);});
	minus.addEventListener('click', function(){decreaseSize(id);});
	left.addEventListener('click', function(){moveLeft(id);});
	right.addEventListener('click', function(){moveRight(id);});
	rename.addEventListener('click', function(){rename(id);});
	remove.addEventListener('click', function(){remove(id);});

	
	context.classList.add('context');
	contextHeader.classList.add('context-header');
	contextMain.classList.add('context-main');
	contextName.classList.add('context-name');
	
	// Temporary
	rename.classList.add('disabled');
	remove.classList.add('disabled');
	
	plus.id = 'context-plus-' + id
	minus.id = 'context-minus-' + id
	left.id = 'context-left-' + id
	right.id = 'context-right-' + id
	context.id = 'context-' + id;
	contextName.id = 'context-name-' + id;
	contextName.innerText = config.state[id].name;
	
	context.style.width = config.state[id].width + 'px';
	context.style.height = config.state[id].height + 'px';
	context.style.backgroundColor = config.state[id].colour;
	
	contextName.style.fontSize = config.state[id].font_size + 'pt';
	
	widths[id] = config.state[id].width;
	total += widths[id];
	
	contextMain.appendChild(contextName);
	contextHeader.appendChild(plus);
	contextHeader.appendChild(minus);
	contextHeader.appendChild(left);
	contextHeader.appendChild(right);
	contextHeader.appendChild(rename);
	contextHeader.appendChild(remove);
	context.appendChild(contextMain);
	context.appendChild(contextHeader);
	container.appendChild(context);
}

//-----------------------------------------------------------------

function moveDiv(id, ord, newOrd, newOrd2){
	let container = document.getElementById('container');
	let div = document.getElementById('context-' + config.order[ord]);
	let divBefore = document.getElementById('context-' + config.order[newOrd]);
	
	// Move the div
	container.insertBefore(div, divBefore);
	
	// Remove this entry from order
	config.order.splice(ord, 1)
	// Add it back again
	config.order.splice(newOrd2, 0, id)

	setIcons();
	saveConfig();
}

//-----------------------------------------------------------------

function moveLeft(id){
	let ord = config.order.indexOf(id);
	if (ord > 0) moveDiv(id, ord, ord-1, ord-1);
}
	
//-----------------------------------------------------------------

function moveRight(id){
	let ord = config.order.indexOf(id);
	if (ord < (config.order.length - 1)) moveDiv(id, ord, ord+2, ord+1);
}

//-----------------------------------------------------------------

function readConfig(){
	let storedVersion = 0;
	if (localStorage.getItem('context-weighting') !== null){
		config = JSON.parse(localStorage.getItem('context-weighting')); 
		storedVersion = config.version;
	}

	if (storedVersion < 1.0){
		config = {};
		config.version = 0.0;
		config.state = {}
		config.order = [];
		for (let i=0; i<4; i++){
			let id = createId(6);
			config.state[id]= {'name': names[i], 'colour': colours[i], 'width': startWidth, 'height': startHeight, 'font_size': startFontSize, 'scale': 1.0, 'seq': i};
			config.order.push(id);
		}
		config.free = [4, 5];
	}

	if (config.version != version){
		config.version = version;
		saveConfig();
	}
}

//-----------------------------------------------------------------

function saveConfig(){
	localStorage.setItem('context-weighting', JSON.stringify(config));
}

//-----------------------------------------------------------------

function setIcons(){
	for (let id of config.order){
		let ord = config.order.indexOf(id);
		let left = document.getElementById('context-left-' + id);
		let right = document.getElementById('context-right-' + id);
		left.classList.remove('disabled');
		right.classList.remove('disabled');
		if (ord == 0) left.classList.add('disabled');
		if (ord == (config.order.length - 1)) right.classList.add('disabled');
	}
}

//-----------------------------------------------------------------
