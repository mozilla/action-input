import ActionManager from "../action/ActionManager.js";
import DoubleJumpFilter from "./filters/DoubleJumpFilter.js";

/*
This is some pseudocode of the kind of app-specific setup of the ActionManager
which would happen within an app framework like React or in a scene framework like A-frame.
*/

function calledDuringSetup() {
  let actionManager = new ActionManager();

  // There are already some installed filters provided by the action-input lib
  actionManager.filters;
  /*
    returns {
      "/filter/lib/reverse-axis": ReverseAxisFilter,
      "/filter/lib/low-pass": LowPassFilter,
      ...
    }
  */

  // Let's load an app-specific filter that watches thumbpad motion and emits app-specific actions
  actionManager.loadFilter("thumb-swirl", new example.ThumbSwirlRecognizerFilter()); // now resolves at "/filter/app/thumb-swirl"

  // Load up the maps that bind inputs to filters aor actions. Also, give them action set names.
  // Perhaps this would be better as a simple actionManager.loadActionSets(<url to single JSON>) ?
  actionManager
    .loadActionSets({
      "flat-playing": "./flat-playing-map.json",
      "flat-paused": "./flat-paused-map.json",
      "flat-menu": "./flat-menu-map.json",
      "portal-playing": "./portal-playing-map.json",
      "portal-paused": "./portal-paused-map.json",
      "portal-menu": "./portal-menu-map.json",
      "immersive-playing": "./immersive-playing-map.json",
      "immersive-paused": "./immersive-paused-map.json",
      "immersive-menu": "./immersive-menu-map.json"
    })
    .then(actionSets => {
      console.log("Action sets are loaded", actionSets);
    })
    .catch(err => {
      console.log("Could not load action sets", err);
    });

  /*
  While the app is running, it has to provide logic for [de]activating action sets as
  the display mode changes between flat, portal, and immersive and as the app changes situations
  between playing to paused to using a config menu
  */
  actionManager.switchToActionSet("/action-set/flat-playing");
  // or
  actionManager.switchToActionSet("/action-set/portal-paused");
  // or
  actionManager.switchToActionSet("/action-set/immersive-menu");
  // etc

  // The app can subscribe to action events
  actionManager.addActionListener("/action/jump", (event, ...params) => {
    console.log("Jump event", event, ...params);
  });

  // The app can subscribe to action events using semantic path wildcards
  actionManager.addActionListener("/action/menu/*", (event, ...params) => {
    console.log("Menu action event", event, ...params);
  });

  // The app can poll for action state
  actionManager.isActive("/action/jump"); // returns bool

  // Or, if the app needs to poll for action-specific info:
  let jumpActionInfo = actionManager.get("/action/jump");
  /*
    returns
    {
      action: Action,
      active: bool,
      sources: [Device, ...],
      isDoubleJump: bool,
      other action specific params...
    }
  */

  // Send some haptic feedback through the hw sources of the active Action
  if (jumpActionInfo.active) {
    jumpActionInfo.action.sendHapticPulse(pulseMilliseconds, jumpActionInfo.sources);
  }
}
