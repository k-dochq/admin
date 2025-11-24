import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { type UserWithDetails } from '@/lib/types/user';

export interface MarketingAttributionData {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  landing_url: string | null;
  ts: number | null;
}

export const MARKETING_FIELD_LABELS: Array<{
  key: keyof Omit<MarketingAttributionData, 'ts'>;
  label: string;
}> = [
  { key: 'utm_source', label: 'UTM Source' },
  { key: 'utm_medium', label: 'UTM Medium' },
  { key: 'utm_campaign', label: 'UTM Campaign' },
  { key: 'utm_content', label: 'UTM Content' },
  { key: 'utm_term', label: 'UTM Term' },
  { key: 'referrer', label: 'Referrer' },
  { key: 'landing_url', label: 'Landing URL' },
];

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const getStringValue = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim() !== '') {
    return value;
  }
  return null;
};

const getNumberValue = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  return null;
};

export const extractMarketingAttribution = (
  user: UserWithDetails,
): MarketingAttributionData | null => {
  const rawMeta = user.raw_user_meta_data;

  if (!isRecord(rawMeta)) {
    return null;
  }

  const attribution = rawMeta.marketing_attribution;

  if (!isRecord(attribution)) {
    return null;
  }

  return {
    utm_source: getStringValue(attribution.utm_source),
    utm_medium: getStringValue(attribution.utm_medium),
    utm_campaign: getStringValue(attribution.utm_campaign),
    utm_content: getStringValue(attribution.utm_content),
    utm_term: getStringValue(attribution.utm_term),
    referrer: getStringValue(attribution.referrer),
    landing_url: getStringValue(attribution.landing_url),
    ts: getNumberValue(attribution.ts),
  };
};

export const formatMarketingTimestamp = (timestamp: number | null) => {
  if (!timestamp) {
    return '-';
  }

  return format(new Date(timestamp * 1000), 'yyyy.MM.dd HH:mm', { locale: ko });
};
