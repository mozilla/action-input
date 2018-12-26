/**
 * Filter takes in input information and emits {@link ActionEvent}s.
 * It defines its inputs and outputs using {@link Type}s.
 *
 */
export default class Filter {
  /**
   * @param {string} inputPath
   * @param {boolean} inputActive
   * @param inputValue
   * @param {string} filterPath
   * @param {Object} filterParameters parameters for use while filtering
   * @param results an options three element array in which to set the results
   *
   * @return {Array} [active, value]
   */
  filter(inputPath, inputActive, inputValue, filterPath, filterParameters, results=null) {
    throw new Error("Extending classes must override the filter method");
  }

  /** @return {string} a human readable name */
  get name(){ return 'Filter' }
}
