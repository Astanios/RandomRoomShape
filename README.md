# Random Room Shape

This repo was generated using `create-vite`.

Although it doesn't use any external libraries, it does use the `canvas` element to draw the shapes.

Run it by using yarn:

```bash
yarn
yarn dev
```

You should see:

- A random room (triangle/simple/t-shape) drawn.
- Red “length” and blue “width” lines, each wall-to-wall and perpendicular to each other, with endpoints marked.
- The button cycles the base wall, changing which segment is parallel (length) and which is perpendicular (width).
- A button that changes the shape to a random one different than the current.
- Labels at the top indicate the chosen shape and the current baseline wall indices.
