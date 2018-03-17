import ActionManager from "../../src/action/ActionManager.js";

export default function initInput() {
  // Create an ActionManager with the default ActionSets
  let actionManager = new ActionManager(true);

  // Switch to the action set that handles play situations for flat displays
  actionManager.switchToActionSet("/action-set/flat-playing");

  // The app can listen for events for a single Action
  actionManager.addActionListener("/action/move", (actionPath, active, actionParameters) => {
    console.log("move event", actionPath, active, actionParameters);
    //event.action.sendHapticPulse(pulseMilliseconds, jumpActionInfo.sources);
  });

  // The app can list for events using semantic path wildcards
  actionManager.addActionListener("/action/menu/*", (event, ...params) => {
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

  console.log("Waiting for actions");
}
