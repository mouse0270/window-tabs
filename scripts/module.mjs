// GET REQUIRED LIBRARIES

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
}

// DEFINE MODULE CLASS
export default class CORE {
	// DEFINE MODULE DATA
	static #configTypes = [SettingsConfig, KeybindingsConfig, ModuleManagement, WorldConfig, ToursManagement, SupportDetails];
	static #excludeTypes = [FolderConfig, PlaylistConfig]
	static #customGrouping = new Map();

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
			grouping: this.#customGrouping,
		};
		game.modules.get(MODULE.ID).api = game.modules.get(MODULE.ID).API;
	}

	static init = () => {
		this.installAPI();
	}

	static getMinSize = (windowTabApp, sheetApp) => {
		// Get Sheet and WindowTab Styles
		const sheetStyles = window.getComputedStyle(sheetApp.element[0]);
		const windowTabStyles = window.getComputedStyle(windowTabApp.element[0]);
		const windowTabHeaderHeight = parseInt(windowTabApp.element[0].querySelector('.window-header').offsetHeight) ?? 0;

		// Get Sheet Sizes
		const sheetSizes  = {
			width: parseInt(sheetStyles.getPropertyValue('min-width')) ?? 0,
			height: parseInt(sheetStyles.getPropertyValue('min-height')) ?? 0,
		}
		// Get Window Sizes
		const windowTabSizes  = {
			width: parseInt(windowTabStyles.getPropertyValue('min-width')) ?? 0,
			height: parseInt(windowTabStyles.getPropertyValue('min-height')) ?? 0,
		}

		// If windows is larger than current min size, set new min size
		if (sheetSizes.width > windowTabSizes.width) windowTabApp.element[0].style.minWidth = sheetSizes.width + 'px';
		if (sheetSizes.height > windowTabSizes.height) windowTabApp.element[0].style.minHeight = (sheetSizes.height + windowTabHeaderHeight) + 'px';
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
			btn.dataset.tooltip = btn.innerText.trim();
		});
	}

	static createHeaderToggleTab = (windowTabApp, sheetApp) => {
		// Create Header Toggle Tab
		const button = mergeObject(document.createElement('a'), {
			innerHTML: `${sheetApp.title} <a class="close"><i class="fas fa-times"></i></a>`,
			onclick: (event) =>  {
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
		CORE.getMinSize(windowTabApp, sheetApp);
	}

	static handleCustomGroups = async (sheetApp) => {
		let collectionName = null;

		// Loop through custom groups functions and run them
		for (let [moduleId, func] of game.modules.get(MODULE.ID).API.grouping) {
			let result = await func(sheetApp);
			if (result) collectionName = result;
		}

		return collectionName;
	}

	static getCollectionName = async (sheetApp) => {
		// Check if element exists
		if (!(sheetApp?.element?.[0] ?? false)) return;

		// If FolderConfig, exclude
		const excludeList = game.modules.get(MODULE.ID).API.excludeType.get();
		if (typeof sheetApp === 'object' && excludeList.some(cls => sheetApp instanceof cls)) return;

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
		if (sheetApp?.token && !sheetApp?.token?.actorLink && sheetApp?.token?.parentCollection) collectionName = `token-${sheetApp?.token?.parentCollection}`;

		// Return Collection Name		
		return collectionName;
	}

	static renderSheet = async (sheetApp, [elem], data) => {
		// Get Collection Name
		let collectionName = await CORE.getCollectionName(sheetApp);
		if (!collectionName) return;
		MODULE.debug(`Render Sheet`, sheetApp, collectionName);

		// Get Window Tab App based on Collection Name
		let windowTab = Object.entries(ui.windows).find(w => w[1].id === `window-tabs-${collectionName}`)?.[1] ?? null;

		// Check if Sheet is Already Grouped
		if (windowTab && windowTab.element[0].querySelector(`[data-appid="${sheetApp.appId}"]`)) {
			// Get Tab
			let elemTab = document.querySelector(`.window-tabs-app a[data-appid="${sheetApp.appId}"]`);

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

	static closeSheet = async (sheetApp, [elem]) => {
		// Check if elem is in a Window Tab
		let windowTab = elem?.closest('.window-tabs-app') ?? null;
		if (!windowTab) return;

		// Check if there are any active windows
		if (windowTab.querySelectorAll('.windows > div').length == 1) ui.windows[windowTab.dataset.appid]?.close();

		// Check if Window Tab has Active Tab
		let activeTab = windowTab.querySelector('.window-tabs--tab.active');
		if (activeTab) return;

		// Select Tab to the left of the closed tab
		let prevTab = elem.previousElementSibling ?? elem.nextElementSibling;

		// Check if prevTab exists
		if (!prevTab) return; 

		let appId = prevTab.dataset.appid;

		// Click previous Tab
		if (windowTab.querySelector(`[data-appid="${appId}"]`)) windowTab.querySelector(`[data-appid="${appId}"]`).click();
	}
}