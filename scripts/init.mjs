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
Hooks.once('ready', async () => { });

//Hooks.on('renderApplication', CORE.renderSheet);
Hooks.on('renderApplication', CORE.renderSheet);
Hooks.on('renderActorSheet', CORE.renderSheet);
Hooks.on('renderItemSheet', CORE.renderSheet);

Hooks.on('closeApplication', CORE.closeSheet);
Hooks.on('closeActorSheet', CORE.closeSheet);
Hooks.on('closeItemSheet', CORE.closeSheet);