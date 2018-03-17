import InputSource from "./InputSource.js";

/**
 *	KeyboardInputSource watches keyup and keydown events and generates boolean values for listeners.
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
}
