import InputSource from "./InputSource.js";

/**
 *  TouchInputSource watches browser TouchEvents and tracks state
 */
export default class TouchInputSource extends InputSource {
  constructor(targetElement = document) {
    super();
    this._handleTouchEvent = this._handleTouchEvent.bind(this);

    this._touches = null;
    this._target = null;

    targetElement.addEventListener("touchstart", this._handleTouchEvent);
    targetElement.addEventListener("touchend", this._handleTouchEvent);
    targetElement.addEventListener("touchcancel", this._handleTouchEvent);
    targetElement.addEventListener("touchmove", this._handleTouchEvent);
  }

  /** @return {string} a human readable name */
  get name(){ return 'TouchInputSource' }

  /**
  @todo do something nicer than just returning Touch objects

  @param partialPath {string} the relative semantic path for an input
  @return the value of the the input, or null if the path does not exist
  */
  queryInputPath(partialPath, result=null) {
    if(result === null) result = [false, null];

    if (partialPath.startsWith("/touches/")) {
      const index = Number.parseInt(partialPath.substring(8));
      if (Number.isNaN(index)) return result;
      result[1] = this.item(index);
      result[0] = result[1] !== null
      return result
    }

    if (partialPath.startsWith("/normalized-position/")) {
      const index = Number.parseInt(partialPath.substring(21));
      if (Number.isNaN(index)) return result;
      result[1] = this.normalizedPosition(index);
      result[0] = result[1] !== null
      return result
    }

    switch (partialPath) {
      case "/count":
        result[1] = this._touches === null ? 0 : this._touches.length;
        result[0] = result[1] > 0;
        return result;
      case "/target":
        result[1] = this._target;
        result[0] = result[1] !== null;
        return result;
      case "/touches":
        result[1] = this.touches;
        result[0] = result[1].length > 0
      default:
        return result;
    }
  }

  get touches() {
    if (this._touches === null) return [];
    let result = [];
    for (let i = 0; i < this._touches.length; i++) {
      result[i] = this._touches.item(i);
    }
    return result;
  }

  normalizedPosition(index) {
    const touch = this.item(index);
    if (touch === null) return null;
    return [
      touch.clientX / document.documentElement.offsetWidth * 2 - 1,
      -(touch.clientY / document.documentElement.offsetHeight) * 2 + 1
    ];
  }

  item(index) {
    if (this._touches === null || this._touches.length < index - 1) return null;
    return this._touches.item(index);
  }

  _handleTouchEvent(event) {
    this._touches = event.touches;
    this._target = event.target;
  }
}
