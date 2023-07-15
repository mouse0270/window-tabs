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