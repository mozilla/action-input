import InputSource from "./InputSource.js";
import { split } from '../MemoryUtils.js';

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
    this._gamepads = navigator.getGamepads();
    window.addEventListener('gamepadconnected', () => {
      this._gamepads = navigator.getGamepads();
    })
    window.addEventListener('gamepaddisconnected', () => {
      this._gamepads = navigator.getGamepads();
    })
  }

  /** @return {string} a human readable name */
  get name(){ return 'GamepadInputSource' }

  queryInputPath(partialPath, result=null) {
    if(result === null) result = new Array(2);

    if (this._gamepads === null){
      result[0] = false
      result[1] = null
      return result
    }

    split(partialPath.substring(1), "/", _tokens);
    if (_tokens.length < 2 || _tokens.length > 4){
      result[0] = false
      result[1] = null
      return result
    }

    // Find the gamepad by index or by hand
    var gamepad = null;
    if (_tokens[0] === "left" || _tokens[0] === "right") {
      for (let gp of this._gamepads) {
        if (gp === null) continue;
        if (gp.hand === _tokens[0]) {
          gamepad = gp;
          break;
        }
      }
      if (gamepad === null){
        result[0] = false
        result[1] = null
        return result
      }
    } else {
      const index = Number.parseInt(_tokens[0], 10);
      if (Number.isNaN(index) || index >= this._gamepads.length || !this._gamepads[index]){
        result[0] = false
        result[1] = null
        return result
      }
      gamepad = this._gamepads[index];
    }

    if (_tokens.length === 2) {
      result[0] = true;
      result[1] = null;
      switch (_tokens[1]) {
        case "hand":
          result[1] = gamepad.hand || "";
          return result
        case "connected":
          result[0] = gamepad.connected === true;
          return result
        case "has-orientation":
          result[0] = !!gamepad.pose && gamepad.pose.hasOrientation === true;
          return result
        case "has-position":
          result[0] = gamepad.pose && gamepad.pose.hasPosition === true;
          return result
        case "position":
          if(gamepad.pose){
            result[1] = gamepad.pose.position || null
            result[0] = result[1] !== null
          } else {
            result[0] = false
          }
          return result
        case "orientation":
          if(gamepad.pose){
            result[1] = gamepad.pose.orientation || null
            result[0] = result[1] !== null
          } else {
            result[0] = false
          }
          return result
        case "linear-velocity":
          if(gamepad.pose){
            result[1] = gamepad.pose.linearVelocity || null
            result[0] = result[1] !== null
          } else {
            result[0] = false
          }
          return result
        case "angular-velocity":
          if(gamepad.pose){
            result[1] = gamepad.pose.angularVelocity || null
          } else {
            result[0] = false
          }
          return result
        default:
          result[0] = false;
          result[1] = null
          return result
      }
    } else if (_tokens.length === 3) {
      result[0] = true;
      result[1] = null;
      switch (_tokens[1]) {
        case "button":
          if (_tokens[2] === "count") {
            result[1] = gamepad.buttons.length;
            return result
          }
          const buttonIndex = Number.parseInt(_tokens[2]);
          if (Number.isNaN(buttonIndex) || buttonIndex >= gamepad.buttons.length) {
            result[0] = false
            return result
          }
          result[0] = gamepad.buttons[buttonIndex].value !== 0;
          result[1] = gamepad.buttons[buttonIndex].value;
          return result
        case "axis":
          if (_tokens[2] === "count") {
            result[1] = gamepad.axes.length;
            return result;
          }
          const axisIndex = Number.parseInt(_tokens[2]);
          if (Number.isNaN(axisIndex) || axisIndex >= gamepad.axes.length) {
            result[0] = false
            return result
          }
          result[0] = gamepad.axes[axisIndex] !== 0;
          result[1] = gamepad.axes[axisIndex];
          return result;
        default:
          result[0] = false
          return result;
      }
    }

    if (_tokens[1] !== "button") {
      result[0] = false;
      result[1] = null;
      return result
    }

    // Now token.length is assumed to === 4 with _tokens[2] being a sub-index for buttons

    result[0] = false;
    result[1] = null;

    const buttonIndex = Number.parseInt(_tokens[2], 10);
    if (Number.isNaN(buttonIndex) || buttonIndex >= gamepad.buttons.length){
      return result;
    }
    switch (_tokens[3]) {
      case "pressed":
        result[0] = gamepad.buttons[buttonIndex].pressed === true
        return result;
      case "touched":
        result[0] = gamepad.buttons[buttonIndex].touched === true
        return result;
      case "value":
        result[0] = gamepad.buttons[buttonIndex].value !== 0
        result[1] = gamepad.buttons[buttonIndex].value
        return result;
      default:
        return result;
    }
  }

  poll() {
    this._gamepads = navigator.getGamepads();
  }
}

const _tokens = []
