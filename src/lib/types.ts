export type ConfigStatus = "active" | "expired";

export interface ConfigRecord {
  id: string;
  code: string;
  config: string;
  shareLink: string;
  createdAt: number;
  expiresAt: number;
  status: ConfigStatus;
}

export interface CreateResponse {
  code: string;
  shareLink: string;
  expiresAt: number;
  createdAt: number;
}

export interface PublicConfig {
  config: string;
  code: string;
  createdAt: number;
  expiresAt: number;
  status: ConfigStatus;
}
