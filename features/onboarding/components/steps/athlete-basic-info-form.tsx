"use client";
import { DatePickerWithLabel } from "@/components/custom/date-picker-with-label";
import { InputWithLabel } from "@/components/custom/input-with-label";
import { SelectWithLabel } from "@/components/custom/select-with-label";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAthleteOnboardingStore } from "@/features/onboarding/store/athlete-onboarding-store";
import {
  type BasicInfoFormValues,
  basicInfoStepSchema,
} from "@/lib/validations/athlete-onboarding";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface AthleteBasicInfoFormProps {
  onNext: () => void;
}

export function AthleteBasicInfoForm({ onNext }: AthleteBasicInfoFormProps) {
  const updateBasicInfo = useAthleteOnboardingStore((state) => state.updateBasicInfo);
  const basicInfo = useAthleteOnboardingStore((state) => state.basicInfo);
  // State for image previews
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    basicInfo.profileImageUrl || null
  );
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(
    basicInfo.coverPhotoUrl || null
  );

  const mergedDefaults = {
    ...basicInfo,
    dateOfBirth: basicInfo.dateOfBirth ? new Date(basicInfo.dateOfBirth) : undefined,
  };

  const form = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoStepSchema),
    defaultValues: mergedDefaults, // Use the correctly merged defaults
  });

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "profileImage" | "coverPhoto"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue(fieldName, file);
      form.trigger(fieldName);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          if (fieldName === "profileImage") {
            setProfileImagePreview(event.target.result as string);
            // Persist both file and data URL in zustand
            updateBasicInfo({ profileImage: file, profileImageUrl: event.target.result as string });
          } else {
            setCoverPhotoPreview(event.target.result as string);
            updateBasicInfo({ coverPhoto: file, coverPhotoUrl: event.target.result as string });
          }
        }
      };
      reader.readAsDataURL(file);
    } else {
      form.setValue(fieldName, null);
      form.trigger(fieldName);
      if (fieldName === "profileImage") {
        setProfileImagePreview(null);
        updateBasicInfo({ profileImage: null, profileImageUrl: "" });
      } else {
        setCoverPhotoPreview(null);
        updateBasicInfo({ coverPhoto: null, coverPhotoUrl: "" });
      }
    }
    e.target.value = "";
  };

  const removeImage = (fieldName: "profileImage" | "coverPhoto") => {
    form.setValue(fieldName, null);
    if (fieldName === "profileImage") {
      setProfileImagePreview(null);
      updateBasicInfo({ profileImage: null, profileImageUrl: "" });
    } else {
      setCoverPhotoPreview(null);
      updateBasicInfo({ coverPhoto: null, coverPhotoUrl: "" });
    }
  };

  // Clean up URL objects on unmount
  useEffect(() => {
    return () => {
      if (profileImagePreview) URL.revokeObjectURL(profileImagePreview);
      if (coverPhotoPreview) URL.revokeObjectURL(coverPhotoPreview);
    };
  }, [profileImagePreview, coverPhotoPreview]);

  // Replace onSubmit with local handler
  const handleSubmit = (values: BasicInfoFormValues) => {
    updateBasicInfo({
      ...values,
      profileImageUrl: profileImagePreview || "",
      coverPhotoUrl: coverPhotoPreview || "",
    });
    onNext();
  };

  // Gender options for SelectWithLabel
  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "non-binary", label: "Non-binary" },
    { value: "prefer-not-to-say", label: "Prefer not to say" },
  ];

  return (
    <Form {...form}>
      <form id="basic-info-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Profile Header: Cover Photo, Profile Image (left), Name (right) */}
        <div className="relative w-full">
          {/* Cover Photo as background */}
          <div className=" h-32 w-full overflow-hidden rounded-xl bg-secondary sm:h-40">
            {coverPhotoPreview ? (
              <div className="group/cover relative h-full w-full">
                <Image
                  src={coverPhotoPreview}
                  alt="Cover"
                  fill
                  className=" object-cover"
                  style={{ objectFit: "cover" }}
                  priority={true}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-20 h-7 w-7 border border-gray-200 bg-white/80 p-1 opacity-0 shadow-sm transition-opacity hover:cursor-pointer hover:bg-white/100 group-hover/cover:opacity-100"
                  type="button"
                  onClick={() => removeImage("coverPhoto")}
                  aria-label="Remove cover photo"
                >
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center">
                <Label
                  htmlFor="cover-photo-upload"
                  className="flex cursor-pointer flex-col items-center justify-center"
                >
                  <div className="mb-2 rounded-full bg-primary/10 p-2">
                    <ImageIcon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-medium text-sm">Upload Cover Photo</span>
                  <span className="text-muted-foreground text-xs">Recommended: 1200×400px</span>
                  <Input
                    id="cover-photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "coverPhoto")}
                  />
                </Label>
              </div>
            )}
            {/* Overlay: Profile image and name row */}
            <div className="absolute bottom-0 left-0 flex w-full items-center gap-6 bg-gradient-to-t from-black/30 via-black/10 to-transparent px-6 py-4">
              {/* Profile Image */}
              <div className="group -mb-8 sm:-mb-12 relative h-20 w-20 overflow-hidden rounded-full border-4 border-background bg-secondary sm:h-28 sm:w-28">
                {profileImagePreview ? (
                  <>
                    <Image
                      src={profileImagePreview}
                      alt="Profile"
                      fill
                      className="object-cover"
                      style={{ objectFit: "cover" }}
                      priority={true}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 z-10 h-7 w-7 border border-gray-200 bg-white/80 p-1 opacity-0 shadow-sm transition-opacity hover:cursor-pointer hover:bg-white/100 group-hover:opacity-100"
                      type="button"
                      onClick={() => removeImage("profileImage")}
                      aria-label="Remove profile photo"
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </>
                ) : (
                  <label
                    htmlFor="profile-image-upload"
                    className="flex h-full w-full cursor-pointer flex-col items-center justify-center"
                  >
                    <Camera className="mb-1 h-6 w-6 text-muted-foreground" />
                    <span className="text-center font-medium text-xs">Add Profile Photo</span>
                    <Input
                      id="profile-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "profileImage")}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
        <Separator />

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <h3 className="font-medium">Personal Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputWithLabel
                nameInSchema="firstName"
                fieldTitle="First Name"
                placeholder="Enter first name"
              />
              <InputWithLabel
                nameInSchema="lastName"
                fieldTitle="Last Name"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <InputWithLabel
            nameInSchema="email"
            fieldTitle="Email Address"
            placeholder="your.email@example.com"
            type="email"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DatePickerWithLabel
              nameInSchema="dateOfBirth"
              fieldTitle="Date of Birth"
              placeholder="Select date of birth"
            />

            <SelectWithLabel
              nameInSchema="gender"
              fieldTitle="Gender"
              placeholder="Select gender"
              options={genderOptions}
            />
          </div>

          <InputWithLabel
            nameInSchema="displayName"
            fieldTitle="Display Name"
            placeholder="How you'll appear on Waybinder"
          />

          <InputWithLabel
            nameInSchema="location"
            fieldTitle="Location"
            placeholder="City, State, Country"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit">Continue</Button>
        </div>
      </form>
    </Form>
  );
}
