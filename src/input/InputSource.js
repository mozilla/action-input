/**
 *  InputSource emits {@link InputEvent}s for mapping into {@link Action}s by the {@link ActionMapper}
 *
 */
export default class InputSource {
  constructor() {
    this._listeners = new Set();
  }
  notifyListeners(inputPath, value, params) {
    this._listeners.forEach(listener => {
      listener(inputPath, value, params);
    });
  }
  addListener(listener) {
    this._listeners.add(listener);
  }

  /**
  @param partialPath {string} the relative semantic path for an input
  @return the value of the the input, or null if the path does not exist
  */
  queryInputPath(partialPath) {
    return null;
  }

  sendHapticPulse(pulseMilliseconds) {
    // InputSources should override if they have haptic capabilities
  }
}
