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
  filter(inputPath, inputActive, inputValue, filterPath, filterParameters, results=null) {
    if(results === null) results = new Array(2);
    if(inputActive === false){
      results[0] = false
      results[1] = null
      return results
    }
    const input = Number.parseFloat(inputValue, 10);
    if (Number.isNaN(input)) {
      results[0] = false
      results[1] = null
      return results
    }
    if ("minimum" in filterParameters) {
      if (input < filterParameters["minimum"]) {
        results[0] = false
        results[1] = null
        return results
      }
    } else {
      if (input < MinMaxFilter.DefaultMinimum) {
        results[0] = false
        results[1] = null
        return results
      }
    }
    if ("maximum" in filterParameters) {
      if (input > filterParameters["maximum"]){
        results[0] = false
        results[1] = null
        return results
      }
    } else {
      if (input > MinMaxFilter.DefaultMaximum){
        results[0] = false
        results[1] = null
        return results
      }
    }
    if ("minimum-absolute" in filterParameters) {
      if (Math.abs(input) < filterParameters["minimum-absolute"]) {
        results[0] = false
        results[1] = null
        return results
      }
    }
    results[0] = true;
    results[1] = input;
    return results;
  }

  /** @return {string} a human readable name */
  get name(){ return 'MinMaxFilter' }
};
MinMaxFilter.DefaultMinimum = -1;
MinMaxFilter.DefaultMaximum = 1;

export default MinMaxFilter;
