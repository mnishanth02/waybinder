"use client";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect } from "react";
import { useJourneySheetStore } from "../store/use-journey-sheet-store";
import JourneyList from "./journey-list";
import JourneySheet from "./journey-sheet";

const AthleteDashboard = () => {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { openSheet } = useJourneySheetStore();

  // For backward compatibility with URL state - read only, no need to set
  const [selectedJourneyId] = useQueryState("journeyId", parseAsString.withDefault(""));
  const [mode] = useQueryState("mode", parseAsString.withDefault(""));

  // Handle journey selection and mode from URL parameters
  useEffect(() => {
    // Check if we're in "new" mode
    if (mode === "new") {
      // Open the sheet using the store
      openSheet(null, "new");
      return;
    }

    // If we have a journey ID but not in "new" mode, it's an existing journey
    if (selectedJourneyId) {
      // Open the sheet using the store with the appropriate mode
      openSheet(selectedJourneyId, (mode as "view" | "edit") || "view");
      return;
    }
  }, [selectedJourneyId, mode, openSheet]);

  // Function to open journey sheet with specific journey and mode
  // This uses the Zustand store which handles URL state internally
  const openJourneySheet = (journeyId: string | null, viewMode: "view" | "edit" | "new") => {
    openSheet(journeyId, viewMode);
  };

  return (
    <>
      <div className="flex-between">
        <h2 className="mb-4 font-bold text-2xl">Journeys</h2>
        <Button size={isMobile ? "icon" : "default"} onClick={() => openJourneySheet(null, "new")}>
          <Plus className="h-4 w-4" />
          {!isMobile && "Add New"}
        </Button>
      </div>
      <JourneyList
        onViewJourney={(id) => openJourneySheet(id, "view")}
        onAddActivity={(id) => router.push(`/journey/${id}`)}
      />
      {/* Use JourneySheet without props - it will use the Zustand store */}
      <JourneySheet />
    </>
  );
};

export default AthleteDashboard;
