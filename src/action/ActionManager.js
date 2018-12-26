import ActionMap from "./ActionMap.js";

/**
 *
 */
export default class ActionManager {
  constructor() {
    this._handleMapUpdate =  this._handleMapUpdate.bind(this)

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
    this._inputSourceList = new Array();

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
    this._activeActionMapList = new Array();

    /**
     * actionPath -> { action parameters }
     * @type {Map<string, Object>}
     */
    this._actionInfos = new Map();

    // Used during updates
    this._activationPaths = new Array();
    this._activationValues = new Array();
    this._activationParameters = new Array();
    this._activationFilterParameters = new Array();
    this._activationInputSources = new Array()
    this._deactivationPaths = new Array();
    this._deactivationValues = new Array();
    this._deactivationParameters = new Array();
    this._deactivationFilterParameters = new Array();
    this._deactivationInputSources = new Array();
  }

  /**
  prettyPrint sends handy set of debugging info to the console log
  */
  prettyPrint(){
    console.log('ActionManager')

    console.log('\tSources:')
    for(const [path, source] of this._inputSources){
      console.log('\t\t' + path, source.name)
    }

    console.log('\tFilters:')
    for(const [path, filter] of this._filters){
      console.log('\t\t' + path, filter.name)
    }

    console.log('\tActionMaps:')
    for(const [path, actionMap] of this._actionMaps){
      console.log('\t\t' + path, this._activeActionMaps.has(path) ? '[active]' : '[inactive]')
      actionMap.prettyPrint(3)
    }
  }

  /**
  @param {string} inputPath - a full semantic path for an input, like '/input/keyboard/key/32'
  @param [result] - if not null, the two element array in which to return the results
  @return [inputActive, inputValue, inputSource]
  */
  queryInputPath(inputPath, result=null) {
    if(result === null) result = new Array(3)
    let inputSourceInfo = null
    for (let i=0; i < this._inputSourceList.length; i++) {
      inputSourceInfo = this._inputSourceList[i]
      if (inputPath.startsWith(inputSourceInfo[0]) === false) {
        continue;
      }

      inputSourceInfo[1].queryInputPath(inputPath.substring(inputSourceInfo[0].length), _queryInputResult);
      result[0] = _queryInputResult[0];
      result[1] = _queryInputResult[1];
      result[2] = inputSourceInfo[2];
      return result;
    }
    result[0] = false
    result[1] = null
    result[2] = null
    return result;
  }

  /**
   * Poll the input states and update Action state.
   * If you're rendering inside a requestAnimationFrame response, call this at the top of your render loop.
   */
  poll() {
    // Poll inputs
    for(let i=0; i < this._inputSourceList.length; i++){
      this._inputSourceList[i][1].poll()
    }

    for(let i=0; i < this._activeActionMapList.length; i++){
      this._activeActionMapList[i][1].update(this.queryInputPath, this._handleMapUpdate)
    }

    for (let i=0; i < this._activationPaths.length; i++) {
      _actionInfo = this._getOrCreateActionInfo(this._activationPaths[i])
      _shouldNotify = _actionInfo.active === false
      _actionInfo.active = true
      _actionInfo.value = this._activationValues[i]
      _actionInfo.actionParameters = this._activationParameters[i]
      _actionInfo.filterParameters = this._activationFilterParameters[i]
      _actionInfo.inputSource = this._activationInputSources[i]
      if(_shouldNotify){
        this._notifyListeners(
          this._activationPaths[i],
          true,
          _actionInfo.value,
          _actionInfo.actionParameters,
          _actionInfo.filterParameters,
          _actionInfo.inputSource
        );
      }

      _index = this._deactivationPaths.indexOf(this._activationPaths[i]);
      if(_index !== -1){
        this._deactivationPaths.splice(_index, 1);
        this._deactivationValues.splice(_index, 1);
        this._deactivationParameters.splice(_index, 1);
        this._deactivationFilterParameters.splice(_index, 1);
        this._deactivationInputSources.splice(_index, 1);
      }
    }

    for (let i=0; i < this._deactivationPaths.length; i++) {
      _actionPath = this._deactivationPaths[i];

      _actionInfo = this._getOrCreateActionInfo(_actionPath)
      _shouldNotify = _actionInfo.active
      _actionInfo.active = false
      _actionInfo.value = this._deactivationValues[i]
      _actionInfo.actionParameters = this._deactivationParameters[i]
      _actionInfo.filterParameters = this._deactivationFilterParameters
      _actionInfo.inputSource = this._deactivationInputSources[i]

      if(_shouldNotify){
        this._notifyListeners(
          _actionPath,
          false,
          _actionInfo.value,
          _actionInfo.actionParameters,
          _actionInfo.filterParameters,
          _actionInfo.inputSource
        );
      }
    }

    this._clearMapUpdates()
  }

  _getOrCreateActionInfo(actionPath){
    let actionInfo = this._actionInfos.get(actionPath)
    if(actionInfo) return actionInfo
    actionInfo = {
      active: false,
      value: null,
      actionParameters: null,
      filterParameters: null,
      inputSource: null
    }
    this._actionInfos.set(actionPath, actionInfo)
    return actionInfo
  }

  _handleMapUpdate(actionPath, active, actionValue, actionParameters, filterParameters, inputSource){
    if (active) {
      // Accept only the first activation for a path
      if (this._activationPaths.indexOf(actionPath) !== -1) return;
      this._activationPaths.push(actionPath);
      this._activationValues.push(actionValue);
      this._activationParameters.push(actionParameters);
      this._activationFilterParameters.push(filterParameters);
      this._activationInputSources.push(inputSource);
    } else {
      if (this._deactivationPaths.indexOf(actionPath) !== -1) return;
      this._deactivationPaths.push(actionPath);
      this._deactivationValues.push(actionValue);
      this._deactivationParameters.push(actionParameters)
      this._deactivationFilterParameters.push(filterParameters);
      this._deactivationInputSources.push(inputSource)
    }
  }

  _clearMapUpdates(){
    this._activationPaths.splice(0, this._activationPaths.length);
    this._activationValues.splice(0, this._activationValues.length);
    this._activationParameters.splice(0, this._activationParameters.length);
    this._activationFilterParameters.splice(0, this._activationFilterParameters.length);
    this._activationInputSources.splice(0, this._activationInputSources.length);

    this._deactivationPaths.splice(0, this._deactivationPaths.length);
    this._deactivationValues.splice(0, this._deactivationValues.length);
    this._deactivationParameters.splice(0, this._deactivationParameters.length);
    this._deactivationFilterParameters.splice(0, this._deactivationFilterParameters.length);
    this._deactivationInputSources.splice(0, this._deactivationInputSources.length);
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

  /**
   * @param {string} inputPathName a single element in the semantic path for the input source, like 'keyboard' for a KeyboardInputSource
   * @param {InputSource} inputSource
   */
  addInputSource(inputPathName, inputSource) {
    this._inputSources.set(`/input/${inputPathName}`, inputSource);
    this._inputSourceList.push([`/input/${inputPathName}`, inputSource])
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
      if(this._activeActionMaps.has(name)) continue;
      this._activeActionMapList.push([name, this._actionMaps.get(name)]);
      this._activeActionMaps.set(name, this._activeActionMapList[this._activeActionMapList.length - 1][1]);
    }
  }

  /**
   * Deactivate {@link ActionMap}s that have already been added.
   * Does not deactivate any other active ActionMaps.
   * @param {...string} action-map names
   */
  deactivateActionMaps(...names) {
    for (let name of names) {
      if(this._activeActionMaps.has(name) === false) continue
      this._activeActionMaps.delete(name);
      for(let i=0; i < this._activeActionMapList.length; i++){
        if(this._activeActionMapList[i][0] === name){
          this._activeActionMapList.splice(i, 1)
          return
        }
      }
    }
  }

  /**
   * Clear active ActionMaps and then activate the named {@link ActionMap}s.
   * @param {...string} action-map names
   */
  switchToActionMaps(...names) {
    this._actionInfos.clear();
    this._activeActionMaps.clear();
    this._activeActionMapList.splice(0, this._activeActionMapList.length);
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

  _notifyListeners(actionPath, active, value, actionParameters, filterParameters, inputSource) {
    this._actionListeners.forEach((listenerSet, listenerPath) => {
      if (this._pathsMatch(actionPath, listenerPath) === false) return;
      listenerSet.forEach(listener => {
        listener(actionPath, active, value, actionParameters, filterParameters, inputSource);
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
    return this._actionInfos.has(actionPath) && this._actionInfos.get(actionPath).active;
  }
}

const _queryInputResult = new Array(2)
let _index = 0
let _shouldNotify = false
let _actionInfo = null
let _actionPath = null
let _actionValue = null
let _actionParameters = null
let _filterParameters = null
let _inputSource = null
