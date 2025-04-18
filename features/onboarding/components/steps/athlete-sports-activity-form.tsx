"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
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
import { useAthleteOnboardingStore } from "@/features/onboarding/store/athlete-onboarding-store";
import { cn } from "@/lib/utils";
import {
  type SportsActivityFormValues,
  sportsActivityStepSchema,
} from "@/lib/validations/athlete-onboarding";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  Bike,
  Flag,
  HelpCircle,
  Mountain,
  MountainSnow,
  PlusCircle,
  ThumbsUp,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

interface AthleteSportsActivityFormProps {
  onNext: () => void;
  onBack: () => void;
}

// Activities list with icons
const activities = [
  { value: "hiking", label: "Hiking", icon: <Activity className="h-4 w-4" /> },
  { value: "trail-running", label: "Trail Running", icon: <Activity className="h-4 w-4" /> },
  { value: "mountain-biking", label: "Mountain Biking", icon: <Bike className="h-4 w-4" /> },
  { value: "road-cycling", label: "Road Cycling", icon: <Bike className="h-4 w-4" /> },
  { value: "climbing", label: "Climbing", icon: <Mountain className="h-4 w-4" /> },
  { value: "mountaineering", label: "Mountaineering", icon: <Mountain className="h-4 w-4" /> },
  { value: "skiing", label: "Skiing", icon: <MountainSnow className="h-4 w-4" /> },
  { value: "snowboarding", label: "Snowboarding", icon: <MountainSnow className="h-4 w-4" /> },
  { value: "kayaking", label: "Kayaking", icon: <Activity className="h-4 w-4" /> },
  { value: "canoeing", label: "Canoeing", icon: <Activity className="h-4 w-4" /> },
  { value: "backpacking", label: "Backpacking", icon: <Flag className="h-4 w-4" /> },
];

// Experience levels with descriptions
const experienceLevels = [
  {
    value: "beginner",
    label: "Beginner",
    description: "New to this activity or participated a few times",
    icon: <Activity className="h-4 w-4" />,
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "Regular participation with reasonable experience",
    icon: <ThumbsUp className="h-4 w-4" />,
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Highly experienced with significant skill development",
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    value: "professional",
    label: "Professional",
    description: "Professional level expertise and competition experience",
    icon: <Flag className="h-4 w-4" />,
  },
];

// Fitness levels
const fitnessLevels = [
  { value: "beginner", label: "Beginner", description: "New to fitness or limited endurance" },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "Regular exercise with moderate endurance",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Highly conditioned with excellent endurance",
  },
];

export function AthleteSportsActivityForm({ onNext, onBack }: AthleteSportsActivityFormProps) {
  const updateSportsActivity = useAthleteOnboardingStore((state) => state.updateSportsActivity);
  const sportsActivity = useAthleteOnboardingStore((state) => state.sportsActivity);
  const [activeExperienceLevel, setActiveExperienceLevel] = useState<string | null>(null);
  const [showSecondaryActivity, setShowSecondaryActivity] = useState<boolean>(
    !!sportsActivity.primaryActivity2?.activity
  );
  const [showTertiaryActivity, setShowTertiaryActivity] = useState<boolean>(
    !!sportsActivity.primaryActivity3?.activity
  );

  const form = useForm<z.infer<typeof sportsActivityStepSchema>>({
    resolver: zodResolver(sportsActivityStepSchema),
    defaultValues: {
      ...sportsActivity,
    },
  });

  const watchPrimaryActivity1 = form.watch("primaryActivity1.activity");

  // Filter out already selected activities
  const getFilteredActivities = (excludeValues: string[]) => {
    return activities.filter((activity) => !excludeValues.includes(activity.value));
  };

  // Get activity icon by value
  const getActivityIcon = (value: string) => {
    const activity = activities.find((a) => a.value === value);
    return activity?.icon || <HelpCircle className="h-4 w-4" />;
  };

  // Add secondary activity
  const addSecondaryActivity = () => {
    setShowSecondaryActivity(true);
  };

  // Add tertiary activity
  const addTertiaryActivity = () => {
    setShowTertiaryActivity(true);
  };

  // Remove secondary activity
  const removeSecondaryActivity = () => {
    form.setValue("primaryActivity2", undefined);
    setShowSecondaryActivity(false);
    setShowTertiaryActivity(false);
  };

  // Remove tertiary activity
  const removeTertiaryActivity = () => {
    form.setValue("primaryActivity3", undefined);
    setShowTertiaryActivity(false);
  };

  // Replace onSubmit with local handler
  const handleSubmit = (values: SportsActivityFormValues) => {
    updateSportsActivity(values);
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-primary" />
                        <h3 className="font-medium text-lg">Your Sports Profile</h3>
                    </div>
                    <p className="text-muted-foreground">
                        Tell us about your sports activities to help match you with relevant adventures
                    </p>
                </div> */}

        <Tabs defaultValue="primary" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="primary">Primary Activities</TabsTrigger>
            <TabsTrigger value="fitness">Fitness & Measurements</TabsTrigger>
          </TabsList>

          <TabsContent value="primary" className="space-y-6 pt-4">
            <div className="space-y-4 rounded-lg bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Primary Activities</h4>
                <Badge variant="outline" className="font-normal">
                  Required
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                Select your main activity and optionally add up to two additional activities
              </p>
            </div>

            <div className="space-y-6">
              {/* Primary Activity 1 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-xs">
                      1
                    </span>
                    <h4 className="font-medium">Main Activity</h4>
                  </div>
                  <Badge variant="outline" className="font-normal">
                    Required
                  </Badge>
                </div>

                <Card>
                  <CardContent className="p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="primaryActivity1.activity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Activity Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an activity">
                                    {field.value && (
                                      <div className="flex items-center">
                                        {getActivityIcon(field.value)}
                                        <span className="ml-2">
                                          {activities.find((a) => a.value === field.value)?.label}
                                        </span>
                                      </div>
                                    )}
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {activities.map((activity) => (
                                  <SelectItem key={activity.value} value={activity.value}>
                                    <div className="flex items-center">
                                      {activity.icon}
                                      <span className="ml-2">{activity.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="primaryActivity1.experienceLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Experience Level</FormLabel>
                            <div className="grid grid-cols-4 gap-2">
                              {experienceLevels.map((level) => (
                                <div
                                  key={level.value}
                                  className={cn(
                                    "relative flex h-full cursor-pointer flex-col items-center justify-center rounded-md border p-2",
                                    field.value === level.value
                                      ? "border-primary bg-primary/5"
                                      : "border-input hover:bg-accent"
                                  )}
                                  onClick={() => {
                                    field.onChange(level.value);
                                    setActiveExperienceLevel(
                                      level.value === activeExperienceLevel ? null : level.value
                                    );
                                  }}
                                >
                                  {level.icon}
                                  <span className="mt-1 font-medium text-xs">{level.label}</span>
                                  {field.value === level.value && (
                                    <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
                                  )}
                                </div>
                              ))}
                            </div>
                            {activeExperienceLevel && (
                              <p className="mt-2 text-muted-foreground text-xs">
                                {
                                  experienceLevels.find((l) => l.value === activeExperienceLevel)
                                    ?.description
                                }
                              </p>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Add Secondary Activity Button */}
              {watchPrimaryActivity1 && !showSecondaryActivity && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={addSecondaryActivity}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Secondary Activity
                </Button>
              )}

              {/* Secondary Activity (Optional) */}
              {showSecondaryActivity && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary font-medium text-secondary-foreground text-xs">
                        2
                      </span>
                      <h4 className="font-medium">Secondary Activity</h4>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeSecondaryActivity}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>

                  <Card>
                    <CardContent className="p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="primaryActivity2.activity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Activity Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select an activity">
                                      {field.value && (
                                        <div className="flex items-center">
                                          {getActivityIcon(field.value)}
                                          <span className="ml-2">
                                            {activities.find((a) => a.value === field.value)?.label}
                                          </span>
                                        </div>
                                      )}
                                    </SelectValue>
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {getFilteredActivities([watchPrimaryActivity1]).map(
                                    (activity) => (
                                      <SelectItem key={activity.value} value={activity.value}>
                                        <div className="flex items-center">
                                          {activity.icon}
                                          <span className="ml-2">{activity.label}</span>
                                        </div>
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {form.watch("primaryActivity2.activity") && (
                          <FormField
                            control={form.control}
                            name="primaryActivity2.experienceLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Experience Level</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value || "beginner"}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select experience level" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {experienceLevels.map((level) => (
                                      <SelectItem key={level.value} value={level.value}>
                                        <div className="flex items-center">
                                          {level.icon}
                                          <span className="ml-2">{level.label}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Add Tertiary Activity Button */}
              {showSecondaryActivity &&
                form.watch("primaryActivity2.activity") &&
                !showTertiaryActivity && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={addTertiaryActivity}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Tertiary Activity
                  </Button>
                )}

              {/* Tertiary Activity (Optional) */}
              {showTertiaryActivity && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary font-medium text-secondary-foreground text-xs">
                        3
                      </span>
                      <h4 className="font-medium">Tertiary Activity</h4>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeTertiaryActivity}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>

                  <Card>
                    <CardContent className="p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="primaryActivity3.activity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Activity Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select an activity">
                                      {field.value && (
                                        <div className="flex items-center">
                                          {getActivityIcon(field.value)}
                                          <span className="ml-2">
                                            {activities.find((a) => a.value === field.value)?.label}
                                          </span>
                                        </div>
                                      )}
                                    </SelectValue>
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {getFilteredActivities([
                                    watchPrimaryActivity1,
                                    form.watch("primaryActivity2.activity") || "",
                                  ]).map((activity) => (
                                    <SelectItem key={activity.value} value={activity.value}>
                                      <div className="flex items-center">
                                        {activity.icon}
                                        <span className="ml-2">{activity.label}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {form.watch("primaryActivity3.activity") && (
                          <FormField
                            control={form.control}
                            name="primaryActivity3.experienceLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Experience Level</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value || "beginner"}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select experience level" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {experienceLevels.map((level) => (
                                      <SelectItem key={level.value} value={level.value}>
                                        <div className="flex items-center">
                                          {level.icon}
                                          <span className="ml-2">{level.label}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="fitness" className="space-y-6 pt-4">
            <div className="space-y-4 rounded-lg bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Fitness & Physical Information</h4>
                <Badge variant="outline" className="font-normal">
                  Optional
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                This information helps personalize activity recommendations to your fitness level
              </p>
            </div>

            <FormField
              control={form.control}
              name="fitnessLevel"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel>Overall Fitness Level</FormLabel>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {fitnessLevels.map((level) => (
                      <Card
                        key={level.value}
                        className={cn(
                          "cursor-pointer transition-colors",
                          field.value === level.value
                            ? "border-primary bg-primary/5"
                            : "hover:bg-accent"
                        )}
                        onClick={() => field.onChange(level.value)}
                      >
                        <CardContent className="flex flex-col items-center space-y-2 p-4 text-center">
                          <div
                            className={cn(
                              "rounded-full p-2",
                              field.value === level.value
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary"
                            )}
                          >
                            <Activity className="h-5 w-5" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-medium">{level.label}</h4>
                            <p className="text-muted-foreground text-xs">{level.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="height.value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (Optional)</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Height"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormField
                        control={form.control}
                        name="height.unit"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value || "cm"}>
                            <FormControl>
                              <SelectTrigger className="w-24">
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cm">cm</SelectItem>
                              <SelectItem value="feet">feet</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight.value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (Optional)</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Weight"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormField
                        control={form.control}
                        name="weight.unit"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value || "kg"}>
                            <FormControl>
                              <SelectTrigger className="w-24">
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="kg">kg</SelectItem>
                              <SelectItem value="lbs">lbs</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">Continue</Button>
        </div>
      </form>
    </Form>
  );
}
