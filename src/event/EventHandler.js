import EventMixin from './EventMixin.js'

/**
 *	EventHandler is a base class that has the {@link EventMixin} applied.
 *	This is handy for extending event handling classes with no other ancestor.
 */
const EventHandler = EventMixin(
	class {}
)

export default EventHandler
