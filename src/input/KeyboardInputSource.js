import Keyboard from "../hardware/Keyboard.js";
import InputEvent from "../action/InputEvent.js";
import InputSource from "../action/InputSource.js";

const keyboardEventNames = ["keydown", "keyup"];

/**
 *	KeyboardInputSource watches keyup and keydown events and generates {@link InputEvent}s.
 *
 */
export default class KeyboardInputSource extends InputSource {
	constructor() {
		super();
		this._eventMap = new Map(); // eventName => InputEvent
		this._keyboard = new Keyboard();

		for (let keyboardEventName of keyboardEventNames) {
			this._eventMap.set(keyboardEventName, new InputEvent(keyboardEventName, this._keyboard));
			document.addEventListener(keyboardEventName, keyboardEvent => {
				this.handleKeyboardEvent(keyboardEvent);
			});
		}
	}

	handleKeyboardEvent(keyboardEvent) {
		this.trigger(
			"input-event",
			this._eventMap.get(keyboardEvent.type),
			keyboardEvent.type,
			keyboardEvent.keyCode,
			keyboardEvent.altKey,
			keyboardEvent.ctrlKey,
			keyboardEvent.shiftKey,
			keyboardEvent.metaKey
		);
	}
}
