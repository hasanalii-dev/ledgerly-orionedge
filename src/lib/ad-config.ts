export interface AdSlotConfig {
  id: string;
  page: string;
  title: string;
  enabled: boolean;
  type: "image" | "html";
  imageUrl?: string;
  targetUrl?: string;
  altText?: string;
  customCode?: string;
  badgeText?: string;
}

export const DEFAULT_AD_SLOTS: AdSlotConfig[] = [
  {
    id: "dashboard_banner",
    page: "Dashboard",
    title: "Dashboard Main Banner",
    enabled: true,
    type: "image",
    imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop",
    targetUrl: "https://example.com",
    altText: "Featured Financial Partner",
    badgeText: "SPONSORED",
    customCode: `<div style="padding: 20px; background: linear-gradient(135deg, rgba(61,220,151,0.15), rgba(16,185,129,0.05)); border: 1px solid rgba(61,220,151,0.3); border-radius: 16px; color: white;">
  <span style="font-size: 10px; font-weight: 700; background: rgba(61,220,151,0.2); color: #3DDC97; padding: 3px 8px; border-radius: 6px; text-transform: uppercase;">PROMOTION</span>
  <h3 style="font-size: 18px; font-weight: 700; margin-top: 8px; margin-bottom: 4px;">Exclusive Partner Deal</h3>
  <p style="font-size: 13px; color: #a1a1aa; margin-bottom: 12px;">Get up to 20% cashback on business expense tracking with our verified partner.</p>
  <a href="https://example.com" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 8px 16px; background: #3DDC97; color: black; font-weight: 700; font-size: 12px; border-radius: 8px; text-decoration: none;">Claim Now &rarr;</a>
</div>`
  }
];

const STORAGE_KEY = "capient_ad_configs";

export function getAdConfigs(): Record<string, AdSlotConfig> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaults: Record<string, AdSlotConfig> = {};
      DEFAULT_AD_SLOTS.forEach(slot => {
        defaults[slot.id] = slot;
      });
      return defaults;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading ad configs", e);
    const defaults: Record<string, AdSlotConfig> = {};
    DEFAULT_AD_SLOTS.forEach(slot => {
      defaults[slot.id] = slot;
    });
    return defaults;
  }
}

export function getAdForPlacement(placementId: string): AdSlotConfig | null {
  const configs = getAdConfigs();
  const config = configs[placementId];
  if (config && config.enabled) {
    return config;
  }
  return null;
}

export function saveAdConfig(config: AdSlotConfig): void {
  const current = getAdConfigs();
  current[config.id] = config;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  window.dispatchEvent(new Event("capient_ad_configs_updated"));
}
