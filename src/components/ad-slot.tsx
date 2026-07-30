import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_AD_SLOTS, getAdForPlacement, AdSlotConfig } from "@/lib/ad-config";
import { ExternalLink, Sparkles } from "lucide-react";
import { useEffect } from "react";

interface AdSlotProps {
  placementId: string;
  className?: string;
}

export function AdSlot({ placementId, className = "" }: AdSlotProps) {
  const { data: config, refetch } = useQuery<AdSlotConfig | null>({
    queryKey: ["ad_slot", placementId],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("ad_slots")
          .select("*")
          .eq("id", placementId)
          .maybeSingle();

        if (error) {
          console.warn("Supabase ad_slots query warning:", error.message);
        }

        if (data) {
          return {
            id: data.id,
            page: data.page,
            title: data.title,
            enabled: data.enabled,
            type: data.type,
            imageUrl: data.image_url ?? undefined,
            targetUrl: data.target_url ?? undefined,
            altText: data.alt_text ?? undefined,
            customCode: data.custom_code ?? undefined,
            badgeText: data.badge_text ?? undefined,
          };
        }
      } catch (err) {
        console.warn("Error fetching ad slot from database:", err);
      }

      // Fallback to local storage or DEFAULT_AD_SLOTS
      return getAdForPlacement(placementId) || DEFAULT_AD_SLOTS.find(s => s.id === placementId) || null;
    },
    staleTime: 1000 * 30, // Refetch every 30s
  });

  useEffect(() => {
    const handleUpdate = () => {
      refetch();
    };

    window.addEventListener("capient_ad_configs_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("capient_ad_configs_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [refetch]);

  if (!config || !config.enabled) {
    return null;
  }

  if (config.type === "html" && config.customCode) {
    return (
      <div 
        className={`w-full transition-all duration-300 ${className}`}
        dangerouslySetInnerHTML={{ __html: config.customCode }}
      />
    );
  }

  if (config.type === "image" && config.imageUrl) {
    const content = (
      <div className={`relative group w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-[#3DDC97]/40 ${className}`}>
        {/* Badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold text-[#3DDC97] uppercase tracking-wider">
          <Sparkles className="w-3 h-3" />
          {config.badgeText || "SPONSORED"}
        </div>

        {config.targetUrl && (
          <div className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white/70 group-hover:text-white transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        )}

        <img 
          src={config.imageUrl} 
          alt={config.altText || "Sponsored Banner"}
          className="w-full h-36 md:h-44 object-cover object-center transition-transform duration-500 group-hover:scale-[1.01]" 
        />
      </div>
    );

    if (config.targetUrl) {
      return (
        <a href={config.targetUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
          {content}
        </a>
      );
    }

    return content;
  }

  return null;
}
