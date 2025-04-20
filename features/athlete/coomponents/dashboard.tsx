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

  const [isNewJourney, setIsNewJourney] = useState(false);

  useEffect(() => {
    if (!selectedJourneyId) {
      setIsNewJourney(false);
      return;
    }

    if (selectedJourneyId === "new") {
      setIsNewJourney(true);
      return;
    }

    setIsNewJourney(false);
  }, [selectedJourneyId]);

  return (
    <>
      <div className="flex-between">
        <h2 className="mb-4 font-bold text-2xl">Journeys</h2>
        <Button size={isMobile ? "icon" : "default"} onClick={() => setSelectedJourneyId("new")}>
          <Plus className="h-4 w-4" />
          {!isMobile && "Add New"}
        </Button>
      </div>
      <JourneyList />
      <JourneySheet
        isOpen={!!selectedJourneyId}
        onClose={() => setSelectedJourneyId("")}
        isNewJourney={isNewJourney}
      />
    </>
  );
};

export default AthleteDashboard;
