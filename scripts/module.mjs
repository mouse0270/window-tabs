// GET REQUIRED LIBRARIES

// GET MODULE CORE
import { MODULE } from './_module.mjs';

// IMPORT SETTINGS -> Settings Register on Hooks.Setup
import './_settings.mjs';

// DEFINE MODULE CLASS
export default class CORE {

	static registerSocketLib = () => {}

	static installAPI = () => {}

	static init = () => {
		this.installAPI();
	}
}