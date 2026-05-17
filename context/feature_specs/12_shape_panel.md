Add a bottom shape panel so users can drag shapes onto the canvas and create new nodes.

## Progress

- [x] Read the shape panel spec, local Next.js client component docs, and Liveblocks React Flow guidance.
- [x] Add shape-specific canvas types and default drag payload sizes.
- [x] Add a bottom floating draggable shape toolbar.
- [x] Add canvas dragover/drop handling and React Flow screen-to-canvas conversion.
- [x] Add custom canvas node creation and basic renderer.
- [x] Run verification.

## Implementation

1. Add a floating pill-shaped toolbar at the bottom-center of the canvas.

2. Add draggable icon buttons for these shapes:
- rectangle
- diamond
- circle
- pill
- cylinder
- hexagon

3. When dragging a shape, include the shape name and default size in the drag payload.

Use sensible default sizes:
- rectangles should be wider than tall
- circles should be square
- diamonds should be slightly larger so labels have room

4. Add `dragover` and `drop` handling to the canvas wrapper.

5. On drop:
- read the dragged shape payload
- convert the screen position to canvas coordinates using React Flow
- create a new node at that position
- use an empty label
- use the default node color
- use the dragged shape value

6. Generate each node ID using the shape name, timestamp, and a counter.

7. Add a basic renderer for the custom canvas node type so new nodes are visible.

For this unit, render every shape as a simple bordered rectangle with the label centered.
Shape-specific visuals will be added later.

## Check When Done

- Shape drag payload includes the correct shape and size data.
- Drop logic creates new canvas nodes with the expected shape data.
- New nodes use the custom canvas node type.
-`npm run build` passes without type errors.
