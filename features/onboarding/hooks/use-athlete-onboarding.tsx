import type { AthleteOnboardingFormValues } from "@/lib/validations/athlete-onboarding";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAthleteOnboardingStore } from "../store/athlete-onboarding-store";

// Mock function for API call - replace with actual API endpoint
const submitAthleteOnboarding = async (data: AthleteOnboardingFormValues) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // In production, replace with actual API call
  return { success: true, data };
};

export function useAthleteOnboarding() {
  const router = useRouter();
  // Get the resetForm function from the store to clear form data after successful submission
  const resetForm = useAthleteOnboardingStore((state) => state.resetForm);

  return useMutation({
    mutationFn: (data: AthleteOnboardingFormValues) => submitAthleteOnboarding(data),
    onSuccess: () => {
      toast.success("Onboarding completed successfully!");
      // Reset the form data in the store
      resetForm();
      router.push("/dashboard"); // Redirect to dashboard after successful onboarding
    },
    onError: (error) => {
      toast.error("Failed to complete onboarding. Please try again.");
      console.error("Onboarding error:", error);
    },
  });
}
