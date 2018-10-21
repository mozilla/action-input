/**
 * Filter takes in input information and emits {@link ActionEvent}s.
 * It defines its inputs and outputs using {@link Type}s.
 *
 */
export default class Filter {
  /**
   * @param {string} inputPath
   * @param inputValue
   * @param {string} filterPath
   * @param {Object} filterParameters parameters for use while filtering
   *
   * @return {Array} [value, actionParameters]
   */
  filter(inputPath, inputValue, filterPath, filterParameters) {
    throw new Error("Extending classes must override the filter method");
  }

  /** @return {string} a human readable name */
  get name(){ return 'Filter' }
}
