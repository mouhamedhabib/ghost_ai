Add a small floating color toolbar so selected nodes can change both their background and text color directly on the canvas.

## Progress

- [x] Read the color toolbar spec, `ui-context.md`, local Next.js client component docs, and Liveblocks React Flow guidance.
- [x] Add predefined node background/text color pairs as canvas constants.
- [x] Extend canvas node data with synced text color.
- [x] Add a floating selected-node color toolbar with active and hover swatch states.
- [x] Update node background and text colors through the existing collaborative node state.
- [x] Prevent toolbar interactions from dragging nodes or panning the canvas.
- [x] Run lint and production build verification.

## Implementation

1. Check `ui-context.md` for the node color palette.
   Each palette option includes:
   - a node background color
   - a matching text color

   Reuse existing theme colors if they already exist in the `global.css`. Otherwise, keep the palette in the canvas types/constants, such as `types/canvas.ts`.

2. Add a toolbar above selected nodes.
   - only show it when the node is selected
   - keep it slightly above the node without overlapping it
   - show one swatch per color pair
   - active swatches should feel clearly selected
   - hovering a swatch should show a subtle glow based on its text color
   - keep the glow tight and controlled, not overly blurred
   - prevent toolbar interactions from dragging nodes or panning the canvas

3. When a swatch is selected:
   - update both the node background color and text color
   - update the node UI immediately
   - keep this inside the existing collaborative canvas state
   - no server calls

4. Selected nodes should visually reflect their active color pair.

   The node background updates to the selected color, and the text automatically updates to its paired text color.

## Scope Limits

- don’t change drag/drop behavior
- don’t rebuild node selection logic
- don’t add a full color picker
- keep this focused on predefined color themes only

## Check When Done

- Nodes use predefined background/text color pairs.
- Selected nodes show a floating color toolbar.
- Swatch selection updates both node and text colors.
- `npm run build` passes without type errors.
