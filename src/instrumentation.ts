export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getSyncSettings, executeSync } = await import("@/lib/google-sync");

    console.log("[Instrumentation] Starting Samora Store Background Sync Monitor...");

    // Run safe initial check after 10s
    setTimeout(async () => {
      try {
        const settings = await getSyncSettings();
        if (settings.googleSyncEnabled) {
          console.log("[Auto-Sync] Performing scheduled check...");
          await executeSync("auto");
        }
      } catch (err) {
        console.warn("[Auto-Sync Initial Error]", err);
      }
    }, 10000);

    // Continuous interval background loop
    setInterval(async () => {
      try {
        const settings = await getSyncSettings();
        if (settings.googleSyncEnabled) {
          const intervalMs = (settings.googleSyncIntervalSeconds || 60) * 1000;
          const lastSync = settings.googleLastSyncAt ? new Date(settings.googleLastSyncAt).getTime() : 0;
          const now = Date.now();

          if (now - lastSync >= intervalMs) {
            console.log(`[Auto-Sync] Background interval elapsed (${settings.googleSyncIntervalSeconds}s). Executing sync...`);
            await executeSync("auto");
          }
        }
      } catch (e) {
        console.warn("[Auto-Sync Loop Error]", e);
      }
    }, 30000); // Check tick every 30 seconds
  }
}
