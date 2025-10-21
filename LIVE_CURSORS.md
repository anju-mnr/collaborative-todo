# Live Cursors Component

The `LiveCursors` component provides real-time cursor tracking for all users in a collaborative session using Airstate's shared state functionality.

## Features

- **Real-time cursor tracking**: Shows the mouse position of all users in the room
- **User identification**: Each cursor displays the user's name and uses their unique color
- **Performance optimized**: Throttled updates (50ms intervals) to reduce network traffic
- **Automatic cleanup**: Removes stale cursors after 5 seconds of inactivity
- **Smooth animations**: CSS transitions for fluid cursor movement
- **Visual enhancements**: Drop shadows, pulse animation, and colorful labels

## Implementation Details

### Shared State Pattern
Instead of using `useSharedPresence` directly (which had compatibility issues), the component uses `useSharedState` with a dedicated cursor state:

```typescript
interface CursorPosition {
  x: number
  y: number
  lastUpdate: number
  userId: string
}

type CursorState = {
  cursors: Record<string, CursorPosition>
}
```

### Throttling
Mouse movements are throttled to 20fps (50ms intervals) to prevent overwhelming the network with position updates while maintaining smooth visual feedback.

### Cleanup
- Stale cursors (older than 5 seconds) are automatically removed every 2 seconds
- User cursors are removed when they leave the page or stop moving their mouse

## Usage

Simply import and add the component to your main application layout:

```tsx
import LiveCursors from "@/app/components/LiveCursors"

export default function App() {
  return (
    <div>
      {/* Your app content */}
      <LiveCursors />
    </div>
  )
}
```

The component automatically:
1. Connects to the same room as other components using `roomKey`
2. Shows cursors only for other users (not the current user)
3. Uses user information from the existing presence system
4. Handles all mouse event listeners and cleanup

## Styling

The cursor uses a custom SVG pointer shape with:
- User's color scheme
- White border for visibility
- Drop shadow for depth
- Animated name label with backdrop blur

## Browser Compatibility

Requires modern browsers with support for:
- CSS transforms
- CSS transitions
- Mouse events
- WebSocket connections (via Airstate)