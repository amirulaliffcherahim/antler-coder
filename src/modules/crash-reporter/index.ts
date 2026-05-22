let optedIn = false;

export function initCrashReporter(): void {
  // Check user preference from store
  try {
    const stored = localStorage.getItem("antler:crash-reporting");
    optedIn = stored === "opted-in";
  } catch {
    optedIn = false;
  }
}

export function isCrashReportingEnabled(): boolean {
  return optedIn;
}

export function setCrashReportingEnabled(enabled: boolean): void {
  optedIn = enabled;
  try {
    localStorage.setItem("antler:crash-reporting", enabled ? "opted-in" : "opted-out");
  } catch {
    // ignore
  }
}

export async function promptCrashReporting(): Promise<boolean> {
  // This would be called from the onboarding or settings
  // For now, returns current state
  return optedIn;
}
