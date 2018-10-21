/**
 *  InputSource emits input callbacks for mapping into {@link Action}s by the {@link ActionMapper}
 *
 */
export default class InputSource {
  /**
   * InputSources should override to update their input state
   */
  poll() {}

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

  /** @return {string} a human readable name */
  get name(){ return 'InputSource' }
}
