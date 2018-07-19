import ActionMap from "./ActionMap.js";

/**
 *
 */
export default class ActionManager {
  constructor() {
    this.queryInputPath = this.queryInputPath.bind(this);
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
    this._deactivations = new Map();
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

    this._activeActionMaps.forEach((actionMap, name) => {
      actionMap.update(this.queryInputPath, (actionPath, active, actionParameters, inputSource) => {
        if (active) {
          // Accept the first activation
          if (this._activations.has(actionPath)) return;
          this._activations.set(actionPath, [actionPath, actionParameters, inputSource]);
        } else {
          this._deactivations.set(actionPath, [actionPath, actionParameters, inputSource]);
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
    for (const [actionPath, actionParameters, inputSource] of this._deactivations.values()) {
      if (this._activeActionInfos.has(actionPath) === false) {
        continue; // Action is not active, so no new event
      }
      this._activeActionInfos.delete(actionPath);
      this._notifyListeners(actionPath, false, actionParameters, inputSource);
    }
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

  removeFilter(semanticName) {
    this._filters.delete(`/filter/${semanticName}`);
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
   * Activate {@link ActionMap}s that have already been added.
   * Does not deactivate any other active ActionMaps.
   * @param {...string} action-map names
   */
  activateActionMaps(...names) {
    for (let name of names) {
      if (!this._actionMaps.get(name)) {
        console.error("Tried to activate unknown action map:", name);
        continue;
      }
      this._activeActionMaps.set(name, this._actionMaps.get(name));
    }
  }

  /**
   * Deactivate {@link ActionMap}s that have already been added.
   * Does not deactivate any other active ActionMaps.
   * @param {...string} action-map names
   */
  deactivateActionMaps(...names) {
    for (let name of names) {
      this._activeActionMaps.delete(name);
    }
  }

  /**
   * Clear active ActionMaps and then activate the named {@link ActionMap}s.
   * @param {...string} action-map names
   */
  switchToActionMaps(...names) {
    this._activeActionInfos.clear();
    this._activeActionMaps.clear();
    this.activateActionMaps(...names);
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
