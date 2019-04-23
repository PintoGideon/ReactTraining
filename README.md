# My Notes on Class Patterns by Ryan Florence

>"One of the things I love about React is that it lets me eliminate time in my code; I don't have to think about time, I just have to think about snapshots in time. At any time in a React app, we can look at the state of the app and then look at the render methods of our components, and we should be able to predict what the screen is going render." — Ryan Florence

# Lesson 1

# In the example Oscillator.js

The play, stop, setPitchBend and setVolume are part of the Oscillator's api and play a sound when the user interacts with the screen either through a mouseEnter or a mouseLeave. Ryan elimantes that dependency and boots the app using state. Now the app will always play a sound irrespective of user's interaction with the screen.

Ryan uses a combinaton of the below hooks to achieve this.

**ComponentDidUpdate** is called anytime we set state. When we first update the state, React makes changes to the DOM and asks us whether we want to do anything with this new state. Here we call the imperative stuff to play a sound once the state is updated in play or stop.
**ComponentDidMount** is called after the app is booted up and rendered for the first time.

**_Mental Model_**: Given the render method and the current state of the app, we must be able to predict what the screen looks like.
When we make things declarative, we get to compose them together.

Ryan goes further to create a component called Tone to handle the imperative stuff. This allows him to Compose two tones together as how in the example. This idea of "behavioral" React Components—or components that don't render anything but just provide some sort of behavior or state—is still quite novel to me.

# Lesson 2

-scrollTo
Window.scrollTo() scrolls to a particular set of coordinates in the document.
window.scrollTo(x-coord, y-coord)
window.scrollTo(options)

-scrollHeight
The Element.scrollHeight read-only property is a measurement of the height of an element's content, including content not visible on the screen due to overflow.

-clientHeight
The Element.clientHeight read-only property is zero for elements with no CSS or inline layout boxes; otherwise, it's the inner height of an element in pixels. It includes padding but excludes borders, margins, and horizontal scrollbars (if present).

-scrollTop
An element's scrollTop value is a measurement of the distance from the element's top to its topmost visible content. When an element's content does not generate a vertical scrollbar, then its scrollTop value is 0.

>"You can tell when you've got a good abstraction not just when you can add code easily, but when you can remove code easily." — Michael Jackson

I am really impressed with how Ryan uses the Component hooks here. I had never seen a use case like this before. He does not use a state for scrollHeight in the PinScrollToBottom component. As messages come in, the state in the App Component changes which triggers a change in PinScrollToBottom firing the ComponentDidUpdate hook.

**ComponentWillUpdate** is our chance to do anything before the next render happens. In our case, if the user is scrolled to the bottom and a new message appears, we scroll otherwise we don't. If the user has scrolledUp, ComponentDidUpdate does not fire the scroll method.

```javascript
class PinScrollToBottom extends Component {
	componentDidMount() {
		this.scroll();
	}

	componentDidUpdate() {
		if (!this.scrolledUp) this.scroll();
	}

	ComponentWillUpdate() {
		const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
		this.scrolledUp = scrollTop + clientHeight === scrollHeight;
	}

	scroll() {
		window.scrollTo(0, document.documentElement.scrollHeight);
	}

	render() {
		this.props.children;
	}
}
```
