"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BLOOD_GROUPS,
  EXPERIENCE_LEVELS,
  FITNESS_LEVELS,
  GENDERS,
  JOURNEY_TYPES,
  createSelectOptions,
} from "@/types/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Define the form schema using our shared enum values
const formSchema = z.object({
  gender: z.enum(GENDERS, {
    required_error: "Please select a gender",
  }),
  journeyType: z.enum(JOURNEY_TYPES, {
    required_error: "Please select a journey type",
  }),
  experienceLevel: z.enum(EXPERIENCE_LEVELS, {
    required_error: "Please select an experience level",
  }),
  fitnessLevel: z.enum(FITNESS_LEVELS, {
    required_error: "Please select a fitness level",
  }),
  bloodGroup: z.enum(BLOOD_GROUPS).optional(),
});

// Infer the form values type from the schema
type FormValues = z.infer<typeof formSchema>;

export function EnumUsageExample() {
  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: undefined,
      journeyType: undefined,
      experienceLevel: undefined,
      fitnessLevel: undefined,
      bloodGroup: undefined,
    },
  });

  // Form submission handler
  function onSubmit(data: FormValues) {
    console.log(data);
    // Handle form submission
  }

  // Create select options for each enum
  const genderOptions = createSelectOptions(GENDERS);
  const journeyTypeOptions = createSelectOptions(JOURNEY_TYPES);
  const experienceLevelOptions = createSelectOptions(EXPERIENCE_LEVELS);
  const fitnessLevelOptions = createSelectOptions(FITNESS_LEVELS);
  const bloodGroupOptions = createSelectOptions(BLOOD_GROUPS);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Gender Field */}
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {genderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Please select your gender</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Journey Type Field */}
        <FormField
          control={form.control}
          name="journeyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Journey Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a journey type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {journeyTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>What type of journey are you planning?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Experience Level Field */}
        <FormField
          control={form.control}
          name="experienceLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {experienceLevelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>What is your experience level?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fitness Level Field */}
        <FormField
          control={form.control}
          name="fitnessLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fitness Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your fitness level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {fitnessLevelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>What is your fitness level?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Blood Group Field */}
        <FormField
          control={form.control}
          name="bloodGroup"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Blood Group</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your blood group (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {bloodGroupOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Optional: What is your blood group?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
