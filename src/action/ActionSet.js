import ActionMap from "./ActionMap.js";

/**
 * ActionSet uses an {@link ActionMap} to map {@link InputEvent}s to {@link ActionEvent}s, which it sends to listeners.
 */
export default class ActionSet {
  /**
   * @param {@link ActionMap} actionMap
   * @param {bool} active
   */
  constructor(actionMap, active = true) {
    /** @type {@link ActionMap} */
    this._actionMap = actionMap;
    this._actionMap.addListener((actionPath, value, actionParameters, inputSource) => {
      this._notifyListeners(actionPath, value, actionParameters, inputSource);
    });

    /** @type {@link Set} of {@link ActionListener}s */
    this._actionListeners = new Set();
  }

  /**
   * @param {function} listener (actionEvent, sourceDevices, params)
   */
  addActionListener(listener) {
    this._actionListeners.add(listener);
  }

  /**
   * @param {function} listener
   */
  removeActionListener(listener) {
    return this._actionListeners.remove(listener);
  }

  _notifyListeners(...params) {
    this._actionListeners.forEach(listener => {
      listener(...params);
    });
  }

  /**
   * called by the ActionManager when it receives {@link InputEvent}s from {@link InputSource}s.
   */
  handleInput(inputPath, value, inputSource, params) {
    this._actionMap.handleInput(inputPath, value, inputSource, params);
  }
}