# Version 1.1.0 - Dragging me Through the Mud and Back Again...
- Added setting to define minimum width of tabs. You can use this so that you can have more tabs visible and are okay with them being smaller, or you can set it to the max to keep bigger tabs.
  - The default has been set to 100px, 60px at their smallest and the max is 210px
- Added the ability to drag tabs around in the header bar.
- Added the ability to drag tabs between windows.
  - Holding `ctrl` when dropping the tab on a new window will tell the window to always open up in this group. This setting is local to the client and world.
  - If you are a Game Master you can hold `ctrl + alt` when dropping the tab onto a new window, this will tell the world that these windows should be opened in this group for everyone.

> **NOTE** A players grouped preferences will always override a world grouped preference. If a player has a preference set for a window to always open in a group, it will always open in that group for them. If a player does not have a preference set, then the world preference will be used.

# Version 1.0.2 - I don't even play Pathfinder?!?!?
- Fixed some small theme issues to make the UI feel more like PF2e Dorako UI when using that UI Module
- Added overflow options to tabs, to fix issues with scrollbars. May cause issues with themes or windows that place content outside of the window. Please let me know of any issues you fine.

# Version 1.0.1 - Do you even exist if your empty inside?
- Added the ability to filter out grouping via a custom function if you set the custom grouping return to an empty string like `""`
- If system is **pf2e** and the window app is **pf2e-effects-panel** will be excluded from grouping.

### Example of Excluding Grouping Using Empty String
```javascript
Hooks.once('setup', () => {
	if (game.system.id === 'pf2e') {
		game.modules.get('window-tabs').api.register(`window-tabs.pf2e`, (sheetApp) => {
			if (sheetApp?.id === 'pf2e-effects-panel') return '';
		});
	}
})
```

# Version 1.0.0 - Everything is Better Together
Window Tabs Keeps your windows in Foundry VTT grouped and organized. Easily Grouping open windows with a tab experience.

### Key Features
- Adds Tabs to nearly any window in Foundry VTT. Making it simple to organize open windows by adding tabs to the frame of the window app.
- Automatic Grouping keeps all of your windows of the same type together. For example, all of your actors will be grouped together, all of your items will be grouped together, etc.
- Maximize, Minimize and Dock you Windows. Easily maximize your windows to take up the entire screen, minimize and dock them above hotbar.