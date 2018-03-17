import ActionManager from "../../src/action/ActionManager.js";

export default function initInput() {
  // Create an ActionManager with the default ActionSets
  let actionManager = new ActionManager(true);

  // Switch to the action set that handles play situations for flat displays
  actionManager.switchToActionSet("/action-set/flat-playing");

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

  console.log("Waiting for actions");
}
