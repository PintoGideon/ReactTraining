# My Notes on Class Patterns by Ryan Florence

> "One of the things I love about React is that it lets me eliminate time in my code; I don't have to think about time, I just have to think about snapshots in time. At any time in a React app, we can look at the state of the app and then look at the render methods of our components, and we should be able to predict what the screen is going render." — Ryan Florence

#### Imperative vs Declarative

Imperative (How)

```javascript

var numbers=[4,2,3,6]
var total=0
for(var i=0, i<numbers.length,i++)
{
	total+=numbers[i]
}
```

Declarative (what)

```javascript
var numbers=[4,2,3,6]
numbers.reduce((previous,current)=>{
	return previous+=current
})
```

# Lesson 1

## In the example Oscillator.js

The play, stop, setPitchBend and setVolume are part of the Oscillator's api and play a sound when the user interacts with the screen either through a mouseEnter or a mouseLeave. Ryan elimantes that dependency and boots the app using state. Now the app will always play a sound irrespective of user's interaction with the screen.

Ryan uses a combinaton of the below hooks to achieve this.

**ComponentDidUpdate** is called anytime we set state. When we first update the state, React makes changes to the DOM and asks us whether we want to do anything with this new state. Here we call the imperative stuff to play a sound once the state is updated in play or stop.
**ComponentDidMount** is called after the app is booted up and rendered for the first time.

**_Mental Model_**: Given the render method and the current state of the app, we must be able to predict what the screen looks like.
When we make things declarative, we get to compose them together.

Ryan goes further to create a component called Tone to handle the imperative stuff. This allows him to Compose two tones together as how in the example. This idea of "behavioral" React Components—or components that don't render anything but just provide some sort of behavior or state—is still quite novel to me.

# Lesson 2
## Pin Scoll To Bottom

**scrollTo**:
Window.scrollTo() scrolls to a particular set of coordinates in the document.
window.scrollTo(x-coord, y-coord)
window.scrollTo(options)

**scrollHeight**:
The Element.scrollHeight read-only property is a measurement of the height of an element's content, including content not visible on the screen due to overflow.

**clientHeight**:
The Element.clientHeight read-only property is zero for elements with no CSS or inline layout boxes; otherwise, it's the inner height of an element in pixels. It includes padding but excludes borders, margins, and horizontal scrollbars (if present).

**scrollTop**:
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
````

# Lesson 3

## Tabs

### Starting point

The topic of this section is on creating compound components and passing around implicit props in order to make components extendable and changeable in ways other than an ever-growing list of props.
The code passes an array of objects with the icon and content to the Tabs component which maps over each tab and adds an event listener on it. When a user clicks on each tab, the onclick event toggles the state from active to inactive and vice versa allowing the user to display the content of the highlighted tab.

When a component owns all of the rendering, when you have to do something new or different (e.g. disabling, changing render order, etc.) you end up having to create and expose a new prop. This is more or less the same as how we used to create elements with something like jQueryUI, which handled all rendering on an initial setup, and then exposed some kind of options object to give some instruction on what to render. But what if in React, instead of having one big component responsible for rendering, we create a bunch of components that "compound" together in order to get the unique interaction we're looking for?

Implicit state: non app-level state that the product developer doesn't care about or see in order to use the component API successfully; in React, this is generally accomplished by using React.Children.map and React.cloneElement in order to implicitly pass state-derived or event-callback props to children

```javascript
class RadioGroup extends Component {
	render() {
		state = {
			value: this.props.defaultValue
		};

		const children = React.Children.map(this.props.children, child => {
			return React.cloneElement(child, {
				isActive: child.props.value === this.state.value,
				onSelect: () => this.setState({ value: child.props.value })
			});
		});

		return (
			<fieldset className="radio-group">
				<legend>{this.props.legend}</legend>
				{children}
			</fieldset>
		);
	}
}

class RadioButton extends Component {
	render() {
		const { isActive, onSelect } = this.props;
		const className = 'radio-button ' + (isActive ? 'active' : '');
		return (
			<button className={className} onClick={onSelect}>
				{this.props.children}
			</button>
		);
	}
}
```

## Context

Ryan goes ahead and applies context to the tabs example. Now why?

When he adds a div between the TabList and TabPanel, the parent child relationship breaks. The proposition of using context to alleviate a strict parent-child relationship between compound components seems a bit
contrived, and ultimately adds more abstraction and opaqueness to the code.

My Takeaways from Ryan's Solution to the audio player.
Firstly, I am amazed at his elegant approach to coding. Definitely a standard to aspire for henceforth:)

- I  liked the spreading of state in getChildContext
- I thought it interesting that Ryan Florence uses null values for state that is "unknown" on initial render in a component
- I liked how all of the context was put on an audio object rather than as top-level properties
- Liked the use of a generic jump function and the passing of negative values to jump backwards
- I liked setting currentTime back to zero in onEnded callback, rather than leaving it with the progress bar filled in
- I liked using event.currentTarget instead of using a ref for the progress bar click handler

# Bits of code that baffled me

```javascript
class Progress extends React.Component {
	static contextTypes = {
		audio: object
	};

	handleClick = e => {
		const { audio } = this.context;
		const rect = this.node.getBoundingClientRect();
		const clientLeft = e.clientX;
		const relativeLeft = clientLeft - rect.left;
		audio.setTime((relativeLeft / rect.width) * audio.duration);
	};

	render() {
		const { loaded, duration, currentTime } = this.context.audio;

		return (
			<div
				className="progress"
				ref={n => (this.node = n)}
				onClick={this.handleClick}
				onKeyDown={this.handleKeyDown}
			>
				<div
					className="progress-bar"
					style={{
						width: loaded ? `${(currentTime / duration) * 100}%` : '0%'
					}}
				/>
			</div>
		);
	}
}
```

When you click on the progress bar

```
onClick={this.handleClick}

```

It triggers a Handle Click function which sets the
audio's time to the current rect width clicked by the user.

```javascript
handleClick = e => {
	const { audio } = this.context;
	const rect = this.node.getBoundingClientRect();
	const clientLeft = e.clientX;
	const relativeLeft = clientLeft - rect.left;
	audio.setTime((relativeLeft / rect.width) * audio.duration);
};
```

```javascript
 getChildContext() {
    return {
      audio: {
        ...this.state,
        setTime: time => {
          this.audio.currentTime = time;
        },
      }
    }
 }

```

This change in the state re-renders the Progress Component and updates the width

```javascript
render() {
    const { loaded, duration, currentTime } = this.context.audio;

    return (
      <div
        className="progress"
        ref={n => (this.node = n)}
        onClick={this.handleClick}
        onKeyDown={this.handleKeyDown}
      >
        <div
          className="progress-bar"
          style={{
            width: loaded ? `${currentTime / duration * 100}%` : "0%"
          }}
        />
      </div>
    );
  }
```

> Context can then be used to share and manage state between components regardless of any intermediary UI. It acts as a bit of a wormhole between provider and consumer, breaking the normal boundaries of state management between components via props- Anonymous

# Render Props

In Lecture 4, we created a simple toggle component which toggles shows/hides content on an onClick event. If the state is on, we display props.children.

Now, this component does not give us much flexbility in terms of how we render the content.

### Why Would we want to use RenderProp?

RenderProp simply means passing a property in your component to be rendered.

In the app component, we pass render as a prop which is a function to the ToggleRenderProps component. We can access render props in the ToggleRenderProps component and pass the state and toggle function to it as parameters.
Now we can use a conditional logic to display some content.
However, we could use reuse the ToggleRenderProps component and display some other content using a conditional logic. The markup that comes in the render component are totally independent.

### Render Props Children

I used Render Props Children while developing CraftMonkey but could not really get a grip over what was happening. I was following an online tutorial and it did not seem trivial than.

This is our ToggleRenderPropsChildren component in App.js where we define the children as a function
accepting two arguments. We can pass
`on` to a component and use it to perform some task.

```javascript
<ToggleRPC>{({ on, toggle }) => <Component on={on} />}</ToggleRPC>
```

In ToggleRenderPropsComponent, we can access the children and pass the state and on as parameters.

```javascript
render() {
		const { children } = this.props;
		return children({
			on: this.state.on,
			toggle: this.toggle
		});
	}
```


