Add resizing and inline label editing to canvas nodes.

## Progress

- [x] Read the node editing spec, local Next.js client component docs, and Liveblocks React Flow guidance.
- [x] Add selected-node resize handles with minimum dimensions.
- [x] Wire resize changes through the existing React Flow node change flow.
- [x] Add centered inline label display and textarea editing.
- [x] Sync label edits through the existing collaborative node state.
- [x] Prevent label editing interactions from dragging or panning the canvas.
- [x] Run lint and production build verification.

## Implementation

Add resizing.

selected nodes should show resize handles
prevent nodes from being resized below a minimum size
keep resize handles subtle and consistent with the dark canvas UI
Add inline label editing.

keep the node label centered inside the node
double-click the center/label area of a node to edit its label
show placeholder text in the same centered position when the label is empty
keep editing smooth without causing layout shifts
show a textarea directly over the label while editing
update the label as users type
close editing on blur or Escape
prevent text editing interactions from dragging or panning the canvas
Keep all node updates connected to the existing collaborative canvas state.

## Scope Limits

don't change shape rendering from the previous unit
don't change the shape panel or drag preview
don't change how dropped nodes are created
keep this focused on resize and label editing only

## Check When Done

Selected nodes show resize handles.
Resizing updates node dimensions through the existing node state flow.
Double-clicking a node opens inline label editing.
Label editing updates node labels through the existing sync flow.
Editing closes on blur or Escape.
Text interactions do not trigger canvas drag or pan.
npm run build passes without type errors.
