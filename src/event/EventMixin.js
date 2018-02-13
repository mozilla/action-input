import EventListener from './EventListener.js'

/**
 *	Mix EventMixin to enable the instances to track event listeners and send them events.
 *
 *	Use it like so: var YourClass = EventMixin(class { ... })
 *
 *	For classes with no other ancestor, you could use the {@link EventHandler} base class that already has EventMixin mixed in.
 *
 *	@example
 *	// Create an instance that has the EventMixin mixed in
 *	var eventHandler = new EventHandler()
 *
 *	// Register a listener for 'event-type-1'
 *	eventHandler.addListener((eventName, param1, param2) => {
 *		console.log(eventName, param1, param2)
 *	}, 'event-type-1')
 *
 *	// Trigger an event of type 'event-type-1'
 *	eventHandler.trigger('event-type-1', 'first param', 42)
 *	// Listener logs 'event-type-1, first param, 42' to console.
*/
export default Base => class extends Base {
	/**
	 * Send an event to listeners
	 */
	trigger(eventName, ...params){
		var listenersToRemove = [];
		for(let listener of this.listeners){
			if(listener.distributeEvent(eventName, ...params) && listener.once){
				listenersToRemove.push(listener);
			}
		}
		for(let listener of listenersToRemove){
			this.removeListener(listener.callback, listener.eventName)
		}
	}
	addListener(callback, eventName=EventListener.ALL_EVENTS, once=false){
		this.listeners.push(new EventListener(eventName, callback, once))
	}
	removeListener(callback, eventName=null){
		let remove = false
		for(var i=0; i < this.listeners.length; i++){
			remove = false
			if(this.listeners[i].callback === callback){
				if(eventName == null){
					remove = true
				} else if(this.listeners[i].matches(eventName)) {
					remove = true
				}
			}
			if(remove){
				this.listeners.splice(i, 1)
				i -= 1
			}
		}
	}
	/**
	 *	Returns an array of EventListener instances
	 */
	get listeners(){
		if(typeof this._listeners == 'undefined'){
			this._listeners = []
		}
		return this._listeners
	}
	clearListeners(){
		if(typeof this._listeners !== 'undefined'){
			this._listeners.length = 0
		}
	}
}