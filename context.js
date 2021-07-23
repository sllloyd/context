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

const version = 1.1;
const step = 1.2;
var widths = {};
var config = {};
var total = 0.0;
const startWidth = 300;
const startHeight = 200;
const startFontSize = 20;
const minWidth = 150;
const maxWidth = 800;
var startLink = '';
const svgns = "http://www.w3.org/2000/svg";
const renameHelp = 'Press Return/Enter to save, ESC to cancel';
const linkStartHelp = 'Started link from here';
const linkEndHelp = 'Click on the green links symbol to finish link';

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
	
	moveLines();

}

//-----------------------------------------------------------------

function createId(length){
	const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let id = '';
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
	
	let container = document.getElementById('container');
	let svg = document.createElementNS(svgns,'svg');
	svg.id = 'svg';
	container.appendChild(svg);

	for (let lineId of config.lines){
		let bits = lineId.split('-');
		let id1 = bits[1];
		let id2 = bits[2];
		makeLine(id1, id2, false);
	}
	
	setLinkIcons();

}

//-----------------------------------------------------------------

function linkContext(id){

	if (startLink == id){
		let link = document.getElementById('context-link-' + id);
		link.classList.remove('link-start');
		startLink = '';
		setLinkIcons();
		return;
	}
	
	if (startLink == ''){
		startLink = id;
		let free = 0;
		for (let id1 of config.order){
			if (id1 == id) continue;
			let link = document.getElementById('context-link-' + id1);
			let help = document.getElementById('context-help-' + id1);
			if (config.lines.includes('line-' + id + '-' + id1) || config.lines.includes('line-' + id1 + '-' + id)){
				link.classList.add('link-disabled');
				continue;
			}
			link.classList.add('link-free');
			help.innerText = linkEndHelp;
			help.style.display = 'block';
			free++;
		}
		// Somewhere to go?
		if (free > 0){
			let link = document.getElementById('context-link-' + id);
			let help = document.getElementById('context-help-' + id);
		 	link.classList.add('link-start');
			help.innerText = linkStartHelp;
			help.style.display = 'block';
		 }
		return;
	}
	
	makeLine(startLink, id);
	
	startLink = '';
}

//-----------------------------------------------------------------

function makeDiv(id){
	
	let container = document.getElementById('container');
	
	let context = document.createElement('div');
	let contextHeader = document.createElement('div');
	let contextMain = document.createElement('div');
	let contextName = document.createElement('div');
	let contextEdit = document.createElement('div');
	let contextInput = document.createElement('input');
	let contextHelp = document.createElement('div');
	
	let plus = document.createElement('span');
	let minus = document.createElement('span');
	let left = document.createElement('span');
	let right = document.createElement('span');
	let rename = document.createElement('span');
	let remove = document.createElement('span');
	let link = document.createElement('span');
	
	plus.innerHTML = '&plus;&#xFE0E;';
	minus.innerHTML = '&minus;&#xFE0E;';
	left.innerHTML = '&nwarr;&#xFE0E;';
	right.innerHTML = '&searr;&#xFE0E;';
	rename.innerHTML = '&#9998;&#xFE0E;';
	remove.innerHTML = '&times;&#xFE0E;';
	link.innerHTML = ' &#128279;&#xFE0E;';

	plus.title = 'Increase size';
	minus.title = 'Decrease size';
	left.title = 'Move left/up';
	right.title = 'Move right/down';
	rename.title = 'Rename';
	remove.title = 'Remove';
	link.title = 'Link to other context';

	plus.classList.add('action-span');
	minus.classList.add('action-span');
	left.classList.add('action-span');
	right.classList.add('action-span');
	rename.classList.add('action-span');
	remove.classList.add('action-span');
	link.classList.add('action-span');
	
	plus.addEventListener('click', function(){increaseSize(id);});
	minus.addEventListener('click', function(){decreaseSize(id);});
	left.addEventListener('click', function(){moveLeft(id);});
	right.addEventListener('click', function(){moveRight(id);});
	rename.addEventListener('click', function(){renameContext(id);});
	remove.addEventListener('click', function(){removeContext(id);});
	link.addEventListener('click', function(){linkContext(id);});
	contextInput.addEventListener('keyup', onKeyUp);

	
	context.classList.add('context');
	contextHeader.classList.add('context-header');
	contextMain.classList.add('context-main');
	contextName.classList.add('context-name');
	contextEdit.classList.add('context-edit');
	contextInput.classList.add('context-input');
	contextHelp.classList.add('context-help');
	
	contextInput.setAttribute('type', 'text');
	contextInput.setAttribute('size', 15);
	contextHelp.innerText = '';
	
	plus.id = 'context-plus-' + id
	minus.id = 'context-minus-' + id
	left.id = 'context-left-' + id
	right.id = 'context-right-' + id
	rename.id = 'context-rename-' + id
	remove.id = 'context-remove-' + id
	link.id = 'context-link-' + id
	
	context.id = 'context-' + id;
	contextName.id = 'context-name-' + id;
	contextName.innerText = config.state[id].name;
	contextEdit.id = 'context-edit-' + id;
	contextInput.value = config.state[id].name;
	contextInput.id = 'context-input-' + id;
	contextHelp.id = 'context-help-' + id;
	
	context.style.width = config.state[id].width + 'px';
	context.style.height = config.state[id].height + 'px';
	context.style.backgroundColor = config.state[id].colour;
	contextName.style.fontSize = config.state[id].font_size + 'pt';
	contextEdit.style.display = 'none';
	contextHelp.style.display = 'none';
	
	widths[id] = config.state[id].width;
	total += widths[id];
	
	contextMain.appendChild(contextName);
	contextEdit.appendChild(contextInput);
	contextMain.appendChild(contextEdit);
	contextHeader.appendChild(plus);
	contextHeader.appendChild(minus);
	contextHeader.appendChild(left);
	contextHeader.appendChild(right);
	contextHeader.appendChild(rename);
	contextHeader.appendChild(link);
	contextHeader.appendChild(remove);
	context.appendChild(contextMain);
	context.appendChild(contextHeader);
	context.appendChild(contextHelp);
	container.appendChild(context);
}

//-----------------------------------------------------------------

function makeLine(id1, id2, addToLines=true){
	let lineId = 'line-' + id1 + '-' + id2;
	let fakeId = 'fake-' + lineId;
	
	let svg = document.getElementById('svg');

	let line = document.createElementNS(svgns, 'line');
	let fakeLine = document.createElementNS(svgns, 'line');
	line.id = lineId;
	fakeLine.id = fakeId;
	
	if (addToLines){
		config.lines.push(lineId);
		saveConfig();
		setLinkIcons();
	}

	line.setAttribute('stroke-width', '3px');
	line.setAttribute('stroke', '#000000');
	line.setAttribute('stroke-dasharray', '4');
	fakeLine.setAttribute('stroke-width', '10px');
	fakeLine.setAttribute('stroke', '#ffffff');
	
	moveLine(line, id1, id2); 
	moveLine(fakeLine, id1, id2); 

	line.addEventListener('click', showMenu);
	fakeLine.addEventListener('click', showMenu);
	
	svg.appendChild(fakeLine);
	svg.appendChild(line);

}

//-----------------------------------------------------------------

function moveLine(line, id1, id2){
	let div1 = document.getElementById('context-' + id1);
	let div2 = document.getElementById('context-' + id2);

	let x1 = div1.offsetLeft + div1.offsetWidth/2.0;
	let y1 = div1.offsetTop + div1.offsetHeight/2.0;
	let x2 = div2.offsetLeft + div2.offsetWidth/2.0;
	let y2 = div2.offsetTop + div2.offsetHeight/2.0;

	line.setAttribute('x1', x1);
	line.setAttribute('y1', y1);
	line.setAttribute('x2', x2);
	line.setAttribute('y2', y2);
}

//-----------------------------------------------------------------

function moveLines(){
	for (let lineId of config.lines){
		let bits = lineId.split('-');
		let id1 = bits[1];
		let id2 = bits[2];
		let line = document.getElementById(lineId);
		let fakeLine = document.getElementById('fake-' + lineId);
		moveLine(line, id1, id2); 
		moveLine(fakeLine, id1, id2); 
	}
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
	
	moveLines();
		
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

function onKeyUp(event){
	if (event.keyCode !== 13 && event.keyCode != 27) return;
	
	let id = event.currentTarget.id
	id = id.replace('context-input-', '');

	let input = document.getElementById('context-input-' + id);	
	let view = document.getElementById('context-name-' + id);
	let edit = document.getElementById('context-edit-' + id);
	let help = document.getElementById('context-help-' + id);
	
	// If Escape key (13) - do nothing except quit
	
	// Enter/Return key
	if (event.keyCode === 13){
		view.innerText = input.value;
		config.state[id].name = input.value;
		saveConfig();
	}
	
	view.style.display = 'block';
	edit.style.display = 'none';
	help.style.display = 'none';	
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
	if (storedVersion < 1.1){
		config.lines = [];
	}
	
	if (config.version != version){
		config.version = version;
		saveConfig();
	}
}

//-----------------------------------------------------------------

function renameContext(id){
	document.getElementById('context-name-' + id).style.display = 'none';
	document.getElementById('context-edit-' + id).style.display = 'block';
	document.getElementById('context-input-' + id).focus();	
	
	let help = document.getElementById('context-help-' + id);
	help.innerText = renameHelp;
	help.style.display = 'block';	
}

//-----------------------------------------------------------------

function removeContext(id){
	let result = confirm('Are you sure you want to remove this context?');
	if (!result) return;
	
	let context = document.getElementById('context-' + id);
	context.remove();
	
	let index = config.order.indexOf(id);
	if (index > -1) config.order.splice(index, 1);
	
	setIcons();
	saveConfig();
	
	// Remove any lines attached to this
	
	let removals = [];
	for (let lineId of config.lines){
		let bits = lineId.split('-');
		let id1 = bits[1];
		let id2 = bits[2];
		if (id1 == id || id2 == id) removals.push(lineId);
	}
	
	for (let lineId of removals){
		removeLine(lineId);
	}
	
	moveLines();
}

//-----------------------------------------------------------------

function removeLine(lineId){
	let line = document.getElementById(lineId);
	let fakeLine = document.getElementById('fake-' + lineId);
	
	line.remove();
	fakeLine.remove();
	
	let index = config.lines.indexOf(lineId);
	if (index > -1) config.lines.splice(index, 1);
	
	saveConfig();
	setLinkIcons();
	
	let div = document.getElementById('remove-line');
	if (div) div.remove();
}

//-----------------------------------------------------------------

function reset(){
	let result = confirm('Are you sure you want to reset? This will remove all your customisations including lines and additional contexts.');
	if (!result) return;
	
	localStorage.removeItem('context-weighting');
	let container = document.getElementById('container');
	container.innerHTML = '';
	initialise();
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

function setLinkIcons(){

	// Sets the link icon in the context header
	
	for (let id of config.order){
		let link = document.getElementById('context-link-' + id);
		let help = document.getElementById('context-help-' + id);
		
		help.style.display = 'none';
		link.classList.remove('link-disabled');
		link.classList.remove('link-start');
		link.classList.remove('link-free');
		
		// Count how many links this has
		
		let num = 0;
		for (let lineId of config.lines){
			let bits = lineId.split('-');
			let id1 = bits[1];
			let id2 = bits[2];
			if (id1 == id || id2 == id) num++;
		}
		
		// Disable if there are links to all the others
		
		if (num == (config.order.length - 1))			link.classList.add('link-disabled');
	}
}

//-----------------------------------------------------------------

function showMenu(event){
	let lineId = event.currentTarget.id
	lineId = lineId.replace('fake-', '');
	
	let div = document.createElement('div');
	div.id = 'remove-line';
	div.style.display = 'block';
	div.innerText = 'Remove';
	div.classList.add('button');
	div.addEventListener('click', function(){removeLine(lineId);});

	document.body.appendChild(div);
	
	let x = event.pageX + 5;
	let y = event.pageY - 30;
	div.style.left = x + 'px';
	div.style.top = y + 'px';
	
	setTimeout(function(){
		div.remove();
		}, 3000);
}

//-----------------------------------------------------------------
