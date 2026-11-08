export type BackendMode = "live" | "demo_fallback";

export type ConnectionStatus = "connected" | "offline" | "checking" | "error";

export interface BackendConfig {
  baseUrl: string;
  mode: BackendMode;
  status: ConnectionStatus;
  lastCheckedAt?: string;
  errorMessage?: string;
  latencyMs?: number;
}
