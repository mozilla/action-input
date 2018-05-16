import ActionMap from "../../src/action/ActionMap.js";
import ActionSet from "../../src/action/ActionSet.js";
import ActionManager from "../../src/action/ActionManager.js";

import AddValueFilter from "./AddValueFilter.js";
import RandomInputSource from "./RandomInputSource.js";

/**
 * This demonstrates how to set up a completely custom ActionManager, using none of the default input sources, maps, or filters.
 */
export default function initInput() {
  // Create an action manager without defaults
  let actionManager = new ActionManager(false);

  // Add a custom input source that emits actions on random intervals
  actionManager.addInputSource(
    "random", // will be mapped to /input/random/0/
    new RandomInputSource([
      { path: "moo", parameters: { goo: "doo" } }, // Will generate /input/random/0/moo inputs
      { path: "nums", parameters: { value: 22 } } // Will generate /input/random/0/nums inputs
    ])
  );

  // Add a custom filter that adds value based on filter parameters in the JSON binding
  actionManager.addFilter("add-value", new AddValueFilter());

  // Add and switch to a custom action set
  actionManager.addActionSet(
    "custom",
    new ActionSet(new ActionMap([...actionManager.filters], "./custom.json"), false)
  );
  actionManager.switchToActionSet("custom");

  // Listen for the loo action triggered by /input/random/0/moo and mapped in playing-flat.json to /action/loo
  actionManager.addActionListener("/action/loo", (actionPath, active, actionParameters, inputSource) => {
    console.log("received loo", actionPath, active, actionParameters);
  });

  // Listen for the add action triggered by /input/random/0/nums and filtered by /filter/add-value, mapped in playing-flat.json
  actionManager.addActionListener("/action/add", (actionPath, active, actionParameters, inputSource) => {
    console.log("received add", actionPath, active, actionParameters);
  });

  // Query for a specific input path
  console.log("Value at /input/random/0/moo", actionManager.queryInputPath("/input/random/0/moo"));
  console.log("Value at /input/random/0/nums", actionManager.queryInputPath("/input/random/0/nums"));

  console.log("Waiting for actions. (give it a few seconds)");
}
