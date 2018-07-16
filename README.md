# Mozilla XR Input

A framework-agnostic input library for the web.

## High level features

Map low level events like button pushes and hand gestures to semantic actions like point, select, and activate.

## Main classes

**ActionManager**

This is the class that web apps will use to configure and then react to user actions. It exposes a polling API and an event API.

**ActionMap**

This maps low level input state to high level semantic actions. For example, a button press on a controller or a keyboard could be mapped to an action like "jump".

ActionMaps are usually configured by initializing them with a JSON file.

Multiple ActionMaps can be activated at any time using the API on ActionManager.

**InputSource**

This is a class that holds low level input state, like whether or not a keyboard key is down, the current position of a tracked wand, or the sensor reading from an accelerometer.

Included in the library are InputSources for common hardware like keyboards, gamepads, and wands.

**Device**

This holds information about a specific piece of hardware, such as a tracked wand or a keyboard. InputSources may reference a Device to indicate the source of input, and applications can query Devices for metadata such as their 3D models and the positions of their buttons.

## Possible future work

Provide 3D models, reference images, and metadata (including control position) for input hardware.

Provide default input maps for existing hardware and regularly release new maps for new hardware.

Provide end users with the ability to create their own input configurations to enable apps to support users preferences and accessibility needs.

**Recording and playback library**

This library would provide web apps with the ability to record and serialize time-lines of actions, for use in testing frameworks as well as in production.

**Action map editor UI**

This library would provide a user facing UI for editing ActionMaps.
