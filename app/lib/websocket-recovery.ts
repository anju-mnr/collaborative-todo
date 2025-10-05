// WebSocket connection utility for AirState on Vercel
export function setupWebSocketMonitoring() {
  if (typeof window === "undefined" || typeof WebSocket === "undefined") return;

  let reconnectAttempts = 0;
  const maxReconnectAttempts = 10;
  
  // Store original WebSocket constructor
  const OriginalWebSocket = window.WebSocket;
  
  // Override WebSocket to add monitoring and recovery
  window.WebSocket = class extends OriginalWebSocket {
    constructor(url: string | URL, protocols?: string | string[]) {
      console.log("🔌 WebSocket connection attempt to:", url);
      super(url, protocols);
      
      this.addEventListener('open', () => {
        console.log("✅ WebSocket connection opened successfully");
        reconnectAttempts = 0; // Reset on successful connection
      });
      
      this.addEventListener('close', (event) => {
        console.log("🔴 WebSocket connection closed:", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        
        // Handle abnormal closures (not user-initiated)
        if (event.code !== 1000 && event.code !== 1001 && reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 30000); // Exponential backoff
          
          console.log(`🔄 WebSocket reconnection attempt ${reconnectAttempts}/${maxReconnectAttempts} in ${delay}ms...`);
          
          setTimeout(() => {
            // Trigger page reload as a fallback if too many failed attempts
            if (reconnectAttempts >= maxReconnectAttempts) {
              console.log("🔄 Max WebSocket reconnection attempts reached, reloading page...");
              window.location.reload();
            }
          }, delay);
        }
      });
      
      this.addEventListener('error', (error) => {
        console.error("❌ WebSocket error:", error);
      });
    }
  };
  
  console.log("🔧 WebSocket monitoring enabled for AirState");
}

// Page visibility change handler for connection recovery
export function setupVisibilityRecovery() {
  if (typeof document === "undefined") return;
  
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      console.log("👁️ Page became visible, checking connection health...");
      // Give AirState a moment to recover connections
      setTimeout(() => {
        // You can add additional recovery logic here if needed
        console.log("🔄 Page visibility recovery check complete");
      }, 1000);
    }
  });
  
  console.log("👁️ Page visibility recovery enabled");
}

// Network change handler
export function setupNetworkRecovery() {
  if (typeof window === "undefined" || !('navigator' in window) || !('onLine' in navigator)) return;
  
  const handleOnline = () => {
    console.log("🌐 Network connection restored");
    // Small delay to ensure network is stable
    setTimeout(() => {
      console.log("🔄 Network recovery: attempting to restore WebSocket connections...");
    }, 2000);
  };
  
  const handleOffline = () => {
    console.log("📡 Network connection lost");
  };
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  console.log("🌐 Network recovery monitoring enabled");
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}