/**
 *	Device represents a piece of input hardware, like a keyboard or a Vive controller.
 *
 *	Note that Devices do not talk to the hardware. {@link InputSource}s do that.
 */
export default class Device {
	/**
	 *	@param {string} name - the human readable name for this device
	 */
	constructor(name) {
		this._name = name;
	}

	/**
	 *	@return {string} the human readable name for this device
	 */
	get name() {
		return this._name;
	}
}
