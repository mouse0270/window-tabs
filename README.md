<a name="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Forge][forge-installs]][forge-url]
[![Downloads][latest-download]][latest-download-url]
[![GithubStars][github-starts]][github-url]
[![Patreon][patreon]][patreon-url]
[![Kofi][ko-fi]][ko-fi-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/mouse0270/window-tabs">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Window Tabs</h3>

  <p align="center">Your Windows Grouped and Organized</p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
	<ol>
		<li><a href="#about-the-Module">About the Module</a></li>
		<li><a href="#supported-Modules--Systems">Supported Modules / Systems</a></li>
		<li><a href="#license">License</a></li>
		<li><a href="#acknowledgments">Acknowledgments</a></li>
	</ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Module
[![Product Name Screen Shot][product-screenshot]](https://example.com)

Window Tabs is a powerful module designed to enhance the user experience of Foundry VTT by providing a convenient way to group and organize windows into tabs. With this module, users can easily manage the clutter on their Foundry VTT interface and improve their workflow.

### Key Features
- Your Windows in Tabs... Yeah, thats pretty much the whole thing.
- Allow users to maximize and minimize windows quickly and easily.
- Setting to allow you to dock minimize windows above the hotbar.


<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- SUPPORTED MODULES/SYSTEMS -->
## Supported Modules / Systems
Should work with most modules and systems. However, systems or modules with heavy theming may cause graphical issues. If so just let me know and I will try to fix it.

## Get Rekt
- [ ] [Window Controls](https://foundryvtt.com/packages/window-controls) Does not work with this module. I tried to add support, but given how super janky way I handle windows, it just didn't really work out. Sorry.
- [ ] [Taskbar](https://theripper93.com/module/foundry-taskbar) Does not work with this module. I tried to add support, but once again, I am handling the windows in a super janky way, so it didnt work out. Sorry.


<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- API -->
## API 
Window Tabs comes with an API to use to help you integrate with it.

### Registering a Custom Grouping Function
You can use `game.modules.get('window-tabs').api.register(MODULE_ID, FUNCTION)` to register a custom function that will be called to determine a windows grouping. For example:
```js
game.modules.get('window-tabs').api.register('kasper', (sheetApp) => {
    // If Sheet ID is kasper-manager, group kasper wiht config
    return (sheetApp?.id == 'kasper-manager' ? 'config' : null);
});
```
This will check to see if the `id` of the window being opened is `kasper-manager`. If it is, it will group it with the `config` tab. If not, it will not use any custom grouping.

It is recommened that you use your Modules ID as the first parameter, this will help avoiding conflicts with other modules. If you need to register multiple functions, its recommend you use Module ID + Function Name, for example `kasper.myFunction`.

### Unregistering a Custom Grouping Function
You can use `game.modules.get('window-tabs').api.unregister(MODULE_ID)` to unregister a custom function. For example:
```js
game.modules.get('window-tabs').api.unregister('kasper');
```
This will unregister the custom grouping function registered above.


<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License
The image used for the logo can be found here <a href="https://www.flaticon.com/free-icon/tabs_3815466" title="tabs icons">Tabs icons created by Smashicons - Flaticon</a>

Distributed under the MIT License. See [LICENSE]([license-url]) for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[license-url]: https://github.com/mouse0270/window-tabs/blob/master/LICENSE

[forge-installs]: https://img.shields.io/badge/dynamic/json?&colorB=90A959&label=Forge%20Installs&query=package.installs&suffix=%25&style=for-the-badge&url=https://forge-vtt.com/api/bazaar/package/window-tabs
[forge-url]: https://forge-vtt.com/bazaar/package/window-tabs

[latest-download]: https://img.shields.io/github/downloads/mouse0270/window-tabs/latest/module.zip?color=5D4A66&label=DOWNLOADS&style=for-the-badge
[latest-download-url]: https://github.com/mouse0270/window-tabs/releases/latest

[github-starts]: https://img.shields.io/github/stars/mouse0270/window-tabs?logo=AddThis&logoColor=white&style=for-the-badge
[github-url]: https://github.com/mouse0270/window-tabs

[patreon]: https://img.shields.io/badge/-Patreon-FF424D?style=for-the-badge&logo=Patreon&logoColor=white
[patreon-url]: https://www.patreon.com/mouse0270

[ko-fi]: https://img.shields.io/badge/-ko%20fi-FF5E5B?style=for-the-badge&logo=Ko-fi&logoColor=white
[ko-fi-url]: https://ko-fi.com/mouse0270