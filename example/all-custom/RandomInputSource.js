import InputSource from "../../src/input/InputSource.js";

/**
 * Emits actions from inputInfo on a random time between minWait and maxWait
 *
 * @param {Object[]} inputInfo an array of { path {string}, parameters {Object } } like { path: "nums", parameters: { value: 22} }
 */
export default class RandomInputSource extends InputSource {
  constructor(inputInfo = [], minWait = 1000, maxWait = 5000) {
    super();
    this._inputInfo = inputInfo;
    this._minWait = minWait;
    this._maxWait = maxWait;

    setTimeout(() => {
      this._emitAction();
    }, this._randomWait);
  }
  get _randomWait() {
    return this._minWait + Math.random() * Math.floor(this._maxWait - this._minWait);
  }
  _emitAction() {
    setTimeout(() => {
      this._emitAction();
    }, this._randomWait);
    let inputInfo = this._inputInfo[Math.floor(Math.random() * this._inputInfo.length)];
    this.notifyListeners(inputInfo.path, true, inputInfo.parameters);
    setTimeout(() => {
      this.notifyListeners(inputInfo.path, false, inputInfo.parameters);
    }, 500);
  }
}
