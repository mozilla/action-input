import Device from "../hardware/Device.js";

/**
 * Action represents a high-level user action, like "teleport" or "activate".
 */
export default class Action {
  constructor() {
    // TODO
  }

  /**
   * @param {number} pulseMilliseconds
   * @param {Device[]} sources
   */
  sendHapticPulse(pulseMilliseconds, sources) {
    throw new Error("Not implemented");
  }
}
