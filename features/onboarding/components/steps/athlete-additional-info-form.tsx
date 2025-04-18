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
import { useAthleteOnboardingStore } from "@/features/onboarding/store/athlete-onboarding-store";
import { cn } from "@/lib/utils";
import {
  type AdditionalInfoFormValues,
  additionalInfoStepSchema,
} from "@/lib/validations/athlete-onboarding";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, Link2, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
}

export function AthleteAdditionalInfoForm({ onNext, onBack }: AthleteAdditionalInfoFormProps) {
  const updateAdditionalInfo = useAthleteOnboardingStore((state) => state.updateAdditionalInfo);
  const additionalInfo = useAthleteOnboardingStore((state) => state.additionalInfo);

  // Convert the existing links to the new unified format
  const convertDefaultLinksToUnified = (): SocialLink[] => {
    const links: SocialLink[] = [];

    // Process websites
    additionalInfo.websiteURLs?.forEach((url, index) => {
      if (url) links.push({ id: `website-${index}`, platform: "website", url });
    });

    // Process Strava
    additionalInfo.stravaLinks?.forEach((url, index) => {
      if (url) links.push({ id: `strava-${index}`, platform: "strava", url });
    });

    // Process Instagram
    additionalInfo.instagramLinks?.forEach((url, index) => {
      if (url) links.push({ id: `instagram-${index}`, platform: "instagram", url });
    });

    // Process Facebook
    additionalInfo.facebookLinks?.forEach((url, index) => {
      if (url) links.push({ id: `facebook-${index}`, platform: "facebook", url });
    });

    // Process Twitter
    additionalInfo.twitterLinks?.forEach((url, index) => {
      if (url) links.push({ id: `twitter-${index}`, platform: "twitter", url });
    });

    // Process YouTube
    additionalInfo.youtubeURLs?.forEach((url, index) => {
      if (url) links.push({ id: `youtube-${index}`, platform: "youtube", url });
    });

    // Process other social links
    additionalInfo.otherSocialLinks?.forEach((item, index) => {
      if (item.url)
        links.push({
          id: `other-${index}`,
          platform: "other",
          url: item.url,
          label: item.label,
        });
    });

    // If no links, add an empty one
    if (links.length === 0) {
      links.push({ id: "default-0", platform: "website", url: "" });
    }

    return links;
  };

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(convertDefaultLinksToUnified());

  // Use store state for defaults
  const form = useForm<z.infer<typeof additionalInfoStepSchema>>({
    resolver: zodResolver(additionalInfoStepSchema),
    defaultValues: {
      bio: "",
      goals: "",
      sponsors: "",
      websiteURLs: [""],
      stravaLinks: [""],
      instagramLinks: [""],
      facebookLinks: [""],
      twitterLinks: [""],
      youtubeURLs: [""],
      otherSocialLinks: [{ label: "", url: "" }],
      emergencyContact: {
        name: "",
        phoneNumber: "",
        relationship: "",
      },
      allergies: "",
      medicalConditions: "",
      medications: "",
      bloodGroup: "unknown",
      privacySettings: {
        showLocation: true,
        showAge: true,
        showActivityData: true,
        showMedicalInfo: false,
      },
      communicationPreferences: {
        receiveEmails: true,
        receiveNotifications: true,
        allowMessaging: true,
      },
      ...additionalInfo,
    },
  });

  // Replace onSubmit with local handler
  const handleSubmit = (values: AdditionalInfoFormValues) => {
    // Convert the unified links back to the expected format
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

    // If any array is empty, add an empty string to keep the schema valid
    if (websiteURLs.length === 0) websiteURLs.push("");
    if (stravaLinks.length === 0) stravaLinks.push("");
    if (instagramLinks.length === 0) instagramLinks.push("");
    if (facebookLinks.length === 0) facebookLinks.push("");
    if (twitterLinks.length === 0) twitterLinks.push("");
    if (youtubeURLs.length === 0) youtubeURLs.push("");
    if (otherSocialLinks.length === 0) otherSocialLinks.push({ label: "", url: "" });

    updateAdditionalInfo({
      ...values,
      websiteURLs,
      stravaLinks,
      instagramLinks,
      facebookLinks,
      twitterLinks,
      youtubeURLs,
      otherSocialLinks,
    });
    onNext();
  };

  // Add a new social link
  const addSocialLink = () => {
    setSocialLinks([
      ...socialLinks,
      {
        id: `link-${Date.now()}`,
        platform: "website",
        url: "",
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
      socialLinks.map((link) => (link.id === id ? { ...link, [field]: value } : link))
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs defaultValue="profile" className="w-full">
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
                <Card key={link.id} className="overflow-hidden">
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
                        <Input
                          placeholder={`Enter ${socialPlatforms.find((p) => p.value === link.platform)?.label || "URL"} link`}
                          value={link.url}
                          onChange={(e) => updateSocialLink(link.id, "url", e.target.value)}
                        />
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

            {/* Emergency Contact */}
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
          <Button type="submit">Continue</Button>
        </div>
      </form>
    </Form>
  );
}
