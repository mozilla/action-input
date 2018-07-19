import ActionMap from "../../src/action/ActionMap.js";
import ActionManager from "../../src/action/ActionManager.js";

import Filter from "../../src/filter/Filter.js";
import ReverseActiveFilter from "../../src/filter/ReverseActiveFilter.js";

import Device from "../../src/hardware/Device.js";
import Gamepad from "../../src/hardware/Gamepad.js";
import Keyboard from "../../src/hardware/Keyboard.js";

import InputSource from "../../src/input/InputSource.js";
import MouseInputSource from "../../src/input/MouseInputSource.js";
import GamepadInputSource from "../../src/input/GamepadInputSource.js";
import KeyboardInputSource from "../../src/input/KeyboardInputSource.js";

export default function initInput() {
  let actionManager = new ActionManager();
  setupActionManager(actionManager);

  // Switch to the action set that handles play situations for flat displays
  actionManager.switchToActionMaps("flat-playing");

  // The app can listen for a single action
  actionManager.addActionListener("/action/move", (actionPath, active, actionParameters, inputSource) => {
    console.log("move event", actionPath, active, actionParameters, inputSource);
    if (active) inputSource.sendHapticPulse(300);
  });
  actionManager.addActionListener("/action/rotate", (actionPath, active, actionParameters, inputSource) => {
    console.log("rotate event", actionPath, active, actionParameters, inputSource);
  });

  // The app can list for events using semantic path wildcards
  actionManager.addActionListener("/action/menu/*", (actionPath, active, actionParameters, inputSource) => {
    console.log("Menu action event", event, ...params);
  });

  // The app can poll for action state
  actionManager.actionIsActive("/action/jump"); // returns bool

  // Or, if the app needs to poll for action-specific info:
  actionManager.getActionState("/action/jump");
  /*
    returns
    {
      action: Action,
      sources: [Device, ...],
      action specific params...
    }
  */

  // If you're using a requestAnimationFrame loop, call poll() at the top of that
  setInterval(() => {
    actionManager.poll();
  }, 50);
  console.log("Waiting for actions");
}

function setupActionManager(actionManager) {
  actionManager.addInputSource("gamepad", new GamepadInputSource());
  actionManager.addInputSource("keyboard", new KeyboardInputSource());
  actionManager.addInputSource("mouse", new MouseInputSource());
  actionManager.addFilter("reverse-active", new ReverseActiveFilter());

  actionManager.addActionMap(
    "flat-playing",
    new ActionMap(actionManager.filters, "/example/action-maps/flat-playing.json")
  );
}
