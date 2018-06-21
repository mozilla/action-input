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

  /**
  @param partialPath {string} the relative semantic path for an input
  @return the value of the the input, or null if the path does not exist
  */
  queryInputPath(partialPath) {
    // TODO do something nicer than just returning Touch objects
    switch (partialPath) {
      case "/count":
        return this._touches === null ? 0 : this._touches.length;
      case "/target":
        return this._target;
      case "/touches":
        return this.touches;
      case "/touches/0":
        return this.item(0);
      case "/touches/1":
        return this.item(1);
      case "/touches/2":
        return this.item(2);
      case "/touches/3":
        return this.item(3);
      case "/touches/4":
        return this.item(4);
      case "/touches/5":
        return this.item(5);
      case "/normalized-position":
        return this.normalizedPosition(0);
      default:
        return null;
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
