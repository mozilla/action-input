import Filter from "../../src/filter/Filter.js";

/**
 * Adds filterParameters.value to inputParameters.value and sets the result on actionParameters.value
 */
export default class AddValueFilter extends Filter {
  /**
   * @param {string} inputPath
   * @param inputValue
   * @param {string} filterPath
   * @param {Object} filterParameters parameters for use while filtering
   *
   * @return {Array} [value, actionParameters]
   */
  filter(inputPath, inputValue, filterPath, filterParameters) {
    let actionParameters = { value: inputValue || 0 };
    actionParameters.value += filterParameters.value || 0;
    return [actionParameters.value, actionParameters];
  }
}
