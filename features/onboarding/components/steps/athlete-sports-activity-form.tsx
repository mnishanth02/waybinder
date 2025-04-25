"use client";

import { MotionDiv } from "@/components/common/MontionComp";
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
import {
  type SportsActivityFormValues,
  sportsActivityStepSchema,
} from "@/features/onboarding/athlete-onboarding-validator";
import { useAthleteOnboardingStore } from "@/features/onboarding/store/athlete-onboarding-store";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence } from "framer-motion";
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

// Utility: full default shape for the form
const fullDefaultValues: SportsActivityFormValues = {
  primaryActivity1: {
    activity: "",
    experienceLevel: "beginner",
  },
  primaryActivity2: undefined,
  primaryActivity3: undefined,
  fitnessLevel: "beginner",
  height: "",
  weight: "",
};

function mergeDefaults(
  defaults: SportsActivityFormValues,
  state: Partial<SportsActivityFormValues>
): SportsActivityFormValues {
  // Helper to check for valid number
  // const isValidNumber = (value: unknown): boolean => {
  //     return value !== undefined && value !== null && !Number.isNaN(value) && typeof value === 'number';
  // };

  return {
    ...defaults,
    ...state,
    primaryActivity1: {
      ...defaults.primaryActivity1,
      ...(state.primaryActivity1 || {}),
    },
    primaryActivity2: state.primaryActivity2
      ? { ...defaults.primaryActivity1, ...state.primaryActivity2 }
      : undefined,
    primaryActivity3: state.primaryActivity3
      ? { ...defaults.primaryActivity1, ...state.primaryActivity3 }
      : undefined,
    height: state.height,
    weight: state.weight,
  };
}

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Control active tab to persist selection
  const [activeTab, setActiveTab] = useState<"primary" | "fitness">("primary");

  const mergedDefaults = mergeDefaults(fullDefaultValues, sportsActivity);
  const methods = useForm<z.infer<typeof sportsActivityStepSchema>>({
    resolver: zodResolver(sportsActivityStepSchema),
    defaultValues: mergedDefaults,
    shouldUnregister: false,
    criteriaMode: "all",
  });
  const { formState, watch, handleSubmit, resetField } = methods;
  const watchPrimaryActivity1 = watch("primaryActivity1.activity");

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
    resetField("primaryActivity2");
    setShowSecondaryActivity(false);
    setShowTertiaryActivity(false);
  };

  // Remove tertiary activity
  const removeTertiaryActivity = () => {
    resetField("primaryActivity3");
    setShowTertiaryActivity(false);
  };

  // Replace onSubmit with local handler
  const handleFormSubmit = async (values: SportsActivityFormValues) => {
    setIsSubmitting(true);
    try {
      // Clean up empty/unused fields before saving
      const cleaned: SportsActivityFormValues = {
        ...values,
        primaryActivity2: values.primaryActivity2?.activity ? values.primaryActivity2 : undefined,
        primaryActivity3: values.primaryActivity3?.activity ? values.primaryActivity3 : undefined,
        height: values.height,
        weight: values.weight,
      };
      updateSportsActivity(cleaned);
      onNext();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        <Tabs
          value={activeTab}
          onValueChange={(value: string) => setActiveTab(value as "primary" | "fitness")}
          className="w-full"
        >
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
                        control={methods.control}
                        name="primaryActivity1.activity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Activity Type</FormLabel>
                            <FormDescription>Choose your main outdoor activity.</FormDescription>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger
                                  className="cursor-pointer"
                                  aria-invalid={!!formState.errors.primaryActivity1?.activity}
                                  aria-describedby="primaryActivity1-activity-error"
                                >
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
                            <FormMessage id="primaryActivity1-activity-error" role="alert" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name="primaryActivity1.experienceLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Experience Level</FormLabel>
                            <FormDescription>
                              Indicate your experience for this activity.
                            </FormDescription>
                            <div className="grid grid-cols-4 gap-2">
                              {experienceLevels.map((level) => (
                                <div
                                  key={level.value}
                                  className={cn(
                                    "relative flex h-full cursor-pointer flex-col items-center justify-center rounded-md border p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
                                    field.value === level.value
                                      ? "border-primary bg-primary/5"
                                      : "border-input hover:bg-accent"
                                  )}
                                  tabIndex={0}
                                  role="button"
                                  aria-pressed={field.value === level.value}
                                  onClick={() => {
                                    field.onChange(level.value);
                                    setActiveExperienceLevel(
                                      level.value === activeExperienceLevel ? null : level.value
                                    );
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      field.onChange(level.value);
                                      setActiveExperienceLevel(
                                        level.value === activeExperienceLevel ? null : level.value
                                      );
                                    }
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
                            <FormMessage role="alert" />
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
              {/* Secondary Activity (Animated) */}
              <AnimatePresence>
                {showSecondaryActivity && (
                  <MotionDiv
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
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
                        aria-label="Remove secondary activity"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                    <Card>
                      <CardContent className="p-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={methods.control}
                            name="primaryActivity2.activity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Activity Type</FormLabel>
                                <FormDescription>
                                  Choose your secondary activity (optional).
                                </FormDescription>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger
                                      className="cursor-pointer"
                                      aria-invalid={!!formState.errors.primaryActivity2?.activity}
                                      aria-describedby="primaryActivity2-activity-error"
                                    >
                                      <SelectValue placeholder="Select an activity">
                                        {field.value && (
                                          <div className="flex items-center">
                                            {getActivityIcon(field.value)}
                                            <span className="ml-2">
                                              {
                                                activities.find((a) => a.value === field.value)
                                                  ?.label
                                              }
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
                                <FormMessage id="primaryActivity2-activity-error" role="alert" />
                              </FormItem>
                            )}
                          />
                          {methods.watch("primaryActivity2.activity") && (
                            <FormField
                              control={methods.control}
                              name="primaryActivity2.experienceLevel"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Experience Level</FormLabel>
                                  <FormDescription>
                                    Indicate your experience for this activity.
                                  </FormDescription>
                                  <Select
                                    value={field.value ?? "beginner"}
                                    onValueChange={field.onChange}
                                  >
                                    <FormControl>
                                      <SelectTrigger
                                        className="cursor-pointer"
                                        aria-invalid={
                                          !!formState.errors.primaryActivity2?.experienceLevel
                                        }
                                        aria-describedby="primaryActivity2-experienceLevel-error"
                                      >
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
                                  <FormMessage
                                    id="primaryActivity2-experienceLevel-error"
                                    role="alert"
                                  />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </MotionDiv>
                )}
              </AnimatePresence>
              {/* Add Tertiary Activity Button */}
              {showSecondaryActivity &&
                methods.watch("primaryActivity2.activity") &&
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
              {/* Tertiary Activity (Animated) */}
              <AnimatePresence>
                {showTertiaryActivity && (
                  <MotionDiv
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
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
                        aria-label="Remove tertiary activity"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                    <Card>
                      <CardContent className="p-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={methods.control}
                            name="primaryActivity3.activity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Activity Type</FormLabel>
                                <FormDescription>
                                  Choose your tertiary activity (optional).
                                </FormDescription>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger
                                      aria-invalid={!!formState.errors.primaryActivity3?.activity}
                                      aria-describedby="primaryActivity3-activity-error"
                                    >
                                      <SelectValue placeholder="Select an activity">
                                        {field.value && (
                                          <div className="flex items-center">
                                            {getActivityIcon(field.value)}
                                            <span className="ml-2">
                                              {
                                                activities.find((a) => a.value === field.value)
                                                  ?.label
                                              }
                                            </span>
                                          </div>
                                        )}
                                      </SelectValue>
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {getFilteredActivities([
                                      watchPrimaryActivity1,
                                      methods.watch("primaryActivity2.activity") || "",
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
                                <FormMessage id="primaryActivity3-activity-error" role="alert" />
                              </FormItem>
                            )}
                          />
                          {methods.watch("primaryActivity3.activity") && (
                            <FormField
                              control={methods.control}
                              name="primaryActivity3.experienceLevel"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Experience Level</FormLabel>
                                  <FormDescription>
                                    Indicate your experience for this activity.
                                  </FormDescription>
                                  <Select
                                    value={field.value ?? "beginner"}
                                    onValueChange={field.onChange}
                                  >
                                    <FormControl>
                                      <SelectTrigger
                                        aria-invalid={
                                          !!formState.errors.primaryActivity3?.experienceLevel
                                        }
                                        aria-describedby="primaryActivity3-experienceLevel-error"
                                      >
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
                                  <FormMessage
                                    id="primaryActivity3-experienceLevel-error"
                                    role="alert"
                                  />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </MotionDiv>
                )}
              </AnimatePresence>
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
              control={methods.control}
              name="fitnessLevel"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel>Overall Fitness Level</FormLabel>
                  <FormDescription>
                    Select your current fitness level for more accurate recommendations.
                  </FormDescription>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {fitnessLevels.map((level) => (
                      <Card
                        key={level.value}
                        className={cn(
                          "cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
                          field.value === level.value
                            ? "border-primary bg-primary/5"
                            : "hover:bg-accent"
                        )}
                        tabIndex={0}
                        role="button"
                        aria-pressed={field.value === level.value}
                        onClick={() => field.onChange(level.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            field.onChange(level.value);
                          }
                        }}
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
                  <FormMessage role="alert" />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={methods.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm) - Optional</FormLabel>
                    <FormDescription>
                      Enter your height in centimeters for better recommendations.
                    </FormDescription>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Height in cm"
                        {...field}
                        aria-invalid={!!formState.errors.height}
                        aria-describedby="height-error"
                      />
                    </FormControl>
                    <FormMessage id="height-error" role="alert" />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg) - Optional</FormLabel>
                    <FormDescription>
                      Enter your weight in kilograms for better recommendations.
                    </FormDescription>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Weight in kg"
                        {...field}
                        aria-invalid={!!formState.errors.weight}
                        aria-describedby="weight-error"
                      />
                    </FormControl>
                    <FormMessage id="weight-error" role="alert" />
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
          <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Continue"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
