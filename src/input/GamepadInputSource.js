import InputSource from "./InputSource.js";

/**
 *	GamepadInputSource watches the gamepad API and tracks the state of gamepads
 *
 */
export default class GamepadInputSource extends InputSource {
  constructor() {
    super();
    this._gamepads = null;
  }

  queryInputPath(partialPath) {
    if (this._gamepads === null) return;
    console.log("gamepad partial path", partialPath);
    return null;
  }

  poll() {
    this._gamepads = navigator.getGamepads();
  }
}
