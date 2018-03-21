import Filter from "../../src/filter/Filter.js";

/**
 * Adds filterParameters.value to inputParameters.value and sets the result on actionParameters.value
 */
export default class AddValueFilter extends Filter {
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
    let actionParameters = { value: inputParameters.value || 0 };
    actionParameters.value += filterParameters.value || 0;
    return [active, actionParameters];
  }
}
