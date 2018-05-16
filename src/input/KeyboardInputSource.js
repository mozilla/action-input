import InputSource from "./InputSource.js";

/**
 *  KeyboardInputSource watches keyup and keydown events and generates boolean values for listeners.
 */
export default class KeyboardInputSource extends InputSource {
  constructor(targetElement = document) {
    super();

    /** @type {Set<number>} */
    this._activeKeyCodes = new Set();

    targetElement.addEventListener("keydown", ev => {
      if (this._activeKeyCodes.has(ev.keyCode)) return;
      this._activeKeyCodes.add(ev.keyCode);
      this.notifyListeners(`key/${ev.keyCode}`, true, {});
    });
    targetElement.addEventListener("keyup", ev => {
      if (this._activeKeyCodes.has(ev.keyCode) === false) return;
      this._activeKeyCodes.delete(ev.keyCode);
      this.notifyListeners(`key/${ev.keyCode}`, false, {});
    });
  }

  /**
  @param partialPath {string} the relative semantic path for an input
  @return the value of the the input, or null if the path does not exist
  */
  queryInputPath(partialPath) {
    if (partialPath.startsWith("/key/") === false) return null;
    let keycode = Number.parseInt(partialPath.substring(5), 10);
    if (Number.isNaN(keycode)) return null;
    if (this._activeKeyCodes.has(keycode) === false) return false;
    return true;
  }
}
