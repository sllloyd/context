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

//-----------------------------------------------------------------

function changeSize(id, value){
	let div = document.getElementById('context-' + id);
	div.style.width = div.offsetWidth * value + 'px';
	div.style.height = div.offsetHeight * value + 'px';
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
	makeDiv(0, 'Family', 'context-pink');
	makeDiv(1, 'Neighbourhood', 'context-yellow');
	makeDiv(2, 'Peer Group', 'context-cyan');
	makeDiv(3, 'School', 'context-green');
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
	let container = document.getElementById('container');
	
	let context = document.createElement('div')
	let contextHeader = document.createElement('div')
	let contextMain = document.createElement('div')
	let contextName = document.createElement('div')
	
	let increase = document.createElement('span')
	let decrease = document.createElement('span')
	let rename = document.createElement('span')
	let remove = document.createElement('span')
	
	increase.innerHTML = '&plus;';
	decrease.innerHTML = '&minus;';
	rename.innerHTML = '&#9998;';
	remove.innerHTML = '&times;';

	increase.classList.add('action-span');
	decrease.classList.add('action-span');
	rename.classList.add('action-span');
	remove.classList.add('action-span');
	
	increase.addEventListener('click', function(){increaseSize(id);});
	decrease.addEventListener('click', function(){decreaseSize(id);});
	rename.addEventListener('click', function(){rename(id);});
	remove.addEventListener('click', function(){remove(id);});
/*
			<span onclick="increaseSize(this)" class="action-span" title="Increase Size">&plus;</span>
			<span onclick="decreaseSize(this)" class="action-span" title="Decrease Size">&minus;</span>
			<span onclick="rename(this)" class="action-span" title="Rename">&#9998;</span>
			<span onclick="remove(this)" class="action-span" title="Delete">&#9447;</span>
*/
	context.classList.add(colour);
	context.classList.add('context');
	contextHeader.classList.add('context-header');
	contextMain.classList.add('context-main');
	contextName.classList.add('context-name');
	
	context.id = 'context-' + id;
	contextName.id = 'context-name-' + id;
	contextName.innerText = name;
	
	contextMain.appendChild(contextName);
	contextHeader.appendChild(increase);
	contextHeader.appendChild(decrease);
	contextHeader.appendChild(rename);
	contextHeader.appendChild(remove);
	context.appendChild(contextMain);
	context.appendChild(contextHeader);
	container.appendChild(context);
}

//-----------------------------------------------------------------
