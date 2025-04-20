"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useEffect, useState } from "react";

const JourneySheet = ({
  isOpen,
  onClose,
  isNewJourney,
}: {
  isOpen: boolean;
  onClose: () => void;
  isNewJourney: boolean;
}) => {
  const [viewMode, setViewMode] = useState<"view" | "edit">("view");

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setViewMode("view");
      }, 300);
      return () => clearTimeout(timer);
    }

    if (isNewJourney) {
      setViewMode("edit");
    } else if (isOpen && !viewMode.includes("edit")) {
      setViewMode("view");
    }
  }, [isOpen, isNewJourney, viewMode]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full max-w-md overflow-y-auto border-l p-5 sm:max-w-xl"
      >
        <SheetHeader>
          <SheetTitle>{isNewJourney ? "Add New Journey" : "Edit Journey"}</SheetTitle>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default JourneySheet;
