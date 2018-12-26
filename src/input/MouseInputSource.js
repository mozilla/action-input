import InputSource from "./InputSource.js";

/**
 *  MouseInputSource watches browser MouseEvents and tracks state
 */
export default class MouseInputSource extends InputSource {
  constructor(targetElement = document) {
    super();
    this._updatePosition = this._updatePosition.bind(this);

    this._target = null;

    /** X, and Y normalized to [-1, 1] */
    this._normalizedX = null;
    this._normalizedY = null;

    this._clientX = null;
    this._clientY = null;
    this._offsetX = null;
    this._offsetY = null;
    this._screenX = null;
    this._screenY = null;
    this._movementX = null;
    this._movementY = null;
    this._appX = null;
    this._appY = null;

    /** {bool} true if the button at index is down */
    this._buttons = [];

    targetElement.addEventListener("mousemove", this._updatePosition);
    targetElement.addEventListener("mousedown", ev => {
      this._buttons[ev.button] = true;
      this._updatePosition(ev);
    });
    targetElement.addEventListener("mouseup", ev => {
      this._buttons[ev.button] = false;
      this._updatePosition(ev);
    });
  }

  /** @return {string} a human readable name */
  get name(){ return 'MouseInputSource' }

  /**
  @param partialPath {string} the relative semantic path for an input
  @return the value of the the input, or null if the path does not exist
  */
  queryInputPath(partialPath, result) {
    if(result === null) result = [false, null];

    if (partialPath === "/target") {
      result[0] = !!this._target;
      result[1] = this._target;
      return result
    }

    if (partialPath.startsWith("/0/") === false && partialPath.startsWith("/*/") === false) return result;

    const path = partialPath.substring(3);

    if (path.startsWith("button/")) {
      const specifier = path.substring(7);
      switch (specifier) {
        case "primary":
          result[0] = !!this._buttons[0];
          return result;
        case "secondary":
          result[0] = !!this._buttons[1];
          return result;
        case "tertiary":
          result[0] = !!this._buttons[2];
          return result;
        default:
          const index = Number.parseInt(path.substring(7), 10);
          if (Number.isNaN(index)) return result;
          result[0] = !!this._buttons[index];
          return result
      }
    }

    switch (path) {
      case "normalized-position":
        result[1] = this._normalizedX === null ? null : [this._normalizedX, this._normalizedY];
        result[0] = result[1] !== null
        return result

      case "client-position":
        result[1] = this._clientX === null ? null : [this._clientX, this._clientY];
        result[0] = result[1] !== null
        return result

      case "offset-position":
        result[1] = this._offsetX === null ? null : [this._offsetX, this._offsetY];
        result[0] = result[1] !== null
        return result

      case "screen-position":
        result[1] = this._screenX === null ? null : [this._screenX, this._screenY];
        result[0] = result[1] !== null
        return result

      case "movement-position":
        result[1] = this._movementX === null ? null : [this._movementX, this._movementY];
        result[0] = result[1] !== null
        return result

      case "app-position":
        result[1] = this._appX === null ? null : [this._appX, this._appY];
        result[0] = result[1] !== null
        return result
    }

    return result
  }

  _updatePosition(event) {
    this._target = event.target || null;
    this._normalizedX = event.clientX / document.documentElement.offsetWidth * 2 - 1;
    this._normalizedY = -(event.clientY / document.documentElement.offsetHeight) * 2 + 1;

    this._clientX = event.clientX;
    this._clientY = event.clientY;
    this._offsetX = event.offsetX;
    this._offsetY = event.offsetY;
    this._screenX = event.screenX;
    this._screenY = event.screenY;
    this._movementX = event.movementX;
    this._movementY = event.movementY;
    this._appX = event.appX;
    this._appY = event.appY;
  }
}
