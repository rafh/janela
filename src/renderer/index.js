import { ipcRenderer } from 'electron';
import * as path from 'path';
import { format as formatUrl } from 'url';
import desktopDevImage from '../../static/desktop.jpg';

import './index.css';

const isDevelopment = process.env.NODE_ENV !== 'production';
let desktopProdImage = formatUrl({
	pathname: path.join(__static, 'desktop.jpg'),
	protocol: 'file',
	slashes: false,
});

ipcRenderer.on('image-change', function (__, imagePath) {
	document.querySelector('.container__image').setAttribute('src', imagePath);
});

window.addEventListener('load', () => {
	document.body.style.webkitAppRegion = 'drag';

	const btn = document.getElementById('search-form');
	btn.addEventListener('submit', (e) => {
		e.preventDefault();
		let keyword = e.target.elements['keyword'].value;
		ipcRenderer.send('updateImage', keyword);
	});

	const keywordInput = document.getElementById('keyword');
	keywordInput.addEventListener('input', (e) => {
		e.preventDefault();
		let keyword = e.target.value;
		ipcRenderer.send('keywordUpdate', keyword);
	});
});

const root = document.getElementById('app');
root.innerHTML = `
	<div class="container">
			<img class="container__image" src="${isDevelopment ? desktopDevImage : desktopProdImage}" draggable="false" />
		</div>
		<form action="" id="search-form" class="search-form">
			<input class="search-form__keyword" type="text" id="keyword" name="keyword" placeholder="keyword...">
			<button class="search-form__submit">Update</button>
		</form>
	`;
