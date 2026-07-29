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
    customCode: `<!-- ORION EDGE PREMIUM SAAS AD SPACE -->
<style>
  .orion-ad-banner {
    position: relative;
    background: linear-gradient(135deg, #0b0f0d 0%, #0d1410 100%);
    border: 1px solid rgba(61, 220, 151, 0.25);
    border-radius: 18px;
    padding: 18px 24px;
    font-family: 'Questrial', 'Inter', system-ui, sans-serif;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    width: 100%;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  }
  .orion-ad-banner::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -20%;
    width: 60%;
    height: 200%;
    background: radial-gradient(circle, rgba(61, 220, 151, 0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .orion-ad-left {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    text-align: left;
  }
  .orion-ad-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(61, 220, 151, 0.1);
    border: 1px solid rgba(61, 220, 151, 0.3);
    color: #3DDC97;
    padding: 3px 10px;
    border-radius: 50px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    width: fit-content;
  }
  .orion-ad-title {
    font-size: 17px;
    font-weight: 700;
    color: #ffffff;
    margin: 2px 0 0 0;
    line-height: 1.3;
  }
  .orion-text-emerald {
    color: #3DDC97;
  }
  .orion-ad-desc {
    color: #94a3b8;
    font-size: 12px;
    margin: 0;
    line-height: 1.4;
  }
  .orion-ad-btn {
    position: relative;
    z-index: 1;
    shrink: 0;
    white-space: nowrap;
    background: #3DDC97;
    color: #050806;
    text-decoration: none;
    padding: 10px 22px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 13px;
    transition: all 0.25s ease;
    box-shadow: 0 4px 14px rgba(61, 220, 151, 0.25);
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .orion-ad-btn:hover {
    background: #4ef0ab;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(61, 220, 151, 0.4);
  }
  @media (max-width: 640px) {
    .orion-ad-banner {
      flex-direction: column;
      align-items: flex-start;
      padding: 16px;
      gap: 14px;
    }
    .orion-ad-btn {
      width: 100%;
      justify-content: center;
    }
  }
</style>

<div class="orion-ad-banner">
  <div class="orion-ad-left">
    <div class="orion-ad-badge">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
      Exclusive Offer
    </div>
    <h4 class="orion-ad-title">Supercharge Your <span class="orion-text-emerald">Digital Growth</span></h4>
    <p class="orion-ad-desc">Get 20% cashback on cloud infrastructure and automated expense tracking with our partner.</p>
  </div>
  <a href="#claim" class="orion-ad-btn">
    Claim Offer &rarr;
  </a>
</div>
<!-- END ORION EDGE PREMIUM SAAS AD SPACE -->`
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
