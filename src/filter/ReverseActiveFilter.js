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
  filter(inputPath, inputActive, inputValue, filterPath, filterParameters, results=null) {
    if (results === null) results = new Array(2);
    results[0] = !inputActive;
    results[1] = inputValue;
    return results;
  }

  /** @return {string} a human readable name */
  get name(){ return 'ReverseActionFilter' }  
}
