import Filter from "./Filter.js";

/**
 * Reversed the active state of an input.
 */
export default class ReverseActiveFilter extends Filter {
  constructor() {
    super();
  }

  /**
   * @param {string} inputPath
   * @param {bool} active
   * @param {Object} inputParameters
   * @param {string} filterPath
   * @param {Object} filterParameters parameters for use while filtering
   *
   * @return {Array} [active, actionParameters]
   */
  handleInput(inputPath, active, inputParameters, filterPath, filterParameters) {
    return [!active, {}];
  }
}
