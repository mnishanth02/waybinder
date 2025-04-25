"use client";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { Plus } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import JourneyList from "./journey-list";
import JourneySheet from "./journey-sheet";

const AthleteDashboard = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [selectedJourneyId, setSelectedJourneyId] = useQueryState(
    "journeyId",
    parseAsString.withDefault("")
  );

  const [mode, setMode] = useQueryState("mode", parseAsString.withDefault(""));

  const [isNewJourney, setIsNewJourney] = useState(false);

  // Handle journey selection and mode
  useEffect(() => {
    // Check if we're in "new" mode
    if (mode === "new") {
      setIsNewJourney(true);
      return;
    }

    // If we have a journey ID but not in "new" mode, it's an existing journey
    if (selectedJourneyId) {
      setIsNewJourney(false);
      return;
    }

    // Default case: no journey selected
    setIsNewJourney(false);
  }, [selectedJourneyId, mode]);

  // Function to open journey sheet with specific journey and mode
  const openJourneySheet = async (journeyId: string | null, viewMode: "view" | "edit" | "new") => {
    console.log("Opening journey sheet:", journeyId, viewMode);

    // For new journeys, we set mode="new" and don't set a journeyId
    if (viewMode === "new") {
      // Clear existing state first
      await setSelectedJourneyId("");
      if (mode !== "new") {
        await setMode("new");
      }
    } else if (journeyId) {
      // For existing journeys, clear existing state first
      await setSelectedJourneyId("");
      if (mode) {
        await setMode("");
      }

      // Small delay to ensure state is cleared
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Then set both journey ID and mode
      await setSelectedJourneyId(journeyId);
      await setMode(viewMode);
    }
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
        onEditJourney={(id) => openJourneySheet(id, "edit")}
      />
      <JourneySheet
        isOpen={!!selectedJourneyId || mode === "new"}
        onClose={async () => {
          // Clear the journey ID first
          await setSelectedJourneyId("");
          // Then clear the mode
          if (mode) {
            await setMode("");
          }
        }}
        isNewJourney={isNewJourney}
        journeyId={isNewJourney ? undefined : selectedJourneyId}
        initialMode={mode === "new" ? "edit" : mode ? (mode as "view" | "edit") : undefined}
        setMode={setMode}
      />
    </>
  );
};

export default AthleteDashboard;
