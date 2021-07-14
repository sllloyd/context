/*
	Context Weighting
	Version 1.0
	context.js
	
	Contains all JavaScript
	
	Inspired by the Justin Guitar Theory Course Jam Buddy
	https://www.justinguitar.com/categories/practical-fast-fun-music-theory

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

var step = 1.2;
var sizes = {};
var order = [];
var total = 0.0;
var startWidth = 300;
var startHeight = 200;
var startFontSize = 20;
//                pink      yellow      cyan      green      purple   orange
var colours = ['#ffb6c1', '#faffc7', '#ccf1ff', '#90ee90', '#e0d7ff', '#ffdac1'];

//-----------------------------------------------------------------

function changeSize(id, value, adjustOthers=true){
	let div = document.getElementById('context-' + id);
	let nameDiv = document.getElementById('context-name-' + id);
	let newWidth = div.offsetWidth * value;
	let newHeight = div.offsetHeight * value;
	let oldTotal = total;
	total = total - sizes[id];
	let otherTotal = total;
	sizes[id] = newWidth * newHeight;
	total = total + sizes[id];
	div.style.width =  newWidth + 'px';
	div.style.height = newHeight + 'px';
	let fontSize = nameDiv.style.fontSize;
	fontSize = fontSize.replace('pt', '');
	nameDiv.style.fontSize = fontSize * value + 'pt';
//	alert(nameDiv + ' ' + fontSize)
//	nameDiv.style.fontSize = fontSize*
	if (!adjustOthers) return;
	
	let amount = oldTotal - total;
//	alert(total + ' ' + ratio);
	for (let i=0; i<4; i++){
		if (i == id) continue;
		let scale = Math.sqrt(amount) * sizes[i] / otherTotal;
		changeSize(i, scale, false)
	}
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
	makeDiv(0, 'Family', colours[0]);
	makeDiv(1, 'Neighbourhood', colours[1]);
	makeDiv(2, 'Peer Group', colours[2]);
	makeDiv(3, 'School', colours[3]);

	setIcons(); 
}

//-----------------------------------------------------------------

function remove(id){
}

//-----------------------------------------------------------------

function rename(id){
}

//-----------------------------------------------------------------


//-----------------------------------------------------------------

function makeDiv(id, name, colour){
	let width = startWidth;
	let height = startHeight;
	let fontSize = startFontSize;
	
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
	
	plus.innerHTML = '&plus;';
	minus.innerHTML = '&minus;';
	left.innerHTML = '&nwarr;';
	right.innerHTML = '&searr;';
	rename.innerHTML = '&#9998;';
	remove.innerHTML = '&times;';

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
	contextName.innerText = name;
	
	context.style.width = width + 'px';
	context.style.height = height + 'px';
	context.style.backgroundColor = colour;
	
	contextName.style.fontSize = fontSize + 'pt';
	
	sizes[id] = width * height;
	total += sizes[id];
	
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
	
	order.push(id);
}

//-----------------------------------------------------------------

function moveDiv(id, ord, newOrd, newOrd2){
	let container = document.getElementById('container');
	let div = document.getElementById('context-' + order[ord]);
	let divBefore = document.getElementById('context-' + order[newOrd]);
	
	// Move the div
	container.insertBefore(div, divBefore);
	
	// Remove this entry
	order.splice(ord, 1)
	// Add it back again
	order.splice(newOrd2, 0, id)
//	alert(order);

	setIcons();
}

//-----------------------------------------------------------------

function moveLeft(id){
	let ord = order.indexOf(id);
	if (ord > 0) moveDiv(id, ord, ord-1, ord-1);
}
	
//-----------------------------------------------------------------

function moveRight(id){
	let ord = order.indexOf(id);
	if (ord < (order.length - 1)) moveDiv(id, ord, ord+2, ord+1);
}

//-----------------------------------------------------------------

function setIcons(){
	for (let id of order){
		let ord = order.indexOf(id);
		let left = document.getElementById('context-left-' + id);
		let right = document.getElementById('context-right-' + id);
		left.classList.remove('disabled');
		right.classList.remove('disabled');
		if (ord == 0) left.classList.add('disabled');
		if (ord == (order.length - 1)) right.classList.add('disabled');
	}
}

//-----------------------------------------------------------------
