import Filter from "./Filter.js";
import { split } from '../MemoryUtils.js';

/**
 * ClickFilter activates the action if input is truthy.
 * More usefully, it queries for the target of the click and returns either null or a el.component
 * The target path is /1/2/target where 1 and 2 are the first two elements in the input path
 */
export default class ClickFilter extends Filter {
  constructor(queryInputPath) {
    super();
    this._queryInputPath = queryInputPath;
  }

  /** @return {string} a human readable name */
  get name(){ return 'ClickFilter' }

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
    results[0] = inputActive
    results[1] = this._getTarget(inputPath)
    return results;
  }

  _getTarget(inputPath) {
    // Assumes that /1/2/target is the target where 1 and 2 are the first two tokens in the path
    split(inputPath, "/", _tokens);
    if (_tokens.length < 3) return null;
    _targetPath = `/${_tokens[1]}/${_tokens[2]}/target`;
    this._queryInputPath(_targetPath, _queryResult);
    if(_queryResult[0] === false) return null
    let obj = _queryResult[1]
    while(obj){
      if(obj.component) return obj.component
      obj = obj.parentNode
    }
    return null
  }
}

let _targetPath = null
let _tokens = []
let _targetEl = null
let _queryResult = new Array(2);