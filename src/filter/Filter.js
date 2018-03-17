import Type from "../action/Type.js";

/**
 * Filter takes in input information and emits {@link ActionEvent}s.
 * It defines its inputs and outputs using {@link Type}s.
 *
 */
export default class Filter {
  /**
   * @param {string} inputPath
   * @param {bool} active
   * @param {Object} inputParameters
   * @param {string} filterPath
   * @param {Object} filterParameters parameters for use while filtering
   *
   * @return {Array} [value, actionParameters]
   */
  filter(inputPath, value, inputParameters, filterPath, filterParameters) {
    throw new Error("Extending classes must override the filter method");
  }
}
