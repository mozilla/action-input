/**
 *  ActionMap maps input semantic paths to {@link Action}s and/or {@link Filter}s.
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
    if (url !== null) {
      this.loadURL(url).catch((...params) => {
        console.error("Error loading ActionMap", ...params);
      });
    }
  }

  prettyPrint(tabDepth=0){
    let tabs = ''
    for (let i = 0; i < tabDepth; i++) tabs += '\t'
    console.log(tabs + 'ActionMap')
    for(const [path, binding] of this._bindings){
      console.log(tabs + '\t' + path)
      for(const pathInfo of binding){
        console.log(tabs + '\t\tbinding:')
        console.log(tabs + '\t\t\taction:', pathInfo.action)
        console.log(tabs + '\t\t\tactionParameters:', pathInfo.actionParameters)
        console.log(tabs + '\t\t\tfilter:', pathInfo.filter)
        console.log(tabs + '\t\t\tfilterParameters:', pathInfo.filterParameters)
      }
    }
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
   * Called by ActionManager to trigger mapping
   * Note that ActionMaps may send the ActionManager conflicting activation and deactivation info for a single action.
   * Per-update, the ActionManager will accept the first activation for each action.
   * If there are no activations for an action, then the ActionManager will accept the first deactivation for an action.
   */
  update(queryInputPath, updateCallback) {
    for (const [inputPath, bindingInfos] of this._bindings.entries()) {
      if (bindingInfos.size === 0) continue;
      const [inputValue, inputSource] = queryInputPath(inputPath);
      bindingInfos.forEach(info => {
        if (info.filter === null) {
          const active = !!inputValue;
          updateCallback(info.action, active, info.actionParameters, inputSource);
          return;
        }
        const filter = this._filters.get(info.filter);
        if (typeof filter === "undefined") {
          console.error("Unknown filter", info.filter);
          return;
        }
        const [filteredValue, filteredActionParameters] = filter.filter(
          inputPath,
          inputValue,
          info.filter,
          info.filterParameters
        );
        const active = !!filteredValue;
        const actionParams =
          filteredActionParameters === null
            ? info.actionParameters
            : Object.assign({ value: filteredValue }, info.actionParameters, filteredActionParameters);
        updateCallback(info.action, active, actionParams, inputSource);
      });
    }
  }
}
