# XR Input

A framework-agnostic input library that progressively handles flat, portal, and immersive web apps.

In order for WebXR applications to continue to work as new input hardware is created, Mozilla will maintain these libraries and publish them to a CDN for public use. Eventually, the WebXR input APIs may replace some of the functionality, but apps built using these libraries should continue to work.

## High level features

Map low level events like button pushes and hand gestures to semantic actions like point, select, and activate.

Provide 3D models, reference images, and metadata (including control position) for input hardware.

Provide default input maps for existing hardware and regularly release new maps for new hardware.

Provide users with the ability to create their own input configurations to enable apps to support users preferences and accessibility needs.

This project contains three Javascript libraries and one UI element:

## Actions library

This library provides the API that most web apps will use to poll for current actions and to receive action events. The actions themselves come from a set of ActionProviders, such as one provided by the Input library and one that wraps the proposed WebXR input API.

### Features

- Exposes a polling and event API that web apps use to track actions
- Exposes an API to add and remove ActionProviders

## Input library

This library maps low level hardware inputs to action events, either directly from hardware events or via filters. It provides an ActionProvider for use by the Actions library. It uses the Hardware library to decorate action events with information about the hardware that caused the action.

### Features

- Loads and serializes JSON action maps that declare mappings from hardware input to action events and/or filters
- Loads filters that receive hardware input and emit action events 
- Exposes API for activating and deactivating action maps
- Exposes API for querying what action[s] each hardware input (button, touchpad, key, touch event, etc) will currently trigger
- Provides example action maps and toggling code

## Hardware library

This library provides glTF models, positional metadata, and reference images for hardware. For example, a web app presenting in VR might use a Vive controller model and use the positional metadata to draw helpful info on each button’s current action.

### Supported hardware

- Keyboards: virtual?
- Mice
- Touch-screens: phones, tablets
- Tracked wands: Vive, Touch, Windows MR, GearVR controller, Daydream controller, Knuckles
- Gamepads: XBox
- GearVR touchpad
- Stylus

### Features

- Exposes a polling and event API for detected hardware

## Recording and playback library

This library provides web apps with the ability to record and serialize time-lines of actions, for use in testing frameworks as well as in production.

### Features

- Provides API to start, stop, and serialize recordings by attaching to the Actions library
- Provides API to load and play recordings by attaching to the Actions library

## Action map editor UI

This library provides a user facing UI for editing action maps used by the Input library. It uses the Input library and the Hardware library to present the user with device and app specific configuration UI. 
This editor should make it possible to create (and share?) per-web-app action maps in order to enable accessibility for people using non-standard hardware.
