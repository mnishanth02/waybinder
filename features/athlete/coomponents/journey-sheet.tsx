"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useGetUsers } from "@/features/auth/hooks/use-auth-queries";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarIcon, Edit, MapPinIcon, TagIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import type { JourneyCreationFormValues } from "../athlete-validator";
import { useCreateJourney, useGetJourneyByUniqueId, useUpdateJourney } from "../hooks";
import { journeyKeys } from "../hooks/query-keys";
import { useJourneySheetStore } from "../store/use-journey-sheet-store";
import { JourneyForm } from "./journey-form";

// Legacy props interface for backward compatibility
interface JourneySheetProps {
  isOpen?: boolean;
  onClose?: () => void;
  isNewJourney?: boolean;
  journeyId?: string;
  initialMode?: "view" | "edit";
  setMode?: (mode: string) => void;
}

const JourneySheet = (props: JourneySheetProps = {}) => {
  // Get URL state using nuqs and register with store
  const [urlJourneyId, setUrlJourneyId] = useQueryState("journeyId", parseAsString.withDefault(""));
  const [urlMode, setUrlMode] = useQueryState("mode", parseAsString.withDefault(""));

  // Get state from Zustand store
  const {
    isOpen: storeIsOpen,
    journeyId: storeJourneyId,
    isNewJourney: storeIsNewJourney,
    mode: storeMode,
    closeSheet,
    setMode: setStoreMode,
    registerQueryStateSetters,
  } = useJourneySheetStore();

  // Register the nuqs setters with the store once
  useEffect(() => {
    registerQueryStateSetters(setUrlJourneyId, setUrlMode);
  }, [registerQueryStateSetters, setUrlJourneyId, setUrlMode]);

  // Determine component state with priority: props > store > URL
  const isOpen = props.isOpen !== undefined ? props.isOpen : storeIsOpen;
  const onClose = props.onClose || closeSheet;
  const isNewJourney = props.isNewJourney !== undefined ? props.isNewJourney : storeIsNewJourney;
  const journeyId = props.journeyId || storeJourneyId || urlJourneyId || "";
  const initialMode = props.initialMode || storeMode || (urlMode as "view" | "edit" | undefined);

  // Maintain internal view mode state
  const [viewMode, setViewMode] = useState<"view" | "edit">(initialMode || "view");
  const router = useRouter();
  const queryClient = useQueryClient();

  // URL state for mode

  // Fetch users when the sheet is opened
  const { data: userData, isLoading: isLoadingUsers } = useGetUsers();

  // Fetch journey data if journeyId is provided and it's not a new journey
  const { data: journeyData, isLoading: isLoadingJourney } = useGetJourneyByUniqueId(
    journeyId || "",
    {
      enabled: !!journeyId && isOpen && !isNewJourney,
      retry: 1,
    }
  );

  // Use the useCreateJourney hook for new journeys
  const { mutate: createJourney, isPending: isCreating } = useCreateJourney({
    onSuccess: () => {
      // Close the sheet
      onClose();
      // Refresh the page to show the new journey
      router.refresh();
    },
  });

  // Use the useUpdateJourney hook for existing journeys
  const { mutate: updateJourney, isPending: isUpdating } = useUpdateJourney(
    // Only use the journey ID if we have journey data and it's not a new journey
    !isNewJourney && journeyData ? journeyData.id : "",
    {
      onSuccess: () => {
        onClose();

        router.refresh();
      },
    }
  );

  // Initialize view mode based on props and update when props change
  useEffect(() => {
    if (isOpen) {
      // For new journeys, always use edit mode
      if (isNewJourney) {
        setViewMode("edit");
      }
      // For existing journeys, use the initialMode if provided
      else if (initialMode) {
        setViewMode(initialMode);
      }
    }
  }, [isOpen, isNewJourney, initialMode]);

  // Force refetch when journeyId changes and we're in edit mode for an existing journey
  useEffect(() => {
    // Only refetch when:
    // 1. We have a journeyId
    // 2. The sheet is open
    // 3. We're in edit mode
    // 4. It's NOT a new journey (we don't need to fetch for new journeys)
    if (journeyId && isOpen && viewMode === "edit" && !isNewJourney) {
      queryClient.invalidateQueries({ queryKey: journeyKeys.unique(journeyId) });
    }
  }, [journeyId, isOpen, viewMode, isNewJourney, queryClient]);

  // Format date to display in a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Toggle between view and edit modes
  const toggleEditMode = () => {
    const newMode = viewMode === "view" ? "edit" : "view";
    setViewMode(newMode);

    // Update store state
    setStoreMode(newMode);

    // For backward compatibility with URL state
    if (props.setMode && isOpen && !isNewJourney) {
      props.setMode(newMode);
    }
  };

  const handleSubmit = (data: JourneyCreationFormValues) => {
    const formattedData = {
      ...data,
      journeyType: data.journeyType,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
    };

    if (isNewJourney) {
      // Create new journey
      createJourney(formattedData);
    } else if (journeyData) {
      // Update existing journey
      updateJourney(formattedData);
    }
  };

  // Prepare default values for the form
  const getDefaultValues = () => {
    if (journeyData) {
      return {
        title: journeyData.title,
        description: journeyData.description || "",
        startDate: new Date(journeyData.startDate),
        endDate: new Date(journeyData.endDate),
        journeyType: journeyData.journeyType,
        location: journeyData.location || "",
        privacyStatus: journeyData.privacyStatus,
        tags: journeyData.tags || [],
        buddyIds: journeyData.buddyIds || [],
        memberNames: journeyData.memberNames || [],
        coverImageUrl: journeyData.coverImageUrl || "",
      };
    }
    return undefined;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full max-w-md overflow-y-auto border-l p-5 sm:max-w-xl"
      >
        <SheetHeader>
          <SheetTitle>
            {isNewJourney
              ? "Add New Journey"
              : viewMode === "edit"
                ? "Edit Journey"
                : "View Journey"}
          </SheetTitle>
        </SheetHeader>

        {viewMode === "edit" && isNewJourney && (
          <div className="mt-6">
            <JourneyForm
              onSubmit={handleSubmit}
              isSubmitting={isCreating}
              users={userData || []}
              isLoadingUsers={isLoadingUsers}
              isEditing={false}
            />
          </div>
        )}

        {viewMode === "edit" && !isNewJourney && isLoadingJourney && (
          <div className="mt-6">
            <p className="text-muted-foreground text-sm">Loading journey details...</p>
          </div>
        )}

        {viewMode === "edit" && !isNewJourney && !isLoadingJourney && journeyData && (
          <div className="mt-6">
            <JourneyForm
              onSubmit={handleSubmit}
              defaultValues={getDefaultValues()}
              isSubmitting={isUpdating}
              users={userData || []}
              isLoadingUsers={isLoadingUsers}
              isEditing={true}
            />
          </div>
        )}

        {viewMode === "edit" && !isNewJourney && !isLoadingJourney && !journeyData && (
          <div className="mt-6">
            <p className="text-muted-foreground text-sm">
              Journey not found or there was an error loading the journey.
            </p>
          </div>
        )}

        {viewMode === "view" && journeyData && (
          <div className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-xl">{journeyData.title}</h3>

              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {formatDate(journeyData.startDate)} - {formatDate(journeyData.endDate)}
                </span>
              </div>

              {journeyData.location && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{journeyData.location}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <TagIcon className="h-4 w-4" />
                <span>{journeyData.journeyType.replace(/_/g, " ")}</span>
              </div>

              {journeyData.description && (
                <div className="mt-4">
                  <h4 className="mb-2 font-medium text-sm">Description</h4>
                  <p className="whitespace-pre-wrap text-muted-foreground text-sm">
                    {journeyData.description}
                  </p>
                </div>
              )}
            </div>

            <Button onClick={toggleEditMode} className="w-full">
              <Edit className="mr-2 h-4 w-4" /> Edit Journey
            </Button>
          </div>
        )}

        {viewMode === "view" && !journeyData && !isLoadingJourney && (
          <div className="mt-6">
            <p className="text-muted-foreground text-sm">
              Journey not found or there was an error loading the journey.
            </p>
          </div>
        )}

        {viewMode === "view" && isLoadingJourney && (
          <div className="mt-6">
            <p className="text-muted-foreground text-sm">Loading journey details...</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default JourneySheet;
