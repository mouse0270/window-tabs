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