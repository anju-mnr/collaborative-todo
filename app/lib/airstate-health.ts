// AirState connection health checker
export function checkAirStateHealth() {
  if (typeof window === "undefined") return false;
  
  console.log("🔍 Checking AirState service health...");
  
  // Try to ping AirState servers
  fetch('https://server.airstate.dev/health', { 
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache'
  })
  .then(response => {
    if (response.ok) {
      console.log("✅ AirState servers are reachable");
      return response.text();
    } else {
      console.log(`⚠️  AirState server responded with status: ${response.status}`);
      throw new Error(`HTTP ${response.status}`);
    }
  })
  .then(data => {
    console.log("📡 AirState health check response:", data);
  })
  .catch(error => {
    console.error("❌ AirState servers may be unreachable:", error);
    console.log("💡 This could explain the connection issues. AirState services might be down.");
  });
}

// Check if WebSocket connections are being rejected due to rate limiting
export function analyzeConnectionPattern() {
  if (typeof window === "undefined") return;
  
  const connectionTimes: number[] = [];
  
  return {
    recordConnection: () => {
      const now = Date.now();
      connectionTimes.push(now);
      
      // Keep only last 10 connections
      if (connectionTimes.length > 10) {
        connectionTimes.shift();
      }
      
      // Check for rapid reconnection pattern (potential rate limiting)
      if (connectionTimes.length >= 3) {
        const timeSpan = now - connectionTimes[0];
        const avgInterval = timeSpan / (connectionTimes.length - 1);
        
        if (avgInterval < 2000) { // Less than 2 seconds between connections
          console.log("⚠️  Rapid reconnection pattern detected - possible rate limiting");
          console.log(`📊 ${connectionTimes.length} connections in ${timeSpan}ms (avg: ${avgInterval.toFixed(0)}ms)`);
          return true; // Rate limited
        }
      }
      
      return false; // Not rate limited
    }
  };
}