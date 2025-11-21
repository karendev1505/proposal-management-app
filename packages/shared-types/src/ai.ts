export interface PricingHistoryItem {
  projectDescription: string;
  price: number;
  currency: string;
  date: string;
  accepted: boolean;
}

export interface AIUsageMetadata {
  tone?: string;
  sections?: string[];
  promptTokens?: number;
  completionTokens?: number;
  [key: string]: unknown;
}

