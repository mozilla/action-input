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

    this._primaryButton = false;
    this._secondaryButton = false;
    this._tertiaryButton = false;

    targetElement.addEventListener("mousemove", this._updatePosition);
    targetElement.addEventListener("mousedown", ev => {
      switch (ev.button) {
        case 0:
          this._primaryButton = true;
          break;
        case 1:
          this._secondaryButton = true;
          break;
        case 2:
          this._tertiaryButton = true;
          break;
      }
      this._updatePosition(ev);
    });
    targetElement.addEventListener("mouseup", ev => {
      switch (ev.button) {
        case 0:
          this._primaryButton = false;
          break;
        case 1:
          this._secondaryButton = false;
          break;
        case 2:
          this._tertiaryButton = false;
          break;
      }
      this._updatePosition(ev);
    });
  }

  /**
  @param partialPath {string} the relative semantic path for an input
  @return the value of the the input, or null if the path does not exist
  */
  queryInputPath(partialPath) {
    if (partialPath === "/target") return this._target;

    if (partialPath.startsWith("/0/") === false && partialPath.startsWith("/*/") === false) return null;

    const path = partialPath.substring(3);
    switch (path) {
      case "normalized-position":
        return this._normalizedX === null ? null : [this._normalizedX, this._normalizedY];
      case "client-position":
        return this._clientX === null ? null : [this._clientX, this._clientY];
      case "offset-position":
        return this._offsetX === null ? null : [this._offsetX, this._offsetY];
      case "screen-position":
        return this._screenX === null ? null : [this._screenX, this._screenY];
      case "movement-position":
        return this._movementX === null ? null : [this._movementX, this._movementY];
      case "app-position":
        return this._appX === null ? null : [this._appX, this._appY];
      case "button/primary":
        return this._primaryButton;
      case "button/secondary":
        return this._secondaryButton;
      case "button/tertiary":
        return this._tertiaryButton;
    }
  }

  _updatePosition(event) {
    this._target = event.target;
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
