/**
 *	ActionMap maps input semantic paths to {@link Action}s and/or {@link Filter}s.
 *
 */
export default class ActionMap {
  /**
   * @param {Array[]} filters An array of [semanticPath, Filter]
   * @parm {string} url An optional URL to JSON data holding binding info
   */
  constructor(filters, url = null) {
    /**
     * @type {Map<string, Filter>}
     */
    this._filters = new Map();
    for (let filterInfo of filters) {
      this._filters.set(...filterInfo);
    }
    /**
     * input semantic path -> {
     *  action: {string},
     *  actionParameters: {},
     *  filter: {string} or null,
     *  filterParameters: {} or null
     * }
     * @type {Map<string, Set<Object>>}
     */
    this._bindings = new Map();
    this._listeners = new Set();
    this.loadURL(url);
  }

  /**
   * bind inputs to actions and filter using JSON data at url
   * @param {string} url a relative or fully qualified URL that points to a JSON map
   * @return {Promise<bool>}
   */
  loadURL(url) {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(response => response.json())
        .then(data => {
          this.loadData(data)
            .then(resolve)
            .catch(reject);
        })
        .catch(reject);
    });
  }

  /**
   * @param {Object} data (probably parsed from JSON by loadURL) used to bind inputs to actions and filters
   */
  loadData(data) {
    return new Promise((resolve, reject) => {
      for (let input of data.inputs) {
        this.bind(input.source, input.destination, input.parameters || null);
      }
      for (let filter of data.filters) {
        this.bind(filter.source, filter.destination, filter.actionParameters, filter.filter, filter.filterParameters);
      }
      resolve();
    });
  }

  /**
   * bind an input path to an action path, optionally through a filter
   *
   * @param {string} inputPath a full semantic path to an input like '/input/hand/finger/0/touch'
   * @param {string} actionPath a full semantic path to an action like '/action/jump'
   * @param {Object} actionParameters to emit with the action
   * @param {string} filterPath a full semantic path to a {@link Filter} like '/filter/reverse-axis'
   * @param {Object} filterParameters to feed the filter during filtering
   */
  bind(inputPath, actionPath, actionParameters = null, filterPath = null, filterParameters = null) {
    let pathInfos = this._bindings.get(inputPath);
    if (typeof pathInfos === "undefined") {
      pathInfos = new Set();
      this._bindings.set(inputPath, pathInfos);
    }
    pathInfos.add({
      action: actionPath,
      actionParameters: actionParameters,
      filter: filterPath,
      filterParameters: filterParameters
    });
  }

  /**
   * @param {function} listener will receive callbacks of the form ({@link ActionEvent}, inputPath, sourceDevices, ...params)
   */
  addListener(listener) {
    this._listeners.add(listener);
  }

  removeListener(listener) {
    return this._listeners.delete(listener);
  }

  _notifyListeners(...params) {
    this._listeners.forEach(listener => {
      listener(...params);
    });
  }

  /**
   * Called by ActionSet to trigger mapping
   *
   * @param {string} inputPath a full semantic path for an {@link InputEvent} like '/input/hand/finger/0/touch'
   * @param {bool} active
   * @param {InputSource} inputSource the input source that led to the event
   * @param {Object} inputParameters zero or more event-specific parameters that give the event more context
   */
  handleInput(inputPath, active, inputSource, inputParameters) {
    let bindingSet = this._bindings.get(inputPath);
    if (typeof bindingSet === "undefined") {
      //console.log("unhandled input event", inputPath, value, inputSource, inputParameters);
      return;
    }
    bindingSet.forEach(info => {
      if (info.filter === null) {
        this._notifyListeners(
          info.action,
          active,
          Object.assign({}, inputParameters, info.actionParameters),
          inputSource
        );
        return;
      } else {
        let filter = this._filters.get(info.filter);
        if (typeof filter === "undefined") {
          console.error("Unknown filter", info.filter);
          return;
        }
        let results = filter.handleInput(inputPath, active, inputParameters, info.filter, info.filterParameters);
        if (results) {
          this._notifyListeners(
            info.action,
            results[0],
            Object.assign(results[1], inputParameters, info.actionParameters),
            inputSource
          );
        }
      }
    });
  }
}
