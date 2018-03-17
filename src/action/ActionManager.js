import Type from "./Type.js";
import ActionSet from "./ActionSet.js";
import ActionMap from "./ActionMap.js";

import Filter from "../filter/Filter.js";
import ReverseActiveFilter from "../filter/ReverseActiveFilter.js";
import ReverseAxisFilter from "../filter/ReverseAxisFilter.js";

import Device from "../hardware/Device.js";
import Gamepad from "../hardware/Gamepad.js";
import Keyboard from "../hardware/Keyboard.js";

import InputEvent from "../input/InputEvent.js";
import InputSource from "../input/InputSource.js";
import GamepadInputSource from "../input/GamepadInputSource.js";
import KeyboardInputSource from "../input/KeyboardInputSource.js";

/**
 * If new ActionManager.constructor's loadDefaults param is true then these action sets are loaded
 */
const defaultActionSets = [
  { name: "default-flat", url: "../../src/default/playing-flat-action-set.json" }
  /*
  { name: "default-portal", url: "../default/playing-portal-action-set.json" },
  { name: "default-immersive", url: "../default/playing-immersive-action-set.json" }
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
     * name -> {@link ActionSet}
     * @type {Map<string, ActionSet>}
     */
    this._actionSets = new Map();

    /**
     * zero or one {@link ActionSet}s may be active at any time
     * @type {ActionSet}
     */
    this._activeActionSet = null;

    /**
     * actionPath -> { action parameters }
     * @type {Map<string, Object>}
     */
    this._activeActionInfos = new Map();

    /**
     * A bound listener function to add and remove from the active ActionSet
     */
    this._boundHandleActionSetEvent = this._handleActionSetEvent.bind(this);

    if (loadDefaults) this._loadDefaults();
  }

  _loadDefaults() {
    // load all of the input sources and filters needed by the default action sets
    this.addInputSource("gamepad", new GamepadInputSource());
    this.addInputSource("keyboard", new KeyboardInputSource());

    this.addFilter("reverse-axis", new ReverseAxisFilter());
    this.addFilter("reverse-active", new ReverseActiveFilter());

    // load the default action sets
    for (let actionSetInfo of defaultActionSets) {
      this.addActionSet(actionSetInfo.name, new ActionSet(new ActionMap([...this.filters], actionSetInfo.url), false));
    }

    // activate the initial action set
    this.switchToActionSet(defaultActionSets[0].name);

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

  /**
   * Poll the input devices that provide polling APIs.
   * If you're rendering inside a requestAnimationFrame response, call this at the top of your render loop.
   */
  pollInputSources() {
    this._inputSources.forEach((inputSource, inputPath, map) => {
      inputSource.poll();
    });
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
    let path = this._findNextInputSourcePath(inputPathName);
    this._inputSources.set(path, inputSource);
    inputSource.addListener((subPath, value, params) => {
      if (this._activeActionSet !== null) {
        this._activeActionSet.handleInput(`${path}/${subPath}`, value, inputSource, params);
      }
    });
  }

  /**
   * @param {string} name the name (not path) of a new InputSource, like 'keyboard'
   * @return {string} a full, indexed semantic path, like '/input/keyboard/2'
   */
  _findNextInputSourcePath(name) {
    let index = 0;
    while (this._inputSources.has(`/input/${name}/${index}`)) {
      index += 1;
    }
    return `/input/${name}/${index}`;
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

  /** @type {Iterator} over [{string}, {@link ActionSet}] items */
  get actionSets() {
    return this._actionSets.entries();
  }

  /** @type {ActionSet} may be null */
  get activeActionSet() {
    return this._activeActionSet;
  }

  /**
   * @param {string} name
   * @param {ActionSet} actionSet
   */
  addActionSet(name, actionSet) {
    this._actionSets.set(name, actionSet);
  }

  /**
   * @param {string} name
   * @return {bool} true if it existed and is removed
   */
  removeActionSet(name) {
    return this._actionSets.delete(name);
  }

  /**
   * Activate a named ActionSet.
   * There is only ever zero or one active ActionSet.
   * @param {string} name
   * @return {bool} true if the named ActionSet is in this.actionSets, otherwise false
   */
  switchToActionSet(name) {
    if (this._actionSets.has(name) === false) return false;
    if (this._activeActionSet !== null) {
      this._activeActionSet.removeActionListener(this._boundHandleActionSetEvent);
      this._activeActionInfos.clear();
    }
    this._activeActionSet = this._actionSets.get(name);
    this._activeActionSet.addActionListener(this._boundHandleActionSetEvent);
    return true;
  }

  /**
   * Deactivates the currently active ActionSet, if any.
   */
  clearActiveActionSet() {
    if (this._activeActionSet !== null) {
      this._activeActionSet.removeActionListener(this._boundHandleActionSetEvent);
      this._activeActionInfos.clear();
    }
    this._activeActionSet = null;
  }

  /**
   * The listener function that we add and remove from ActionSets as they become active and inactive
   */
  _handleActionSetEvent(actionPath, active, actionParameters, inputSource) {
    if (active) {
      if (this._activeActionInfos.has(actionPath)) {
        this._activeActionInfos.set(actionPath, actionParameters);
        return; // Changing an already existing action does not trigger an event
      }
      this._activeActionInfos.set(actionPath, actionParameters);
      this._notifyListeners(actionPath, true, actionParameters, inputSource);
    } else {
      if (this._activeActionInfos.has(actionPath) === false) {
        return; // Action is not active, so no new event
      }
      this._activeActionInfos.delete(actionPath);
      this._notifyListeners(actionPath, false, actionParameters, inputSource);
    }

    // TODO Notify local action listeners
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
