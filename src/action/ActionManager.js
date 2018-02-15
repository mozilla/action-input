import Type from "./Type.js";
import Action from "./Action.js";
import Filter from "./Filter.js";
import ActionMap from "./ActionMap.js";
import InputEvent from "./InputEvent.js";
import InputSource from "./InputSource.js";
import ActionEvent from "./ActionEvent.js";
import ActionMapper from "./ActionMapper.js";

import Device from "../hardware/Device.js";

import MouseInputSource from "../input/MouseInputSource.js";
import TouchInputSource from "../input/TouchInputSource.js";
import GamepadInputSource from "../input/GamepadInputSource.js";
import KeyboardInputSource from "../input/KeyboardInputSource.js";
import {
  KeyboardFlatTextInput,
  KeyboardPortalTextInput,
  KeyboardImmersiveTextInput,
  ViveControllerFlatLocomotion
} from "../input/DefaultActionMaps.js";

/**
 *	ActionManager provides input handling for web applications that work in flat, portal, and immersive modes.
 *
 */
export default class ActionManager {}
