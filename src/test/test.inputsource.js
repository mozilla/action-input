import KeyboardInputSource from "../input/KeyboardInputSource.js";

let assert = chai.assert;

describe("Input sources", function() {
  describe("Keyboard", function() {
    it("should fire an InputEvent upon receiving a KeyboardEvent", function() {
      let receivedEvents = [];
      var listener = (eventName, inputEvent, ...params) => {
        receivedEvents.push({ eventName: eventName, inputEvent: inputEvent, params: params });
      };

      let keyboardInputSource = new KeyboardInputSource();
      keyboardInputSource.addListener(listener, "input-event");

      let testInput = function(eventName, keyCode, alt = false, ctrl = false, shift = false, meta = false) {
        keyboardInputSource.handleKeyboardEvent(
          new KeyboardEvent(eventName, {
            keyCode: keyCode,
            altKey: alt,
            ctrlKey: ctrl,
            shiftKey: shift,
            metaKey: meta
          })
        );
        assert.equal(eventName, receivedEvents[receivedEvents.length - 1].inputEvent.name);
        assert.equal(keyCode, receivedEvents[receivedEvents.length - 1].params[1]);
        assert.equal(alt, receivedEvents[receivedEvents.length - 1].params[2]);
        assert.equal(ctrl, receivedEvents[receivedEvents.length - 1].params[3]);
        assert.equal(shift, receivedEvents[receivedEvents.length - 1].params[4]);
        assert.equal(meta, receivedEvents[receivedEvents.length - 1].params[5]);
      };

      testInput("keydown", 65, true, false, false, false);
      testInput("keydown", 66, false, true, false, false);
      testInput("keydown", 67, false, false, true, false);
      testInput("keydown", 68, false, false, false, true);
    });
  });
});
