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
   * @param inputValue
   * @param {string} filterPath
   * @param {Object} filterParameters parameters for use while filtering
   *
   * @return {Array} [value, actionParameters]
   */
  filter(inputPath, inputValue, filterPath, filterParameters) {
    return [!inputValue, null];
  }

  /** @return {string} a human readable name */
  get name(){ return 'ReverseActionFilter' }  
}
