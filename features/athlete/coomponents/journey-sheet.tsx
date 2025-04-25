"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useGetUsers } from "@/features/auth/hooks/use-auth-queries";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCreateJourney } from "../hooks";
import type { JourneyCreationFormValues } from "../journey-validator";
import { JourneyForm } from "./journey-form";

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
  const router = useRouter();

  // Fetch users when the sheet is opened
  const { data: userData, isLoading: isLoadingUsers } = useGetUsers();

  // Use the useCreateJourney hook
  const { mutate: createJourney, isPending } = useCreateJourney({
    onSuccess: () => {
      // Close the sheet
      onClose();

      // Refresh the page to show the new journey
      router.refresh();
    },
  });

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

  const handleSubmit = (data: JourneyCreationFormValues) => {
    // Call the createJourney mutation

    console.log(data);

    createJourney({
      ...data,
      journeyType: data.journeyType, // Ensure journeyType is explicitly passed
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full max-w-md overflow-y-auto border-l p-5 sm:max-w-xl"
      >
        <SheetHeader>
          <SheetTitle>{isNewJourney ? "Add New Journey" : "Edit Journey"}</SheetTitle>
        </SheetHeader>

        {viewMode === "edit" && (
          <div className="mt-6">
            <JourneyForm
              onSubmit={handleSubmit}
              isSubmitting={isPending}
              users={userData || []}
              isLoadingUsers={isLoadingUsers}
            />
          </div>
        )}

        {viewMode === "view" && (
          <div className="mt-6">
            <p className="text-muted-foreground text-sm">
              View mode will be implemented in the future.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default JourneySheet;
