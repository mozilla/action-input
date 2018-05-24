import InputSource from "./InputSource.js";

/**
 *  KeyboardInputSource watches keyup and keydown events and tracks key up/down state
 */
export default class KeyboardInputSource extends InputSource {
  constructor(targetElement = document) {
    super();

    /** @type {Set<number>} */
    this._activeKeyCodes = new Set();

    targetElement.addEventListener("keydown", ev => {
      if (this._activeKeyCodes.has(ev.keyCode)) return;
      this._activeKeyCodes.add(ev.keyCode);
    });
    targetElement.addEventListener("keyup", ev => {
      if (this._activeKeyCodes.has(ev.keyCode) === false) return;
      this._activeKeyCodes.delete(ev.keyCode);
    });
  }

  /**
  @param partialPath {string} the relative semantic path for an input
  @return the value of the the input, or null if the path does not exist
  */
  queryInputPath(partialPath) {
    if (partialPath.startsWith("/0/key/") === false) return null;
    let keycode = Number.parseInt(partialPath.substring(7), 10);
    if (Number.isNaN(keycode)) return null;
    return this._activeKeyCodes.has(keycode);
  }
}
