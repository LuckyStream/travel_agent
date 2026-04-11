import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ItineraryForm, { type ItineraryGeneratePayload } from "@/components/itinerary/ItineraryForm";
import ItineraryResult from "@/components/itinerary/ItineraryResult";
import {
  buildGeneratePlanBody,
  getGeneratePlanUrl,
  itemsToItineraryDays,
  type ApiItineraryItem,
} from "@/lib/generate-plan-client";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ItineraryDay } from "@/types/itinerary-ui";

export type { ItineraryDay, ItineraryStop } from "@/types/itinerary-ui";

const ItineraryPage = () => {
  const [searchParams] = useSearchParams();
  const sharedId = searchParams.get("shared");

  const [itinerary, setItinerary] = useState<ItineraryDay[] | null>(null);
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(3);
  const [loading, setLoading] = useState(false);
  const [loadingShared, setLoadingShared] = useState(!!sharedId);

  useEffect(() => {
    if (sharedId) {
      loadSharedItinerary(sharedId);
    }
  }, [sharedId]);

  const loadSharedItinerary = async (shareId: string) => {
    setLoadingShared(true);
    const { data, error } = await supabase
      .from("itineraries")
      .select("*")
      .eq("share_id", shareId)
      .single();

    if (error || !data) {
      toast.error("Could not load shared itinerary");
      setLoadingShared(false);
      return;
    }

    setDestination(data.destination);
    setDays(data.days);
    setItinerary(data.itinerary_data as unknown as ItineraryDay[]);
    setLoadingShared(false);
  };

  const generateItinerary = async (payload: ItineraryGeneratePayload) => {
    setLoading(true);
    setDestination(payload.destination);
    setDays(payload.days);
    setItinerary(null);

    try {
      const url = getGeneratePlanUrl();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildGeneratePlanBody(payload)),
      });
      const data = (await res.json()) as { items?: ApiItineraryItem[]; error?: string };

      if (!res.ok || !data.items?.length) {
        throw new Error(data.error || "No itinerary data returned");
      }

      setItinerary(itemsToItineraryDays(data.items, payload.morningPreference));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to generate itinerary";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!itinerary) return;

    try {
      const { data, error } = await supabase
        .from("itineraries")
        .insert({
          destination,
          days,
          itinerary_data: itinerary as any,
          preferences: [],
        })
        .select("share_id")
        .single();

      if (error) throw error;

      const url = `${window.location.origin}/itinerary?shared=${data.share_id}`;
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied to clipboard!");
    } catch (e: any) {
      toast.error("Failed to create share link");
    }
  };

  if (loadingShared) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
        {!itinerary && !loading && (
          <ItineraryForm onGenerate={(p) => void generateItinerary(p)} loading={loading} />
        )}

        {loading && (
          <div className="text-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground font-medium">
              Crafting your perfect {days}-day itinerary for {destination}…
            </p>
            <p className="text-sm text-muted-foreground/70">This may take a moment</p>
          </div>
        )}

        {itinerary && !loading && (
          <ItineraryResult
            itinerary={itinerary}
            destination={destination}
            days={days}
            onShare={handleShare}
            onReset={() => {
              setItinerary(null);
              setDestination("");
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default ItineraryPage;
