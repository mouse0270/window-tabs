// GET MODULE FUNCTIONS
import { MODULE } from './_module.mjs';

// GET CORE MODULE
import { default as CORE } from './module.mjs';

//  FOUNDRY HOOKS
import './_hooks.mjs';

// VUE
import { VueApplication } from './lib/fvtt-vue.js';
import { VueApplication as PetiteVueApplication } from './lib/fvtt-petite-vue.js';
import VueComponentButton from './lib/components/button.js';
// Show Examples using Ready Hook
Hooks.once('ready', (app, elems, options) => {
	// This is a test to show loading a vue template from a file
	new VueApplication({
		template: `modules/${MODULE.ID}/templates/test.vue`,
		component: {
			data() {
				return {
					title: 'Hello World',
					content: '',
					items: ['a', 'b', 'c']
				}
			},
			updated() {
				console.log('I WAS UPDATED');
			}
		}
	}).render(true);
	
	// This shows loading vue string component using a another vue.js component
	new VueApplication({
		component: {
			components: {
				VueComponentButton
			},
			data() {
				return {
					title: 'I have a button'
				}
			},
			template: `<div>{{title}}<VueComponentButton /></div>`
		}
	}).render(true);

	new PetiteVueApplication({
		template: `modules/${MODULE.ID}/templates/test2.vue`,
		component: {
			title: 'Petite Vue',
			content: '',
			items: ['a', 'b', 'c']
		}
	}).render(true);
});

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
// FOUNDRY HOOKS -> READY
/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
Hooks.once('init', async () => { CORE.init(); });
Hooks.once('ready', async () => { });