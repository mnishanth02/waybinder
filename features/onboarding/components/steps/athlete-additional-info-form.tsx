"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAthleteOnboardingStore } from "@/features/onboarding/store/athlete-onboarding-store";
import { cn } from "@/lib/utils";
import {
  type AdditionalInfoFormValues,
  additionalInfoStepSchema,
} from "@/lib/validations/athlete-onboarding";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Check, Globe, Link2, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { type FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

interface AthleteAdditionalInfoFormProps {
  onNext: () => void;
  onBack: () => void;
}

// Blood group options
const bloodGroups = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
  { value: "unknown", label: "Unknown" },
];

// Social media platforms
const socialPlatforms = [
  { value: "website", label: "Website", icon: <Globe className="h-4 w-4" /> },
  { value: "strava", label: "Strava", icon: <Link2 className="h-4 w-4" /> },
  { value: "instagram", label: "Instagram", icon: <Link2 className="h-4 w-4" /> },
  { value: "facebook", label: "Facebook", icon: <Link2 className="h-4 w-4" /> },
  { value: "twitter", label: "Twitter", icon: <Link2 className="h-4 w-4" /> },
  { value: "youtube", label: "YouTube", icon: <Link2 className="h-4 w-4" /> },
  { value: "other", label: "Other", icon: <Link2 className="h-4 w-4" /> },
];

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label?: string; // For "other" platform types
  isValid?: boolean; // To track URL validation state
}

// URL validation function
const isValidURL = (url: string): boolean => {
  if (!url) return true; // Empty URLs are considered valid for optional fields
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export function AthleteAdditionalInfoForm({ onNext, onBack }: AthleteAdditionalInfoFormProps) {
  const updateAdditionalInfo = useAthleteOnboardingStore((state) => state.updateAdditionalInfo);
  const additionalInfo = useAthleteOnboardingStore((state) => state.additionalInfo);
  const [activeTab, setActiveTab] = useState("profile");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert the existing links to the new unified format
  const convertDefaultLinksToUnified = (): SocialLink[] => {
    const links: SocialLink[] = [];

    // Process websites
    additionalInfo.websiteURLs?.forEach((url, index) => {
      if (url)
        links.push({ id: `website-${index}`, platform: "website", url, isValid: isValidURL(url) });
    });

    // Process Strava
    additionalInfo.stravaLinks?.forEach((url, index) => {
      if (url)
        links.push({ id: `strava-${index}`, platform: "strava", url, isValid: isValidURL(url) });
    });

    // Process Instagram
    additionalInfo.instagramLinks?.forEach((url, index) => {
      if (url)
        links.push({
          id: `instagram-${index}`,
          platform: "instagram",
          url,
          isValid: isValidURL(url),
        });
    });

    // Process Facebook
    additionalInfo.facebookLinks?.forEach((url, index) => {
      if (url)
        links.push({
          id: `facebook-${index}`,
          platform: "facebook",
          url,
          isValid: isValidURL(url),
        });
    });

    // Process Twitter
    additionalInfo.twitterLinks?.forEach((url, index) => {
      if (url)
        links.push({ id: `twitter-${index}`, platform: "twitter", url, isValid: isValidURL(url) });
    });

    // Process YouTube
    additionalInfo.youtubeURLs?.forEach((url, index) => {
      if (url)
        links.push({ id: `youtube-${index}`, platform: "youtube", url, isValid: isValidURL(url) });
    });

    // Process other social links
    additionalInfo.otherSocialLinks?.forEach((item, index) => {
      if (item.url)
        links.push({
          id: `other-${index}`,
          platform: "other",
          url: item.url,
          label: item.label,
          isValid: isValidURL(item.url),
        });
    });

    // If no links, add an empty one
    if (links.length === 0) {
      links.push({ id: "default-0", platform: "website", url: "", isValid: true });
    }

    return links;
  };

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(convertDefaultLinksToUnified());

  const form = useForm<z.infer<typeof additionalInfoStepSchema>>({
    resolver: zodResolver(additionalInfoStepSchema),
    defaultValues: {
      bio: additionalInfo.bio ?? "",
      goals: additionalInfo.goals ?? "",
      sponsors: additionalInfo.sponsors ?? "",
      websiteURLs: additionalInfo.websiteURLs?.filter((url) => url) ?? [],
      stravaLinks: additionalInfo.stravaLinks?.filter((url) => url) ?? [],
      instagramLinks: additionalInfo.instagramLinks?.filter((url) => url) ?? [],
      facebookLinks: additionalInfo.facebookLinks?.filter((url) => url) ?? [],
      twitterLinks: additionalInfo.twitterLinks?.filter((url) => url) ?? [],
      youtubeURLs: additionalInfo.youtubeURLs?.filter((url) => url) ?? [],
      otherSocialLinks: additionalInfo.otherSocialLinks?.filter((link) => link.url) ?? [],
      emergencyContact: additionalInfo.emergencyContact ?? {
        name: "",
        phoneNumber: "",
        relationship: "",
      },
      allergies: additionalInfo.allergies ?? "",
      medicalConditions: additionalInfo.medicalConditions ?? "",
      medications: additionalInfo.medications ?? "",
      bloodGroup: additionalInfo.bloodGroup ?? "unknown",
      privacySettings: additionalInfo.privacySettings ?? {
        showLocation: true,
        showAge: true,
        showActivityData: true,
        showMedicalInfo: false,
      },
      communicationPreferences: additionalInfo.communicationPreferences ?? {
        receiveEmails: true,
        receiveNotifications: true,
        allowMessaging: true,
      },
    },
    mode: "onBlur",
  });

  // Synchronize local socialLinks state with RHF state for validation
  useEffect(() => {
    const websiteURLs: string[] = [];
    const stravaLinks: string[] = [];
    const instagramLinks: string[] = [];
    const facebookLinks: string[] = [];
    const twitterLinks: string[] = [];
    const youtubeURLs: string[] = [];
    const otherSocialLinks: { label: string; url: string }[] = [];

    for (const link of socialLinks) {
      if (!link.url) continue;

      switch (link.platform) {
        case "website":
          websiteURLs.push(link.url);
          break;
        case "strava":
          stravaLinks.push(link.url);
          break;
        case "instagram":
          instagramLinks.push(link.url);
          break;
        case "facebook":
          facebookLinks.push(link.url);
          break;
        case "twitter":
          twitterLinks.push(link.url);
          break;
        case "youtube":
          youtubeURLs.push(link.url);
          break;
        case "other":
          otherSocialLinks.push({ label: link.label || "", url: link.url });
          break;
      }
    }

    form.setValue("websiteURLs", websiteURLs, { shouldValidate: true });
    form.setValue("stravaLinks", stravaLinks, { shouldValidate: true });
    form.setValue("instagramLinks", instagramLinks, { shouldValidate: true });
    form.setValue("facebookLinks", facebookLinks, { shouldValidate: true });
    form.setValue("twitterLinks", twitterLinks, { shouldValidate: true });
    form.setValue("youtubeURLs", youtubeURLs, { shouldValidate: true });
    form.setValue("otherSocialLinks", otherSocialLinks, { shouldValidate: true });
  }, [socialLinks, form.setValue]);

  // Real-time validation state for UI feedback
  useEffect(() => {
    const updatedLinks = socialLinks.map((link) => ({
      ...link,
      isValid: link.url ? isValidURL(link.url) : true,
    }));
    const hasChanges = JSON.stringify(updatedLinks) !== JSON.stringify(socialLinks);
    if (hasChanges) {
      setSocialLinks(updatedLinks);
    }
  }, [socialLinks]);

  // Form submission handler (SUCCESS case)
  const handleFormSubmit = (values: AdditionalInfoFormValues) => {
    setIsSubmitting(true);

    try {
      updateAdditionalInfo(values);
      toast.success("Information saved successfully");
      onNext();
    } catch (e) {
      const error = e as Error;
      toast.error(`There was a problem saving your information: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form submission handler (ERROR case)
  const handleFormError = (errors: FieldErrors<AdditionalInfoFormValues>) => {
    setIsSubmitting(false);
    toast.error("Please fix the errors in the form.");

    const errorFields = Object.keys(errors);
    if (
      errorFields.includes("bio") ||
      errorFields.includes("goals") ||
      errorFields.includes("sponsors")
    ) {
      setActiveTab("profile");
    } else if (
      errorFields.some(
        (field) =>
          field.startsWith("websiteURLs") ||
          field.startsWith("stravaLinks") ||
          field.startsWith("instagramLinks") ||
          field.startsWith("facebookLinks") ||
          field.startsWith("twitterLinks") ||
          field.startsWith("youtubeURLs") ||
          field.startsWith("otherSocialLinks")
      )
    ) {
      setActiveTab("social");
    } else if (
      errorFields.some(
        (field) =>
          field.startsWith("emergencyContact") ||
          field.includes("allergies") ||
          field.includes("medicalConditions") ||
          field.includes("medications") ||
          field.includes("bloodGroup")
      )
    ) {
      setActiveTab("additional");
    }
  };

  // Add a new social link
  const addSocialLink = () => {
    setSocialLinks([
      ...socialLinks,
      {
        id: `link-${Date.now()}`,
        platform: "website",
        url: "",
        isValid: true,
      },
    ]);
  };

  // Remove a social link
  const removeSocialLink = (id: string) => {
    setSocialLinks(socialLinks.filter((link) => link.id !== id));
  };

  // Update a social link
  const updateSocialLink = (id: string, field: keyof SocialLink, value: string) => {
    setSocialLinks(
      socialLinks.map((link) => {
        if (link.id === id) {
          const updatedLink = { ...link, [field]: value };
          if (field === "url") {
            updatedLink.isValid = isValidURL(value);
          }
          return updatedLink;
        }
        return link;
      })
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit, handleFormError)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile Info</TabsTrigger>
            <TabsTrigger value="social">Web & Social</TabsTrigger>
            <TabsTrigger value="additional">Additional Info</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 pt-4">
            <div className="space-y-4 rounded-lg bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">About You</h4>
                <Badge variant="outline" className="font-normal">
                  Optional
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                Tell others about yourself and your outdoor experiences
              </p>
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about yourself, your outdoor experience, and what drives your passion..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>This will be displayed on your public profile.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goals</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What are your outdoor activity goals? Any specific trips or achievements you're working towards?"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sponsors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sponsors</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List any sponsorships or brand affiliations"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="social" className="space-y-6 pt-4">
            <div className="space-y-4 rounded-lg bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Web & Social Links</h4>
                <Badge variant="outline" className="font-normal">
                  Optional
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                Connect your online presence to your profile
              </p>
            </div>

            <div className="space-y-4">
              {socialLinks.map((link) => (
                <Card
                  key={link.id}
                  className={cn(
                    "overflow-hidden border",
                    link.url && link.isValid === false && "border-destructive"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="grid gap-4 md:grid-cols-12">
                      <div className="md:col-span-4">
                        <Select
                          value={link.platform}
                          onValueChange={(value) => updateSocialLink(link.id, "platform", value)}
                        >
                          <SelectTrigger>
                            <SelectValue>
                              {socialPlatforms.find((p) => p.value === link.platform)?.label ||
                                "Select Platform"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {socialPlatforms.map((platform) => (
                              <SelectItem key={platform.value} value={platform.value}>
                                <div className="flex items-center">
                                  {platform.icon}
                                  <span className="ml-2">{platform.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {link.platform === "other" && (
                        <div className="md:col-span-2">
                          <Input
                            placeholder="Platform name"
                            value={link.label || ""}
                            onChange={(e) => updateSocialLink(link.id, "label", e.target.value)}
                          />
                        </div>
                      )}

                      <div
                        className={cn(
                          "relative",
                          link.platform === "other" ? "md:col-span-5" : "md:col-span-7"
                        )}
                      >
                        <div className="relative">
                          <Input
                            placeholder={`Enter ${socialPlatforms.find((p) => p.value === link.platform)?.label || "URL"} link`}
                            value={link.url}
                            onChange={(e) => updateSocialLink(link.id, "url", e.target.value)}
                            className={cn(link.url && !link.isValid && "border-destructive pr-10")}
                          />
                          {link.url && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              {link.isValid ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Check className="h-4 w-4 text-green-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Valid URL format</p>
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AlertCircle className="h-4 w-4 text-destructive" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Invalid URL format (e.g., https://example.com)</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          )}
                        </div>
                        {link.url && !link.isValid && (
                          <p className="mt-1 text-destructive text-xs">
                            Please enter a valid URL including https://
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-end md:col-span-1">
                        {socialLinks.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSocialLink(link.id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button type="button" variant="outline" onClick={addSocialLink} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Link
              </Button>
            </div>

            {form.formState.errors.websiteURLs && (
              <p className="text-destructive text-sm">
                {form.formState.errors.websiteURLs.message || "Invalid website URL(s)"}
              </p>
            )}
            {form.formState.errors.stravaLinks && (
              <p className="text-destructive text-sm">
                {form.formState.errors.stravaLinks.message || "Invalid Strava URL(s)"}
              </p>
            )}
            {form.formState.errors.otherSocialLinks && (
              <p className="text-destructive text-sm">
                {form.formState.errors.otherSocialLinks.message || "Invalid Other URL(s)"}
              </p>
            )}
          </TabsContent>

          <TabsContent value="additional" className="space-y-6 pt-4">
            <div className="space-y-4 rounded-lg bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Additional Information</h4>
                <Badge variant="outline" className="font-normal">
                  Optional
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                This information is optional but can be crucial in emergency situations
              </p>
            </div>

            <Card>
              <CardContent className="p-4 pt-6">
                <h4 className="mb-4 font-medium">Emergency Contact</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="emergencyContact.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Contact name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyContact.phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyContact.relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Spouse, Parent, Friend" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allergies</FormLabel>
                    <FormControl>
                      <Textarea placeholder="List any allergies..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="medicalConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical Conditions</FormLabel>
                    <FormControl>
                      <Textarea placeholder="List any medical conditions..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="medications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medications</FormLabel>
                    <FormControl>
                      <Textarea placeholder="List any medications..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bloodGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Group</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your blood group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bloodGroups.map((group) => (
                          <SelectItem key={group.value} value={group.value}>
                            {group.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Continue"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
