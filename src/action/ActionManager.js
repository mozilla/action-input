import Type from "./Type.js";
import ActionMap from "./ActionMap.js";

import Filter from "../filter/Filter.js";
import ReverseActiveFilter from "../filter/ReverseActiveFilter.js";
import ReverseAxisFilter from "../filter/ReverseAxisFilter.js";

import Device from "../hardware/Device.js";
import Gamepad from "../hardware/Gamepad.js";
import Keyboard from "../hardware/Keyboard.js";

import InputSource from "../input/InputSource.js";
import GamepadInputSource from "../input/GamepadInputSource.js";
import KeyboardInputSource from "../input/KeyboardInputSource.js";

/**
 * If new ActionManager.constructor's loadDefaults param is true then these action maps are loaded
 */
const defaultActionMaps = [
  { name: "default-flat", url: "../../src/default/playing-flat-action-map.json" }
  /*
  { name: "default-portal", url: "../default/playing-portal-action-map.json" },
  { name: "default-immersive", url: "../default/playing-immersive-action-map.json" }
  */
];

/**
 *
 * TODO figure out how to create links/aliases from specific hw inputs to generic inputs
 */
export default class ActionManager {
  constructor(loadDefaults = true) {
    /**
     * input semantic path (with wildcards) -> action listener {function}
     * @type {Map<string, function>}
     */
    this._actionListeners = new Map();

    /**
     * semantic path -> {@link InputSource}
     * @type {Map<string, InputSource>}
     */
    this._inputSources = new Map();

    /**
     * full semantic path -> {@link Filter}
     * @type {Map<string, Filter>}
     */
    this._filters = new Map();

    /**
     * name -> {@link ActionMap}
     * @type {Map<string, ActionMap>}
     */
    this._actionMaps = new Map();

    /**
     * zero or more {@link ActionMap}s may be active at any time
     * @type {Map<string, ActionMap>}
     */
    this._activeActionMaps = new Map();

    /**
     * actionPath -> { action parameters }
     * @type {Map<string, Object>}
     */
    this._activeActionInfos = new Map();

    // Used during updates
    this._activations = new Map();
    this._deactivations = new Set();

    if (loadDefaults) this._loadDefaults();
  }

  /*
  @param inputPath {string} a full semantic path for an input, like '/input/keyboard/key/32'
  @return [inputValue, inputSource]
  */
  queryInputPath(inputPath) {
    for (let inputSourceInfo of this.inputSources) {
      if (inputPath.startsWith(inputSourceInfo[0]) === false) {
        continue;
      }
      return [inputSourceInfo[1].queryInputPath(inputPath.substring(inputSourceInfo[0].length)), inputSourceInfo[1]];
    }
    return [null, null];
  }

  /**
   * Poll the input states and update Action state.
   * If you're rendering inside a requestAnimationFrame response, call this at the top of your render loop.
   */
  poll() {
    // Poll inputs
    this._inputSources.forEach((inputSource, inputPath) => {
      inputSource.poll();
    });

    this._activations.clear();
    this._deactivations.clear();

    this._activeActionMaps.forEach((actionMap, semanticPath) => {
      actionMap.update(this.queryInputPath.bind(this), (actionPath, active, actionParameters, inputSource) => {
        if (active) {
          // Accept the first activation
          if (this._activations.has(actionPath)) return;
          this._activations.set(actionPath, [actionPath, actionParameters, inputSource]);
        } else {
          this._deactivations.add(actionPath);
        }
      });
    });

    for (const [actionPath, actionParameters, inputSource] of this._activations.values()) {
      this._deactivations.delete(actionPath); // If we activate it in this update, don't deactivate it
      if (this._activeActionInfos.has(actionPath)) {
        this._activeActionInfos.set(actionPath, actionParameters);
        continue; // Changing an already existing action does not trigger an event
      }
      this._activeActionInfos.set(actionPath, actionParameters);
      this._notifyListeners(actionPath, true, actionParameters, inputSource);
    }
    for (const deactivatedActionPath of this._deactivations.values()) {
      if (this._activeActionInfos.has(deactivatedActionPath) === false) {
        continue; // Action is not active, so no new event
      }
      this._activeActionInfos.delete(deactivatedActionPath);
      this._notifyListeners(deactivatedActionPath, false, null, null);
    }
  }

  _loadDefaults() {
    // load all of the input sources and filters needed by the default action maps
    this.addInputSource("gamepad", new GamepadInputSource());
    this.addInputSource("keyboard", new KeyboardInputSource());

    this.addFilter("reverse-axis", new ReverseAxisFilter());
    this.addFilter("reverse-active", new ReverseActiveFilter());

    // load the default action maps
    for (let actionMapInfo of defaultActionMaps) {
      this.addActionMap(actionMapInfo.name, new ActionMap([...this.filters], actionMapInfo.url));
    }

    // activate the initial action map
    this.switchToActionMaps(defaultActionMaps[0].name);

    // TODO load input path aliases
  }

  /**
   * @type {Iterator} over [{string}, {@link Filter}] items
   */
  get filters() {
    return this._filters.entries();
  }

  /**
   * @param {string} semanticName like 'reverseAxis'
   * @param {Filter} filter
   */
  addFilter(semanticName, filter) {
    this._filters.set(`/filter/${semanticName}`, filter);
  }

  /** @type {Iterator} over [{string}, {@link InputSource}] items */
  get inputSources() {
    return this._inputSources.entries();
  }

  /**
   * @param {string} inputPathName a single element in the semantic path for the input source, like 'keyboard' for a KeyboardInputSource
   * @param {InputSource} inputSource
   */
  addInputSource(inputPathName, inputSource) {
    this._inputSources.set(`/input/${inputPathName}`, inputSource);
  }

  /**
   * Add a path alias for an semantic input path, usually creating a more abstract alias for a specific input.
   * For example, one might alias `/input/vive/controller/left/button/0` to `/input/hand/left/finger/0`
   * @param {string} inputPath a full semantic path for the input source
   * @param {string} aliasPath the alias for the inputPath
   */
  aliasInputPath(inputPath, aliasPath) {
    throw new Error("Not implemented");
  }

  /** @type {Iterator} over [mapName {string}, {@link ActionMap}] items */
  get actionMaps() {
    return this._actionMaps.entries();
  }

  /** @type {Iterator} over [mapName {string}, {@link ActionMap}] items */
  get activeActionMaps() {
    return this._activeActionMaps.entries();
  }

  /**
   * @param {string} name
   * @param {ActionMap} actionMap
   */
  addActionMap(name, actionMap) {
    this._actionMaps.set(name, actionMap);
  }

  /**
   * @param {string} name
   * @return {bool} true if it existed and is removed
   */
  removeActionMap(name) {
    return this._actionMaps.delete(name);
  }

  /**
   * Activate named {@link ActionMap}s.
   * @param {string} names
   */
  switchToActionMaps(...names) {
    this._activeActionInfos.clear();
    this._activeActionMaps.clear();
    for (let name of names) {
      if (this._actionMaps.has(name) === false) {
        console.error("unknown map name", name);
        continue;
      }
      this._activeActionMaps.set(name, this._actionMaps.get(name));
    }
  }

  /**
   * Deactivates the currently active {@link ActionMap}s, if any.
   */
  clearActiveActionMaps() {
    this.switchToActionMaps();
  }

  /**
   * @param {string} actionSemanticPath a semantic path, which may contain a wildcard
   * @param {function} listener
   */
  addActionListener(actionSemanticPath, listener) {
    if (this._actionListeners.has(actionSemanticPath) === false) {
      var listenerSet = new Set();
      this._actionListeners.set(actionSemanticPath, listenerSet);
    } else {
      var listenerSet = this._actionListeners.get(actionSemanticPath);
    }
    listenerSet.add(listener);
  }

  /**
   * @param {string} actionSemanticPath
   * @param {function} listener
   * @return {bool} true iff the listener was mapped to that semantic path
   */
  removeActionListener(actionSemanticPath, listener) {
    const listenerSet = this._actionListeners.get(actionSemanticPath);
    if (typeof listenerSet === "undefined") return false;
    return listenerSet.delete(listener);
  }

  _notifyListeners(actionPath, active, actionParameters, inputSource) {
    this._actionListeners.forEach((listenerSet, listenerPath) => {
      if (this._pathsMatch(actionPath, listenerPath) === false) return;
      listenerSet.forEach(listener => {
        listener(actionPath, active, actionParameters, inputSource);
      });
    });
  }

  _pathsMatch(actionPath, listenerPath) {
    if (actionPath === listenerPath) return true;
    // TODO implement wildcards
    return false;
  }

  /**
   * @param {string} actionPath a full semantic path to an {@link Action}, like '/action/jump'
   * @return {bool} true if the {@link Action} at the actionPath is currently active
   */
  actionIsActive(actionPath) {
    return this._activeActionInfos.has(actionPath);
  }

  /**
   * @param {string} actionPath a full semantic path to an action, like '/action/jump'
   * @returns {
   *   action: {@link Action},
   *   active: {bool},
   *   sources: [{@link Device}, ...],
   *   action specific params...
   * }
   */
  getActionState(actionPath) {
    return this._activeActionInfos.get(actionPath) || null;
  }
}
