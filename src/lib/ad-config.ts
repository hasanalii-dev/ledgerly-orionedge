import { supabase } from "@/integrations/supabase/client";

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
    type: "html",
    imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop",
    targetUrl: "http://orionedgedigital.com/websitedevelopment.html",
    altText: "Featured Financial Partner",
    badgeText: "Featured",
    customCode: `<!-- ORION EDGE DIGITAL AD BANNER WITH FEATURED BADGE -->
<style>
  .orion-ad-wrapper {
    position: relative;
    width: 100%;
    margin-top: 10px;
  }

  .orion-featured-badge {
    position: absolute;
    top: -10px;
    right: 24px;
    z-index: 10;
    background: linear-gradient(90deg, #0070f3 0%, #0057ff 100%);
    color: #ffffff;
    font-family: 'Samsung Sharp Sans', sans-serif;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 3px 12px;
    border-radius: 50px;
    box-shadow: 0 4px 14px rgba(0, 112, 243, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.4);
  }

  .orion-edge-ad {
    position: relative;
    background: #030508;
    border: 1px solid rgba(0, 112, 243, 0.35);
    border-radius: 20px;
    padding: 20px 26px;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    width: 100%;
    box-shadow: none;
  }

  .orion-edge-ad::before {
    content: '';
    position: absolute;
    top: -40%;
    right: -25%;
    width: 75%;
    height: 180%;
    background: radial-gradient(ellipse at 100% 50%, rgba(0, 153, 255, 0.35) 0%, rgba(0, 87, 255, 0.12) 50%, transparent 75%);
    pointer-events: none;
    z-index: 0;
  }

  .orion-edge-ad::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(rgba(56, 189, 248, 0.12) 1px, transparent 1px),
      linear-gradient(90deg, rgba(56, 189, 248, 0.12) 1px, transparent 1px);
    background-size: 36px 36px;
    mask-image: radial-gradient(circle at 95% 50%, black 0%, transparent 35%);
    -webkit-mask-image: radial-gradient(circle at 95% 50%, black 0%, transparent 35%);
    pointer-events: none;
    z-index: 0;
  }

  .orion-bg-logo {
    position: absolute;
    right: -55px;
    bottom: -55px;
    height: 195px;
    width: auto;
    opacity: 0.5;
    pointer-events: none;
    z-index: 2;
    filter: brightness(2.2) contrast(1.3);
  }

  .orion-edge-left {
    position: relative;
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    gap: 6px;
  }

  .orion-edge-logo-main {
    height: 34px;
    width: auto;
    object-fit: contain;
    margin-bottom: 2px;
    align-self: flex-start;
  }

  .orion-edge-title {
    font-family: 'Samsung Sharp Sans', sans-serif;
    font-size: 19px;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
    line-height: 1.25;
    letter-spacing: -0.4px;
  }

  .orion-catalyst {
    background: linear-gradient(90deg, #38bdf8 0%, #0057ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: transparent;
  }

  .orion-edge-desc {
    font-family: 'Questrial', sans-serif;
    color: #94a3b8;
    font-size: 13px;
    margin: 2px 0 0 0;
    line-height: 1.4;
  }

  .orion-edge-btn {
    position: relative;
    z-index: 3;
    flex-shrink: 0;
    white-space: nowrap;
    background: #ffffff;
    color: #000000;
    text-decoration: none;
    padding: 12px 28px;
    border-radius: 50px;
    font-family: 'Samsung Sharp Sans', sans-serif;
    font-weight: 800;
    font-size: 13px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(255, 255, 255, 0.2);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: none;
    overflow: hidden;
  }

  .orion-edge-btn::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -60%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      60deg,
      transparent 30%,
      rgba(255, 255, 255, 0.85) 50%,
      transparent 70%
    );
    transform: rotate(25deg) translateX(-100%);
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .orion-edge-btn:hover {
    background: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(255, 255, 255, 0.4);
  }

  .orion-edge-btn:hover::after {
    transform: rotate(25deg) translateX(100%);
  }

  @media (max-width: 640px) {
    .orion-edge-ad {
      flex-direction: column;
      align-items: flex-start;
      padding: 20px 18px;
      gap: 16px;
    }
    .orion-edge-logo-main {
      height: 28px;
    }
    .orion-edge-btn {
      width: 100%;
      justify-content: center;
    }
    .orion-bg-logo {
      height: 145px;
      right: -35px;
      bottom: -35px;
    }
  }
</style>

<div class="orion-ad-wrapper">
  <div class="orion-featured-badge">Featured</div>
  <div class="orion-edge-ad">
    <img src="https://orionedgedigital.com/img/symbol.png" alt="" class="orion-bg-logo" />
    <div class="orion-edge-left">
      <img src="https://orionedgedigital.com/img/symbol.png" alt="Orion Edge Logo" class="orion-edge-logo-main" />
      <h4 class="orion-edge-title">We Are The <span class="orion-catalyst">Catalyst</span> For Your Digital Evolution</h4>
      <p class="orion-edge-desc">Strategy, high-converting design, and 2.9x faster creative workflows for your brand.</p>
    </div>
    <a href="http://orionedgedigital.com/websitedevelopment.html" target="_blank" rel="noopener noreferrer" class="orion-edge-btn">
      Start Project &rarr;
    </a>
  </div>
</div>
<!-- END ORION EDGE DIGITAL AD BANNER -->`
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

  // Also push directly to Supabase ad_slots table for global database syncing across all accounts!
  (supabase as any)
    .from("ad_slots")
    .upsert({
      id: config.id,
      page: config.page,
      title: config.title,
      enabled: config.enabled,
      type: config.type,
      image_url: config.imageUrl || null,
      target_url: config.targetUrl || null,
      alt_text: config.altText || null,
      custom_code: config.customCode || null,
      badge_text: config.badgeText || null,
      updated_at: new Date().toISOString(),
    })
    .then(({ error }: any) => {
      if (error) console.error("Supabase ad_slots sync error:", error);
    });
}
