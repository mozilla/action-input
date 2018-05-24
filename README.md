# Mozilla XR Input

A framework-agnostic input library for the wider web, A near future web that responsively supports:

* _3 display modes_: flat, portal, and immersive
* _3 control types_: page, overlay, and spatial
* _new inputs_: tracked wands, hand gestures, and voice

In order for WebXR applications to continue to work as new input hardware is created, Mozilla will maintain these libraries and publish them to a CDN for public use. Eventually, the WebXR input APIs may replace some of the functionality, but apps built using these libraries should continue to work.

## High level features

Map low level events like button pushes and hand gestures to semantic actions like point, select, and activate.

Provide 3D models, reference images, and metadata (including control position) for input hardware.

Provide default input maps for existing hardware and regularly release new maps for new hardware.

Provide users with the ability to create their own input configurations to enable apps to support users preferences and accessibility needs.

## Main classes

**ActionManager**

This is the class that most web apps will use to configure and then react to user actions. It exposes a polling API and an event API.

**ActionMap**

This maps low level input state to high level semantic actions. For example, a button press on a controller or a keyboard could be mapped to an action like "jump".

ActionMaps are usually configured by initializing them with a JSON file.

Zero or more ActionMaps can be activated at any time using the API on ActionManager.

Included in the library are JSON files for common applications scenarios.

**InputSource**

This is a class that holds low level input state, like whether or not a keyboard key is down, the current position of a tracked wand, or the sensor reading from an accelerometer.

Included in the library are InputSources for common hardware like keyboards, gamepads, and wands.

**Device**

This holds information about a specific piece of hardware, such as a tracked wand or a keyboard. InputSources may reference a Device to indicate the source of input, and applications can query Devices for metadata such as their 3D models and the positions of their buttons.

## Possible future work

**Recording and playback library**

This library would provide web apps with the ability to record and serialize time-lines of actions, for use in testing frameworks as well as in production.

**Action map editor UI**

This library would provide a user facing UI for editing ActionMaps.
