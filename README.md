# Ply

![Ply](docs/img/ply.png)

Ply is a lightweight web inspector for HTML and CSS. It is designed to help less-experienced developers inspect and learn from existing websites of interest. Accordingly, the interface is designed for simplicity and usability, rather than power. Ply is research software under active development through [Design, Technology, and Research](http://dtr.northwestern.edu) at Northwestern University.

Currently, Ply implements the following novel features:

- **Visual regression pruning**: while viewing matched styles for an element, click a button to rule out styles with no visual impact on the page (this is dynamically-tested, not based on static analysis). Useful for reverse-engineering styles.
- **Multiple element inspection**: click on multiple elements in the DOM viewer to see their styles side-by-side. Useful for debugging or exploring parent-child relationships, or positioning contexts.
- **DOM isolation view**: select a node in the inspected webpage to isolate its subtree in the inspector. Useful for inspecting a single component in isolation.

You can read more about *visual regression pruning* in our CHI 2017 materials:

- [Ply: Visual Regression Pruning for Web Design Source Inspection](http://users.eecs.northwestern.edu/~scl025/files/ply.pdf)
- [Slides from the talk](https://slides.com/soylentqueen/ply-chi-src/)

## Getting Started

> The following instructions assume familiarity with Git and Node.js tooling. If you're not even sure how to download this project, check out [this guide](https://gist.github.com/sarahlim/ab4a31c822f93995806b29270f1faa7e) to get up to speed.

Install the [chrome-remote-css](https://github.com/sarahlim/chrome-remote-css) extension. Ply depends on this extension to debug pages remotely.

Once you've cloned this repository:

```sh
yarn install     # install dependencies
yarn run server  # start the proxy server
yarn start       # start the inspector
```

Then navigate to `http://localhost:3000` in Chrome, and you should have a blank inspector.

To start inspecting a webpage, open a new window or tab, and navigate to the site you want to inspect.

Click the browser extension icon to activate `chrome-remote-css`, and select an element on the page using the cursor. The element and its subtree should appear in Ply.

Note that you'll need to keep the inspection target tab open, so that Ply can update and request CSS styles as you inspect.

