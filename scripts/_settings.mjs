// GET MODULE CORE
import { MODULE } from './_module.mjs';

// FOUNDRY HOOKS -> SETUP
Hooks.once('setup', async () => {
	// GM Defined Groups by Holding ctrl+shift while dropping window tabs
	MODULE.setting('register', 'worldDefinedGroups', {
		type: Object,
		scope: 'world',
		default: {},
		config: false
	})

	// User Defined Groups by Holding ctrl while dropping window tabs
	MODULE.setting('register', 'clientDefinedGroups', {
		type: Object,
		scope: 'client',
		default: {},
		config: false
	})

	// Define the minimum width for a tab
	MODULE.setting('register', 'minTabWidth', {
		type: Number,
		scope: 'client',
		default: 100,
		range: {
			min: 60,
			max: 210,
			step: 1
		},
		onChange: (value) => {
			document.querySelector(':root').style.setProperty(`--${MODULE.ID}-min-tab-width`, `${value}px`);
		}
	});

	// This will minify the window header buttons to just icons if possible
	MODULE.setting('register', 'cleanHeaderButtons', {
		type: Boolean,
		scope: 'client',
		default: true,
		onChange: (value) => {
			document.querySelectorAll('.window-tabs-app').forEach((el) => el.classList.toggle('clean-header-buttons', value));
		}
	});

	// This will minify the window header buttons to just icons if possible
	MODULE.setting('register', 'dockWhenMinimized', {
		type: Boolean,
		scope: 'client',
		default: true,
		onChange: (value) => {
			document.querySelector('body').classList.toggle(`${MODULE.ID}-dock-when-minimized`, value);
		}
	});

	// Allow Maximize Window
	MODULE.setting('register', 'allowMaximize', {
		type: Boolean,
		scope: 'client',
		default: false,
		onChange: (value) => {
			document.querySelector('body').classList.toggle(`${MODULE.ID}-allow-maximize`, value);

			if (!value) {
				document.querySelectorAll('.window-tabs-app.maximized').forEach((el) => el.classList.remove('maximized'));
			}
		}
	});
	// Set Initial Class when Foundry is Ready
	document.querySelector(':root').style.setProperty(`--${MODULE.ID}-min-tab-width`, `${MODULE.setting('minTabWidth')}px`);
	document.querySelector('body').classList.toggle(`${MODULE.ID}-dock-when-minimized`, MODULE.setting('dockWhenMinimized'));
	document.querySelector('body').classList.toggle(`${MODULE.ID}-allow-maximize`, MODULE.setting('allowMaximize'));
});