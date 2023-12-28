// GET REQUIRED LIBRARIES
import Sortable from './lib/sortable.core.esm.js';

// GET MODULE CORE
import { MODULE } from './_module.mjs';

// IMPORT SETTINGS -> Settings Register on Hooks.Setup
import './_settings.mjs';

class WindowTabs extends Application {
	constructor(options = {}) {
		super(options);
	}

	_getHeaderButtons() {
		let buttons = super._getHeaderButtons();

		// Add Maximize and Minimize Buttons
		buttons = [{
			label: 'Minimize',
			icon: 'fa-regular fa-window-minimize',
			class: 'minimize',
			onclick: (event) => {
				// Check if element has minimized class
				if (this.element[0].classList.contains('minimized')) this.maximize();
				else this.minimize();
			}
		},{
			label: 'Maximize',
			icon: 'fa-regular fa-window-maximize',
			class: 'maximize',
			onclick: (event) => {
				let elem = event.currentTarget.closest('a');
				// Toggle Maximize Class
				this.element[0].classList.toggle('maximized', !this.element[0].classList.contains('maximized'));

				// Toggle Text from Maximize to Restore
				elem.removeChild(elem.lastChild);
				elem.appendChild(document.createTextNode(this.element[0].classList.contains('maximized') ? 'Restore': 'Maximize'));
			}
		}].concat(buttons);

		return buttons;
	}

	activateListeners([html]) {
		const elemApp = html.closest('.window-app');
		elemApp.querySelector('.window-header h4.window-title').insertAdjacentHTML('afterend', `<div class="window-tabs"></div>`);

		// Add Horizontal Scroll for Tabs
		elemApp.querySelector('.window-header .window-tabs').addEventListener('wheel', event => {
			// Prevent Vertical Scroll
			event.preventDefault();

			// Update Scroll Position
			elemApp.querySelector('.window-header .window-tabs').scrollLeft += event.deltaY;
		});

		elemApp.querySelector('.window-header .window-tabs').addEventListener('pointerdown', event => event.stopPropagation());

		// Reusable Functions for Sortable Tabs
		const onSortable = {
			onDefineGroup: (event) => {
				// Get Window Content
				const toWindowApp = ui.windows[event.to.closest('.window-tabs-app').dataset.appid];
				const sheetApp = ui.windows[event.item.dataset.appid];
				let group = { [sheetApp.id]: toWindowApp.id.replace('window-tabs-', '') }

				MODULE.log('Define Group', event, toWindowApp, sheetApp);

				if (game.user.isGM && event.originalEvent.altKey) {
					// Update World Defined Groups
					MODULE.setting('worldDefinedGroups', mergeObject(MODULE.setting('worldDefinedGroups'), group, { inplace: false }));
				} else {
					// Update World Defined Groups
					MODULE.setting('clientDefinedGroups', mergeObject(MODULE.setting('clientDefinedGroups'), { [game.world.id]: group }, { inplace: false }));
				}
			},
			dragOver: (event) => {
				// If not a window tab - return
				if (!event.target.closest('.window-tabs-app')) return;

				// Only if hovering over the header of the element
				if (!event.target.closest('header.window-header')) return;
				
				// Get Active Window App and Hovered Window App
				const activeWindow = ui.activeWindow;
				const hoveredWindow = ui.windows[event.target.closest('.window-tabs-app').dataset.appid];
	
				// Window is already in Focus - return
				if (activeWindow.appId === hoveredWindow.appId) return;
				
				// Bring Window to Top
				hoveredWindow.bringToTop();
			},
			onAdd: (event) => {
				// Get Window Apps
				const fromWindowApp = event.from.closest('.window-tabs-app');
				const toWindowApp = event.to.closest('.window-tabs-app');
				const windowTab = event.item;
				const windowApp = fromWindowApp.querySelector(`.window-content .windows .window-app[data-appid="${windowTab.dataset.appid}"]`);

				// Move Window App to new Window
				toWindowApp.querySelector('.window-content .windows').appendChild(windowApp);

				// Activate new Window App
				windowTab.click();

				// If ctrl is being held, update user defined groups
				if (event.originalEvent.ctrlKey) onSortable.onDefineGroup(event);
			},
			onRemove: (event) => {
				const windowTab = event.item;
				const fromWindowApp = event.from.closest('.window-tabs-app');
				const windowTabApp = ui.windows[fromWindowApp.dataset.appid];
				const tabs = fromWindowApp.querySelectorAll('.window-tabs .window-tabs--tab');

				// If there are no more tabs - Close fromWindowApp
				if (fromWindowApp.querySelectorAll('.window-tabs .window-tabs--tab').length === 0) return (windowTabApp.close() ?? false);

				// If the tab being removed is active - Activate the next tab
				if (windowTab.classList.contains('active')) tabs[event.oldIndex == 0 ? tabs.length - 1 : event.oldIndex - 1].click();
			}
		}

		const constructorName = this.constructor.name;

		new Sortable(elemApp.querySelector('.window-header .window-tabs'), {
			group: 'shared',
			animation: 150,
			draggable: '.window-tabs--tab',
			direction: 'vertical',
			// Element dragging started
			onStart: function (event) {
				document.body.addEventListener('dragover', onSortable.dragOver);
			},
			// Element dragging ended
			onEnd: async function (event) {
				document.body.removeEventListener('dragover', onSortable.dragOver);

				// Check if elemen was dropped on a new header
				const fromWindowApp = event.from.closest('.window-tabs-app');
				const toWindowApp = event.to.closest('.window-tabs-app');
				let dropWindowApp = event.originalEvent.target.closest('.window-tabs-app');
				const currentTabs = fromWindowApp.querySelectorAll('.window-tabs--tab');

				MODULE.debug('Dropped Windop App', event, fromWindowApp, toWindowApp, dropWindowApp);

				// If Creating New Window is Disabled - Return
				if (!dropWindowApp && !MODULE.setting('allowNewWindows')) return;
				// Otherwise Create window and then continue
				else if (!dropWindowApp && MODULE.setting('allowNewWindows')) {
					// Create New Window
					let newWindowId = randomID();
					let uiWindowFrom = ui.windows[fromWindowApp.dataset.appid];
					dropWindowApp = await new WindowTabs({
						id: `window-tabs-${newWindowId}`,
						template: `modules/${MODULE.ID}/templates/window-tabs.hbs`,
						classes: ['window-tabs-app', `${MODULE.setting('cleanHeaderButtons') ? 'clean-header-buttons' : ''}`],
						resizable: true,
						height: uiWindowFrom.position.height,
						width: uiWindowFrom.position.width,
					}).render(true);

					Hooks.once(`render${constructorName}`, async(windowTabApp, [elem], data) => {
						dropWindowApp.setPosition({ 
							height: uiWindowFrom.position.height,
							top: event.originalEvent.clientY,
							left: event.originalEvent.clientX,
						});

						// Update event.to to the original target
						event.to = dropWindowApp.element[0];

						// Add event.item to event.to window-tabs
						event.to.querySelector('.window-tabs').appendChild(event.item);
		
						// Call onAdd and onRemove
						onSortable.onAdd(event);
						onSortable.onRemove(event);
					});

					return;
				}

				// If dropped on the same header - return
				if (toWindowApp?.dataset?.appid == dropWindowApp?.dataset?.appid) return;

				// Update event.to to the original target
				event.to = dropWindowApp;

				// Add event.item to event.to window-tabs
				event.to.querySelector('.window-tabs').appendChild(event.item);

				// Call onAdd and onRemove
				onSortable.onAdd(event);
				onSortable.onRemove(event);
			},
			// Element is dropped into the list from another list
			onAdd: onSortable.onAdd,
			// Element is removed from the list into another list
			onRemove: onSortable.onRemove,
		});
	}

	async close(options={}) {
		let elements = this.element[0].querySelectorAll('.window-tabs--tab');
		elements.forEach(elem => {
			ui.windows[elem.dataset.appid]?.close() ?? false;
			elem.remove();
		});
		
		super.close(options);
	}

	async minimize() {
		// Get Minimized Window Tabs
		let elements = document.querySelectorAll('.window-tabs-app.minimized');
		this.element[0].setAttribute('data-minimized', elements.length + 1);

		// Calculate Max Size
		const styles = getComputedStyle(this.element[0]);
		const playersWidth = parseInt(styles.getPropertyValue('--players-width'));
		const sidebarWidth = parseInt(styles.getPropertyValue('--sidebar-width'));
		const size = Math.min(200, ((window.innerWidth - playersWidth - sidebarWidth) / (elements.length + 1)) - 15);
		// Set Minimized Size CSS Variable
		document.documentElement.style.setProperty(`--${MODULE.ID}-minimize-size`, `${parseInt(Math.floor(size))}px`);


		// Preform Minimize
		return super.minimize();
	}

	async maximize() {
		// Remove Minimized Index
		this.element[0].removeAttribute('data-minimized');
		// Update Minimized Window Tabs
		document.querySelectorAll('.window-tabs-app[data-minimized]').forEach((el, i) => el.setAttribute('data-minimized', i + 1));		

		// Calculate Max Size
		const styles = getComputedStyle(this.element[0]);
		const playersWidth = parseInt(styles.getPropertyValue('--players-width'));
		const sidebarWidth = parseInt(styles.getPropertyValue('--sidebar-width'));
		const size = Math.min(200, ((window.innerWidth - playersWidth - sidebarWidth) / (document.querySelectorAll('.window-tabs-app[data-minimized]').length + 1)) - 15);
		// Set Minimized Size CSS Variable
		document.documentElement.style.setProperty(`--${MODULE.ID}-minimize-size`, `${parseInt(Math.floor(size))}px`);

		// Preform Maximize
		super.maximize();
	}

	_onResize(event) {
		// If user Resized window, set resized to true
		this.options.resized = true;
	}
}

// DEFINE MODULE CLASS
export default class CORE {
	// DEFINE MODULE DATA
	static #configTypes = [SettingsConfig, KeybindingsConfig, ModuleManagement, WorldConfig, ToursManagement, SupportDetails];
	static #excludeTypes = [FolderConfig, PlaylistConfig]
	static #customGrouping = new Map()

	static registerSocketLib = () => {}

	static installAPI = () => {
		game.modules.get(MODULE.ID).API = {
			configType: {
				get: () => this.#configTypes,
				add: (configType) => this.#configTypes.push(configType),
				remove: (configType) => this.#configTypes = this.#configTypes.filter(c => c !== configType),
			},
			excludeType: {
				get: () => this.#excludeTypes,
				add: (excludeType) => this.#excludeTypes.push(excludeType),
				remove: (excludeType) => this.#excludeTypes = this.#excludeTypes.filter(c => c !== excludeType),
			},
			register: (id, func, options = {}) => {
				// Check if ID is in Use
				if (this.#customGrouping.has(id)) return (ui.notifications.error(MODULE.localize('notifications.error.alreadyRegisteredID', {title: MODULE.TITLE, id})));

				// Add to Custom Grouping Function
				this.#customGrouping.set(id, func);
			},
			unregister: (id) => this.#customGrouping.delete(id),
			grouping: this.#customGrouping,
		};
		game.modules.get(MODULE.ID).api = game.modules.get(MODULE.ID).API;
	}

	static init = () => {
		this.installAPI();
	}

	static updateHeaderButtons = (windowTabApp, buttons) => {
		// Get WindowTab Buttons
		let windowTabButtons = windowTabApp._getHeaderButtons();
		MODULE.debug(`UPDATE HEADER BUTTONS:`, windowTabApp._getHeaderButtons(), buttons);
		// Remove all buttons except close
		windowTabApp.element[0].querySelectorAll('.window-header > a:not(.minimize):not(.maximize):not(.close)').forEach(btn => btn.remove());

		// Loop through sheet buttons and added them to the window tab
		buttons.filter(b => !['minimize', 'maximize', 'close'].includes(b.class)).forEach(btn => {
			let button = mergeObject(document.createElement('a'), {
				innerHTML: `<i class="${btn.icon}"></i> ${game.i18n.localize(btn.label)}`,
				onclick: btn?.onclick ?? null,
			});
			button.classList.add('header-button', btn.class);

			windowTabApp.element[0].querySelector('.window-header .window-tabs').insertAdjacentElement('afterend', button);
		});

		// Add Data-Tooltip to all Buttons
		windowTabApp.element[0].querySelectorAll('.window-header > a.header-button').forEach(btn => {
			const text = btn.innerText.trim();
			if (text.length === 0 || text === "undefined") return;
			btn.dataset.tooltip = text;
		});
	}

	static createHeaderToggleTab = (windowTabApp, sheetApp) => {
		// Create Header Toggle Tab
		const button = mergeObject(document.createElement('a'), {
			innerHTML: `${sheetApp.title} <a class="close"><i class="fas fa-times"></i></a>`,
			onclick: (event) =>  {
				// get WindowTabApp
				const windowTabApp = ui.windows[sheetApp.element[0].closest('.window-tabs-app').dataset.appid];

				if (event.target.closest('a.close') ?? false ) {
					event.target.closest('.window-tabs--tab').remove();
					sheetApp.close();

					if (windowTabApp.element[0].querySelectorAll('.window-tabs--tab').length === 0) windowTabApp.close();
					return;
				}
				windowTabApp.element[0].querySelectorAll('.window-header .window-tabs .active').forEach(e => e.classList.remove('active'));
				windowTabApp.element[0].querySelectorAll('.window-content .windows .app').forEach(e => e.style.display = 'none');
				event.target.closest('.window-tabs--tab').classList.add('active');
				sheetApp.element[0].style.display = 'flex';
				CORE.updateHeaderButtons(windowTabApp, sheetApp._getHeaderButtons());
				sheetApp.bringToTop();

				// Update Header Text
				windowTabApp.element[0].querySelector('.window-header h4.window-title').textContent = sheetApp.title;
			},
			onmouseenter: (event) => {
				const elem = event.target.closest('a.window-tabs--tab');
				const hasEllipsis =  elem.scrollWidth > elem.clientWidth;
				
				elem?.[hasEllipsis ? 'setAttribute' : 'removeAttribute']('data-tooltip', elem.textContent);
				game.tooltip?.[hasEllipsis ? 'activate' : 'deactivate'](elem);
			}
		});
		// Add Default class and Active Class
		button.classList.add('window-tabs--tab', 'active');
		button.setAttribute('data-appid', sheetApp.appId);

		// Remove Active Class from other Tabs and Add to new Tab
		windowTabApp.element[0].querySelectorAll('.window-header .window-tabs .active').forEach(e => e.classList.remove('active'));
		windowTabApp.element[0].querySelectorAll('.window-content .windows .app').forEach(e => e.style.display = 'none');
		windowTabApp.element[0].querySelector('.window-header .window-tabs').insertAdjacentElement('beforeend', button);

		// Make New Tab Visible
		sheetApp.element[0].style.display = 'flex';

		// Update Header Text
		windowTabApp.element[0].querySelector('.window-header h4.window-title').textContent = sheetApp.title;

		// If WindowTab is not visible, scroll to it
		windowTabApp.element[0].querySelector('.window-header .window-tabs').scrollLeft = button.offsetLeft - 100;
		MODULE.debug(`SCROLL TO TAB:`, button.offsetLeft, windowTabApp.element[0].querySelector('.window-header .window-tabs').scrollLeft);

		// Add Header Buttons
		CORE.updateHeaderButtons(windowTabApp, sheetApp._getHeaderButtons());
	}

	static addSheet = async (windowTabApp, sheetApp) => {
		// Add Sheet to WindowTab
		MODULE.log(`Adding Sheet to WindowTab:`, windowTabApp, sheetApp);
		windowTabApp.element[0].querySelector('.window-content .windows').insertAdjacentElement('beforeend', sheetApp.element[0]);

		// Hide Sheet
		sheetApp.element[0].style.display = 'none';

		// Create Header Toggle Tab
		CORE.createHeaderToggleTab(windowTabApp, sheetApp);

		// Update Min Size
		//CORE.getMinSize(windowTabApp, sheetApp);
		MODULE.debug(`Set Position:`, windowTabApp?.options?.resized, windowTabApp?.position?.height, sheetApp?.options?.height ?? 'auto', 'Using', windowTabApp?.options?.resize ? windowTabApp?.position?.height : sheetApp?.options?.height ?? 'auto')
		setTimeout(() => windowTabApp.setPosition({ height: windowTabApp?.options?.resized ? windowTabApp?.position?.height : sheetApp?.options?.height ?? 'auto' }), 1);
	}

	static handleCustomGroups = async (sheetApp) => {
		let collectionName = null;

		// Loop through custom groups functions and run them
		for (let [moduleId, func] of game.modules.get(MODULE.ID).API.grouping) {
			let result = await func(sheetApp);
			if (typeof result === 'string') collectionName = result;
		}

		return collectionName;
	}

	static getCollectionName = async (sheetApp) => {
		// Check if element exists
		if (!(sheetApp?.element?.[0] ?? false)) return;

		// If FolderConfig, exclude
		const excludeList = game.modules.get(MODULE.ID).API.excludeType.get();
		if (typeof sheetApp === 'object' && excludeList.some(cls => sheetApp instanceof cls)) return;

		// Check if Sheet App has User Defined Group
		const definedGroups = mergeObject(MODULE.setting('worldDefinedGroups'), MODULE.setting('clientDefinedGroups')?.[game.world.id] ?? {}, { inplace: false });
		if (definedGroups.hasOwnProperty(sheetApp.id)) return definedGroups[sheetApp.id];

		// Define Config Windows
		const isConfigMenu = game.modules.get(MODULE.ID).API.configType.get();

		// Get CollectionName
		let doc = sheetApp?.document?.parent ?? sheetApp?.document;

		// Get Collection Name
		let collectionName = doc?.collectionName ?? false;

		// Check if Collection is a Config Menu
		if (!collectionName && typeof sheetApp === 'object' && isConfigMenu.some(cls => sheetApp instanceof cls)) collectionName = 'config';

		// If Collection is inside a folder, set collection to folder name
		if (doc?.folder) collectionName = `folder-${doc?.folder?.id}`;

		// If doc element is inside Window Tab, set Collection to that element
		if (doc?.sheet?.element?.closest('.window-tabs-app').length > 0) collectionName = doc?.sheet?.element?.closest('.window-tabs-app')?.[0]?.id.replace(`${MODULE.ID}-`, '');

		// Run Custom Grouping Functions
		let customCollectionName = await CORE.handleCustomGroups(sheetApp, collectionName);

		// Set Collection Name to Custom Collection Name if it exists
		if (customCollectionName) collectionName = customCollectionName;

		// If collection is a page of a journal, set collection to journal
		if (collectionName === 'pages') collectionName = 'journal';

		// If Collection is actors, then group by actor type
		if (collectionName === 'actors' && doc?.type) collectionName = `actors-${doc.type}`;

		// Handle if Collection is a Token
		// Is sheetApp a Token, and is that Tokens actorLink False
		if (sheetApp?.token && !sheetApp?.token?.actorLink && sheetApp?.token?.parentCollection) collectionName = `token-${sheetApp?.token?.parentCollection}`;

		// Allow Custom Function to Override Collection Name if Custom Function is set to an empty string
		if (typeof customCollectionName === 'string' && customCollectionName === '') collectionName = false;

		// Check if Sheet is Already Grouped
		if (document.querySelector(`.window-tabs-app a[data-appid="${sheetApp.appId}"]`)) collectionName = document.querySelector(`.window-tabs-app a[data-appid="${sheetApp.appId}"]`).closest('.window-tabs-app').id.replace(`${MODULE.ID}-`, '');

		MODULE.log(`Collection Name:`, collectionName, sheetApp);

		// Return Collection Name		
		return collectionName;
	}

	static renderSheet = async (sheetApp, [elem], data) => {
		// Get Collection Name
		let collectionName = await CORE.getCollectionName(sheetApp);
		if (!collectionName) return;

		// Get Elements Dataset AppId
		// ? sheetApp.appId is not always the same as the rendered windows data-appid or ui.windows[appid]
		// ? appId is used to indicate the window tab for window-tabs-app
		// ! Maybe a bug in FVTT, but this is the only way to get the appid for the rendered window
		let appId = elem.closest('[data-appid]').dataset.appid;

		MODULE.debug(`Render Sheet`, sheetApp, collectionName, {
			appId: appId,
			sheetAppId: sheetApp.appId
		});

		// If Always New Window is Enabled, then create a new window
		if (MODULE.setting('alwaysNewWindow')) {
			// Check if Window has been user defined
			const definedGroups = mergeObject(MODULE.setting('worldDefinedGroups'), MODULE.setting('clientDefinedGroups')?.[game.world.id] ?? {}, { inplace: false });
			// if appId exists, get attribute ID from ui.windows.element
			if (ui.windows?.[appId]) collectionName = ui.windows[appId].element[0].id.replace(`${MODULE.ID}-`, '');
			else if (!definedGroups.hasOwnProperty(sheetApp.id)) collectionName = randomID();
		}

		// Get Window Tab App based on Collection Name
		let windowTab = Object.entries(ui.windows).find(w => w[1].id === `window-tabs-${collectionName}`)?.[1] ?? null;

		// Check if Sheet is Already Grouped
		if (windowTab && windowTab.element[0].querySelector(`[data-appid="${appId}"]`)) {

			// Get Tab
			let elemTab = document.querySelector(`.window-tabs-app a[data-appid="${appId}"]`);

			// If it couldn't find by appId, try to match if element exists in group
			if (!elemTab) elemTab = elem.element.closest(`${MOUDE.ID}-app`);


			// If Tab Doesn't Exist, Return
			if (!elemTab) return;

			// Bring to Window to Front
			windowTab.bringToTop();

			// Activate Tab
			elemTab.click();

			// If Minimized, Maximize
			if (windowTab.element[0].classList.contains('minimized')) windowTab.maximize();

			// Stop Function
			return;
		}	
	
		// Check if collection already exists
		if (windowTab) {
			MODULE.log(`Add Tab`, windowTab);
			CORE.addSheet(windowTab, sheetApp);

			// Bring to Window to Front
			windowTab.bringToTop();

			// If Minimized, Maximize
			if (windowTab.element[0].classList.contains('minimized')) windowTab.maximize();
		}else{
			let windowTabHook = Hooks.on('renderApplication', (windowTab, [html], data) => {
				if (windowTab.id == `window-tabs-${collectionName}`) {
					Hooks.off('renderApplication', windowTabHook);
					
					CORE.addSheet(windowTab, sheetApp);
				}
			});

			// Get Height of Window
			let height = sheetApp?.options?.height == 'auto' ? sheetApp?.position?.height ?? sheetApp?.options?.height ?? 500 : sheetApp?.options?.height ?? 500;
	
			new WindowTabs({
				id: `window-tabs-${collectionName}`,
				template: `modules/${MODULE.ID}/templates/window-tabs.hbs`,
				classes: ['window-tabs-app', `${MODULE.setting('cleanHeaderButtons') ? 'clean-header-buttons' : ''}`],
				resizable: true,
				height: height,
				width: sheetApp?.options?.width ?? 800, 
			}).render(true);
		}
	}

	static closeSheet = async (sheetApp, html) => {
		// Because Svelte returns an HTMLElement instead of a jQuery object or Array of Elements
		// ! html?.[0] is a workaround for getting the HTMLElement from a jQuery Object [Assuming Core Foundry Application]
		// ! ?? if workaround fails, then attempt to get HTMLElement from html [Assuming Svelte Foundry Application]
		// ! ?? otherwise return null and exist function [Get Rekt - No Idea What is Happening]
		const elem = html?.[0] ?? html ?? null;
		if (!elem) return;

		// Check if elem is in a Window Tab
		let windowTab = elem?.closest('.window-tabs-app') ?? null;
		if (!windowTab) return;

		// Check if there are any active windows
		if (windowTab.querySelectorAll('.windows > div').length == 1) ui.windows[windowTab.dataset.appid]?.close();

		// Make sure its closed
		if (windowTab.querySelector(`a.window-tabs--tab[data-appid="${sheetApp.appId}"]`)) windowTab.querySelector(`a[data-appid="${sheetApp.appId}"] .close`).click();


		// Check if Window Tab has Active Tab
		let activeTab = windowTab.querySelector('.window-tabs--tab.active');
		if (activeTab) return;

		// Select Tab to the left of the closed tab
		let prevTab = elem.previousElementSibling ?? elem.nextElementSibling;

		// Check if prevTab exists
		if (!prevTab) return; 

		let appId = prevTab.dataset.appid;
		
		// Update Min/Max Size when a Tab Closes
		const windowTabApp = ui.windows[windowTab.dataset.appid];
		const activeApp = ui.windows[appId];
		setTimeout(() => windowTabApp.setPosition({ height: windowTabApp?.options?.resized ? windowTabApp?.position?.height : activeApp?.options?.height ?? 'auto' }), 50);

		// Click previous Tab
		if (windowTab.querySelector(`[data-appid="${appId}"]`)) windowTab.querySelector(`[data-appid="${appId}"]`).click();
	}
}