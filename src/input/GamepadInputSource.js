import InputSource from "./InputSource.js";

/**
 *  GamepadInputSource watches the gamepad API and tracks the state of gamepads
 *  Gamepads can be referenced by index or hand: /0|left|right/...
 *
 *  The base values of the gamepad and pose (if it's present) is available like so:
 *  "/0/hand"
 *  "/0/connected"
 *  "/0/has-orientation"
 *  "/0/has-position"
 *  "/0/position"
 *  "/0/orientation"
 *  "/0/linear-velocity"
 *  "/0/angular-velocity"
 *  "/0/angular-acceleration"
 *
 *  Buttons and axes are referenced by index
 *  "/0/button/count" The number of available buttons
 *  "/0/button/0/pressed"
 *  "/0/button/0/touched"
 *  "/0/button/0" May be binary [0|1] or a float [0, 1]
 *  "/0/axis/count" The number of available axes
 *  "/0/axis/0" Usually a float [-1, 1]
 */
export default class GamepadInputSource extends InputSource {
  constructor() {
    super();
    this._gamepads = null;
  }

  /** @return {string} a human readable name */
  get name(){ return 'GamepadInputSource' }

  queryInputPath(partialPath) {
    if (this._gamepads === null) return null;

    let tokens = partialPath.substring(1).split("/");
    if (tokens.length < 2 || tokens.length > 4) return null;

    // Find the gamepad by index or by hand
    var gamepad = null;
    if (tokens[0] === "left" || tokens[0] === "right") {
      for (let gp of this._gamepads) {
        if (gp === null) continue;
        if (gp.hand === tokens[0]) {
          gamepad = gp;
          break;
        }
      }
      if (gamepad === null) return null;
    } else {
      const index = Number.parseInt(tokens[0], 10);
      if (Number.isNaN(index)) return null;
      if (index >= this._gamepads.length) return null;
      if (!this._gamepads[index]) return null;
      gamepad = this._gamepads[index];
    }

    if (tokens.length === 2) {
      switch (tokens[1]) {
        case "hand":
          return gamepad.hand || "";
        case "connected":
          return gamepad.connected === true;
        case "has-orientation":
          return !!gamepad.pose && gamepad.pose.hasOrientation === true;
        case "has-position":
          return gamepad.pose && gamepad.pose.hasPosition === true;
        case "position":
          return (gamepad.pose && gamepad.pose.position) || null;
        case "orientation":
          return (gamepad.pose && gamepad.pose.orientation) || null;
        case "linear-velocity":
          return (gamepad.pose && gamepad.pose.linearVelocity) || null;
        case "angular-velocity":
          return (gamepad.pose && gamepad.pose.angularVelocity) || null;
        default:
          return null;
      }
    }

    if (tokens.length === 3) {
      switch (tokens[1]) {
        case "button":
          if (tokens[2] === "count") return gamepad.buttons.length;
          const buttonIndex = Number.parseInt(tokens[2]);
          if (Number.isNaN(buttonIndex) || buttonIndex >= gamepad.buttons.length) return null;
          return gamepad.buttons[buttonIndex].value;
        case "axis":
          if (tokens[2] === "count") return gamepad.axes.length;
          const axisIndex = Number.parseInt(tokens[2]);
          if (Number.isNaN(axisIndex) || axisIndex >= gamepad.axes.length) return null;
          return gamepad.axes[axisIndex];
        default:
          return null;
      }
    }

    if (tokens[1] !== "button") return null;

    // Now token.length is assumed to === 4 with tokens[2] being a sub-index for buttons

    const buttonIndex = Number.parseInt(tokens[2], 10);
    if (Number.isNaN(buttonIndex) || buttonIndex >= gamepad.buttons.length) return null;
    switch (tokens[3]) {
      case "pressed":
        return gamepad.buttons[buttonIndex].pressed === true;
      case "touched":
        return gamepad.buttons[buttonIndex].touched === true;
      case "value":
        return gamepad.buttons[buttonIndex].value || 0;
      default:
        return null;
    }
  }

  poll() {
    this._gamepads = navigator.getGamepads();
  }
}
