// GET MODULE FUNCTIONS
import { MODULE } from './_module.mjs';

// GET CORE MODULE
import { default as CORE } from './module.mjs';

//  GET STANDARD HOOKS
import './_hooks.mjs';

/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
// FOUNDRY HOOKS -> READY
/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
Hooks.once('init', async () => { CORE.init(); });
Hooks.once('ready', async () => {
	// Temporary Patch for Dice Tray and Window Tabs
	if (game.modules.get('dice-calculator')?.active) {
		// Remove Dice Tray's Event Listener
		$('html').off('drop', 'body');
		
		// Add My Replacement Event Listener
		document.body.addEventListener('drop', function (event) {
			// Define Container for DropData
			let dropData = null;

			// Attempt to Parse the event data
			try {
				dropData = JSON.parse(event.dataTransfer.getData('text/plain'));
			} catch (err) { 
				// Unable to Parse Data, Return Event
				return event;
			}

			// Check if dropData has a formula
			if (!dropData?.formula) return event

			// Create a new Roll using Formula
			new Roll(dropData.formula).roll({async: true}).then(result => result.toMessage());
		})
	}
});

//Hooks.on('renderApplication', CORE.renderSheet);
Hooks.on('renderApplication', CORE.renderSheet);
Hooks.on('renderActorSheet', CORE.renderSheet);
Hooks.on('renderItemSheet', CORE.renderSheet);

Hooks.on('closeApplication', CORE.closeSheet);
Hooks.on('closeActorSheet', CORE.closeSheet);
Hooks.on('closeItemSheet', CORE.closeSheet);