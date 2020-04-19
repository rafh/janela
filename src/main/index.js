'use strict';
require('dotenv').config();

const {
	app,
	BrowserWindow,
	ipcMain,
	Tray,
	Menu,
} = require('electron');
import * as path from 'path';
import { format as formatUrl } from 'url';
import schedule from 'node-schedule';
import wallpaper from 'wallpaper';
import fs from 'fs';
import axios from 'axios';

let isOpen = false;
let term = 'space';
const endpoint = (term = 'space') =>
	`https://api.unsplash.com/photos/random?orientation=landscape&query=${term}&client_id=${process.env.API_KEY}`;
let imageURL = '';
const iconPath =  path.join(__static, 'nav-icon.png');
const appIcon =  path.join(__static, 'icon.png');
const desktopImage =  path.join(__static, 'desktop.jpg');
const isDevelopment = process.env.NODE_ENV !== 'production';

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow;

async function downloadImage(url, imagePath) {
	let writer = fs.createWriteStream(imagePath);

	const response = await axios({
		url,
		method: 'GET',
		responseType: 'stream',
	});

	response.data.pipe(writer);

	return new Promise((resolve, reject) => {
		writer.on('finish', resolve);
		writer.on('error', reject);
	});
}

async function getImage(keyword) {
	let response = await axios.get(endpoint(keyword));
	imageURL = response.data.urls.regular;
	await downloadImage(imageURL, desktopImage);
	await wallpaper.set(desktopImage);
}

function updateImage(keyword) {
	getImage(keyword).then(() => mainWindow.webContents.send('image-change', imageURL));
}

function createMainWindow() {
	const window = new BrowserWindow({
		show: !isOpen,
		width: 364,
		height: 374,
		icon: appIcon,
		title: 'Janela',
		resizable: true,
		titleBarStyle: 'hiddenInset',
		webPreferences: {
			nodeIntegration: true,
		},
	});

	if (isDevelopment) {
		window.webContents.openDevTools();
	}

	if (isDevelopment) {
		window.loadURL(
			`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
		);
	} else {
		window.loadURL(
			formatUrl({
				pathname: path.join(__dirname, 'index.html'),
				protocol: 'file',
				slashes: true,
			})
		);
	}

	window.on('closed', () => {
		mainWindow = null;
	});

	window.on('show', function () {
		isOpen = true;
	});

	window.on('hide', function () {
		isOpen = false;
	});

	window.webContents.on('devtools-opened', () => {
		window.focus();
		setImmediate(() => {
			window.focus();
		});
	});

	return window;
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (mainWindow === null) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', () => {

	let appIcon = new Tray(iconPath);

	const contextMenu = Menu.buildFromTemplate([
		{
			label: 'Update',
			type: 'separator',
			icon: iconPath,
		},
		{
			label: 'Update',
			type: 'normal',
			click: function () {
				updateImage(term);
			},
		},
		{
			label: 'Toggle Window',
			accelerator: 'Alt+Command+W',
			click: function () {
				if (isOpen) {
					mainWindow.hide();
				} else {
					mainWindow.show();
				}
			},
		},
		{
			label: 'Toggle DevTools',
			accelerator: 'Alt+Command+I',
			click: function () {
				mainWindow.show();
				mainWindow.toggleDevTools();
			},
		},
		{ label: 'Quit', accelerator: 'Command+Q', selector: 'terminate:' },
	]);

	appIcon.setContextMenu(contextMenu);
	mainWindow = createMainWindow();
});

schedule.scheduleJob('0 8 * * *', function () {
	getImage(term);
});

ipcMain.on('updateImage', (__, keyword) => updateImage(keyword));
ipcMain.on('keywordUpdate', (__, keyword) => (term = keyword));
