"use client";

import AppDialog from "@/components/common/app-dialog";
import { useDeleteJourney } from "@/features/athlete/hooks";
import { useRouter } from "next/navigation";

interface DeleteJourneyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  journeyId: string;
  journeyTitle: string;
}

const DeleteJourneyDialog = ({
  isOpen,
  onOpenChange,
  journeyId,
  journeyTitle,
}: DeleteJourneyDialogProps) => {
  const router = useRouter();

  const { mutate: deleteJourney, isPending } = useDeleteJourney(journeyId, {
    onSuccess: () => {
      router.push("/");
    },
  });

  const handleDelete = () => {
    deleteJourney();
  };

  return (
    <AppDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      title="Delete Journey"
      message={`Are you sure you want to delete "${journeyTitle}"? This action cannot be undone.`}
      primaryButton={{
        text: isPending ? "Deleting..." : "Delete Journey",
        variant: "destructive",
        onClick: handleDelete,
      }}
      secondaryButton={{
        text: "Cancel",
        variant: "outline",
      }}
    />
  );
};

export default DeleteJourneyDialog;
