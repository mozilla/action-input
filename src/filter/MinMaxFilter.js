import Filter from "./Filter.js";

/**
 * triggers the action if the input value is between minimum and maximum filter parameters
 * if minimum-absolute is defined then the absolute input value must be greater to trigger the action
 * minimum defaults to -1
 * maximum defaults to 1
 */
let MinMaxFilter = class extends Filter {
  /**
   * @param {string} inputPath
   * @param inputValue
   * @param {string} filterPath
   * @param {Object} filterParameters parameters for use while filtering
   *
   * @return {Array} [value, actionParameters]
   */
  filter(inputPath, inputValue, filterPath, filterParameters) {
    const input = Number.parseFloat(inputValue, 10);
    if (Number.isNaN(input)) return [null, null];
    if ("minimum" in filterParameters) {
      if (input < filterParameters["minimum"]) return [null, null];
    } else {
      if (input < MinMaxFilter.DefaultMinimum) return [null, null];
    }
    if ("maximum" in filterParameters) {
      if (input > filterParameters["maximum"]) return [null, null];
    } else {
      if (input > MinMaxFilter.DefaultMaximum) return [null, null];
    }
    if ("minimum-absolute" in filterParameters) {
      if (Math.abs(input) < filterParameters["minimum-absolute"]) return [null, null];
    }
    return [input, {}];
  }

  /** @return {string} a human readable name */
  get name(){ return 'MinMaxFilter' }
};
MinMaxFilter.DefaultMinimum = -1;
MinMaxFilter.DefaultMaximum = 1;

export default MinMaxFilter;
