import Filter from "./Filter.js";

/**
 * ClickFilter activates the action if input is truthy.
 * More usefully, it queries for the target of the click and returns either null or a Potassium.Component
 * The target path is /1/2/target where 1 and 2 are the first two elements in the input path
 */
export default class ClickFilter extends Filter {
  constructor(queryInputPath) {
    super();
    this._queryInputPath = queryInputPath;
  }

  /**
   * @param {string} inputPath
   * @param inputValue
   * @param {string} filterPath
   * @param {Object} filterParameters parameters for use while filtering
   *
   * @return {Array} [value, actionParameters]
   */
  filter(inputPath, inputValue, filterPath, filterParameters) {
    const target = this._getTarget(inputPath);
    return [!!inputValue, { targetComponent: target }];
  }

  _getTarget(inputPath) {
    // Assumes that /1/2/target is the target where 1 and 2 are the first two tokens in the path
    let tokens = inputPath.split("/");
    if (tokens.length < 3) return null;
    const targetPath = `/${tokens[1]}/${tokens[2]}/target`;
    let targetEl = this._queryInputPath(targetPath)[0];
    if (!targetEl) return null;
    while (true) {
      if (targetEl.component) return targetEl.component;
      if (!targetEl.parentElement) return null;
      targetEl = targetEl.parentElement;
    }
  }
}
