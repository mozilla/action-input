import ActionManager from "../action/ActionManager.js";
import DoubleJumpFilter from "./filters/DoubleJumpFilter.js";

function main() {
  // App specific setup of the ActionManager

  let actionManager = new ActionManager();

  // Load a custom filter
  actionManager.loadFilter(DoubleJumpFilter, "/filter/double-jump");

  // Load up the maps that bind inputs to filters and actions
  actionManager
    .loadActionMaps(
      // Maps used while the mode is flat
      "./flat-playing.map",
      "./flat-paused.map",
      "./flat-menu.map",
      // Maps used while the mode is portal
      "./portal-playing.map",
      "./portal-paused.map",
      "./portal-menu.map",
      // Maps used while the mode is immersive
      "./immersive-playing.map",
      "./immersive-paused.map",
      "./immersive-menu.map"
    )
    .then(maps => {
      console.log("Maps are loaded", maps);
    })
    .catch(err => {
      console.log("Could not load action maps", err);
    });

  /*
	While the app is running, it has to provide logic for [de]activating maps as
	the mode changes between flat, portal, and immersive and as the app changes state like from playing
	to paused to using a config menu
	*/
  actionManager.activateMapsExclusive("/map/flat-playing");
  // or
  actionManager.activateMapsExclusive("/map/portal-paused");
  // or
  actionManager.activateMapsExclusive("/map/immersive-menu");
  // etc

  // The app can subscribe to action events
  actionManager.addListener((event, ...params) => {
    console.log("Jump event", event, ...params);
  }, "/action/jump");

  // The app can subscribe to action events using semantic path wildcards
  actionManager.addListener((event, ...params) => {
    console.log("Menu action event", event, ...params);
  }, "/action/menu/*");

  // The app can poll for action state
  actionManager.isActive("/action/jump"); // returns bool

  // Or, if the app needs to poll for action-specific info:
  actionManager.get("/action/jump");
  /*
		returns
		{
			action: Action,
			active: bool,
			isDoubleJump: bool,
			other action specific params...
		}
	*/
}
