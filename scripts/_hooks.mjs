// GET MODULE FUNCTIONS
import { MODULE } from './_module.mjs';

/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
// socketlib HOOKS -> socketlib.ready
/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
Hooks.once('socketlib.ready', () => {
	MODULE.debug('SOCKETLIB Ready - SOCKET'); // WONT REGISTER CAUSE CALL HAPPENS WAY TO EARLY
	if (game.modules.get(MODULE.ID)?.socket ?? false) CORE.registerSocketLib();
});

/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
// 🧙 DEVELOPER MODE HOOKS -> devModeReady
/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
	console.log('DEV MODE READY');
    registerPackageDebugFlag(MODULE.ID, 'level', {
		choiceLabelOverrides: { 0: 'NONE', 1: 'ERROR', 2: 'WARN', 3: 'DEBUG', 4: 'INFO', 5: 'ALL' }
	});
});

/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
// System/Module Compatibility
/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
Hooks.once('setup', () => {
	// Add Support for Item Piles Module
	if (game.modules.get('item-piles')?.active ?? false) {
		game.modules.get('window-tabs').api.register(`${MODULE.ID}.item-piles`, (sheetApp) => {
			return (sheetApp?.options.classes.includes('item-piles-app') ? 'item-piles' : false);
		});
	}

	// TODO: Add Support for Simple Calendar Module
	// ? Simple Calendars slideout panel and context menu are not compatible with Window Tabs
	if ((game.modules.get('foundryvtt-simple-calendar')?.active ?? false) && false) {
		game.modules.get('window-tabs').api.register(`${MODULE.ID}.foundryvtt-simple-calendar`, (sheetApp) => {
			return (sheetApp?.options.classes.includes('simple-calendar') ? 'simple-calendar' : false);
		});
	}
});