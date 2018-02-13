import Device from "../hardware/Device.js";

/**
 *	InputEvent represents information emitted by an {@link InputSource}
 *
 *	@todo add timestamps
 */
export default class InputEvent {
	constructor(name, sourceDevice) {
		this._name = name;
		this._sourceDevice = sourceDevice;
	}
	/**
	 *	@return {string} the name of the input event, like 'keydown'
	 */
	get name() {
		return this._name;
	}

	/**
	 *	@return {Device} the hardware that originated this event
	 */
	get sourceDevice() {
		return this._sourceDevice;
	}
}
