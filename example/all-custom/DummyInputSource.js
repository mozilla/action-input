import InputSource from "../../src/input/InputSource.js";

/**
 *
 * @param {Object[]} inputInfo an array of { path {string}, parameters {Object } } like { path: "nums", parameters: { value: 22} }
 */
export default class DummyInputSource extends InputSource {
  constructor(inputInfo = []) {
    super();
    this._inputInfo = inputInfo;
  }

  /**
  @param partialPath {string} the relative semantic path for an input
  @return the value of the the input, or null if the path does not exist
  */
  queryInputPath(partialPath) {
    for (let inputInfo of this._inputInfo) {
      if (`/0/${inputInfo.path}` === partialPath) {
        return inputInfo.parameters;
      }
    }
    return null;
  }
}
