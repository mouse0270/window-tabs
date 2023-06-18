import { createApp, reactive } from 'https://unpkg.com/petite-vue?module';

// Get Vue Template from Path
async function getVueTemplate(path, id = null) {
	// If Template is Cached, Return It
	if (_templateCache.hasOwnProperty(path)) return _templateCache[path];
	if (_templateCache.hasOwnProperty(id)) return _templateCache[id];

	const template = await fetch(path);
	if (!template.ok) throw Error(template.statusText);
	const text = await template.text();
	// Cache Template
	_templateCache[path ?? id] = {
		template: text
	};

	return _templateCache[path ?? id];
}

// Create Function to Get Vue Template
async function renderVueTemplate(path, data) {
	return await getVueTemplate(path);
}

export class VueApplication extends Application {
	constructor(options={}) { super(options); }

	static get defaultOptions() {
		// Add vue-app to classes
		return mergeObject(super.defaultOptions, { classes: ['vue-app'] });
	}

	async _renderInner(data) {
		let template = this?.template ?? null;

		// check if using file template
		if (typeof this?.template === 'string') template = await getVueTemplate(this?.template ?? null, this.id);
		
		// If template is empty, use component template, if thats empty, use empty div
		return $(template?.template ?? this?.options?.component?.template ?? '<div></div>');
	}

    get session() {
        return this.vue.session
    }

	async _activateCoreListeners(domElements) {
        super._activateCoreListeners(domElements);

		let app = this;
		let reactiveData = reactive(app?.options?.component ?? {});
		// Create Container for Vue Application
		app.vue = {
			component: null,
			session: reactiveData
		}

		app.vue.component = createApp(mergeObject({session: this.vue.session}, {
			mounted() {
				// If Height is Auto or Undefined, Update Height
				if (app?.options?.height ?? 'auto' == 'auto')  app.setPosition({height: 'auto'});

				// Call Hooks
				Hooks.callAll(`mountedVueApplication`, app, this);

				// Call Mounted Function from Component
				if (app?.options?.component?.mounted) app?.options?.component?.mounted?.call(this);
			},
			unmounted() {
				// If Height is Auto or Undefined, Update Height
				if (app?.options?.height ?? 'auto' == 'auto')  app.setPosition({height: 'auto'});

				// Call Hooks
				Hooks.callAll(`unmountedVueApplication`, app, this);

				// Call Unmounted Function from Component
				if (app?.options?.component?.unmounted) app?.options?.component?.unmounted?.call(this);
			}
		}, { inplace: false })).mount(`#${this.id} .window-content`);
	}

	async render(force = false, options = {}) {
		// If Render is Called, make sure to unmount the component
		if (this?.vue?.component ?? false) this?.vue?.component.unmount();

		// Do FVTT Render Function
		super.render(force, options);
	}
}

export class VueFormApplication extends FormApplication {
	constructor(options={}) { super(options); }

	static get defaultOptions() {
		// Add vue-app to classes
		return mergeObject(super.defaultOptions, { classes: ['vue-app'] });
	}

	async _renderInner(data) {
		let template = this?.template ?? null;

		// check if using file template
		if (typeof this?.template === 'string') template = await getVueTemplate(this?.template ?? null, this.id);
		
		// If template is empty, use component template, if thats empty, use empty div
		return $(template?.template ?? this?.options?.component?.template ?? '<div></div>');
	}

	async _activateCoreListeners(domElements) {
        super._activateCoreListeners(domElements);

		let app = this;
		// Create Container for Vue Application
		app.vue = {
			component: null,
			session: null
		}

		app.vue.component = createApp(mergeObject(app?.options?.component ?? {}, {
			updated() {
				// Call Updated Function from Component
				if (app?.options?.component?.updated) app?.options?.component?.updated?.call(this);

				// If Height is Auto or Undefined, Update Height
				if (app?.options?.height ?? 'auto' == 'auto')  app.setPosition({height: 'auto'});

				// Call Hooks
				Hooks.callAll(`updatedVueApplication`, app, this);
			},
			mounted() {
				// If Height is Auto or Undefined, Update Height
				if (app?.options?.height ?? 'auto' == 'auto')  app.setPosition({height: 'auto'});

				// Call Hooks
				Hooks.callAll(`mountedVueApplication`, app, this);

				// Call Mounted Function from Component
				if (app?.options?.component?.mounted) app?.options?.component?.mounted?.call(this);
			},
			unmounted() {
				// If Height is Auto or Undefined, Update Height
				if (app?.options?.height ?? 'auto' == 'auto')  app.setPosition({height: 'auto'});

				// Call Hooks
				Hooks.callAll(`unmountedVueApplication`, app, this);

				// Call Unmounted Function from Component
				if (app?.options?.component?.unmounted) app?.options?.component?.unmounted?.call(this);
			}
		}, { inplace: false }));
		
		// Store Vue Data into App.Vue.Session
		app.vue.session = app.vue.component.mount(`#${this.id} .window-content`);
	}

	async render(force = false, options = {}) {
		// If Render is Called, make sure to unmount the component
		if (this?.vue?.component ?? false) this?.vue?.component.unmount();

		// Do FVTT Render Function
		super.render(force, options);
	}
}