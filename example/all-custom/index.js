import ActionMap from "../../src/action/ActionMap.js";
import ActionManager from "../../src/action/ActionManager.js";

import AddValueFilter from "./AddValueFilter.js";
import DummyInputSource from "./DummyInputSource.js";

/**
 * This demonstrates how to set up a completely custom ActionManager, using none of the default input sources, maps, or filters.
 */
export default function initInput() {
  // Create an action manager without defaults
  let actionManager = new ActionManager(false);

  actionManager.addInputSource(
    "dummy", // will be mapped to /input/dummy/0/
    new DummyInputSource([
      { path: "moo", parameters: { goo: "doo" } }, // Will generate /input/dummy/0/moo inputs
      { path: "nums", parameters: { value: 22 } } // Will generate /input/dummy/0/nums inputs
    ])
  );

  // Add a custom filter that adds value based on filter parameters in the JSON binding
  actionManager.addFilter("add-value", new AddValueFilter());

  // Add and switch to a custom action map
  actionManager.addActionMap("custom", new ActionMap([...actionManager.filters], "./custom.json"));
  actionManager.switchToActionMaps("custom");

  // Listen for the loo action triggered by /input/dummy/0/moo and mapped in custom.json to /action/loo
  actionManager.addActionListener("/action/loo", (actionPath, active, actionParameters, inputSource) => {
    console.log("received loo", actionPath, active, actionParameters);
  });

  // Listen for the add action triggered by /input/dummy/0/nums and filtered by /filter/add-value, mapped in custom.json
  actionManager.addActionListener("/action/add", (actionPath, active, actionParameters, inputSource) => {
    console.log("received add", actionPath, active, actionParameters);
  });

  // Query for a specific input path
  console.log("Value at /input/dummy/0/moo", actionManager.queryInputPath("/input/dummy/0/moo")[0]);
  console.log("Value at /input/dummy/0/nums", actionManager.queryInputPath("/input/dummy/0/nums")[0]);

  // If you're using a requestAnimationFrame loop, call poll() at the top of that
  setInterval(() => {
    actionManager.poll();
  }, 500);

  console.log("Waiting for actions.");
}
