"use client";

import { DatePickerWithLabel } from "@/components/custom/date-picker-with-label";
import { InputWithLabel } from "@/components/custom/input-with-label";
import { SelectWithLabel } from "@/components/custom/select-with-label";
import { TextareaWithLabel } from "@/components/custom/textarea-with-label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { JOURNEY_TYPES, PRIVACY_STATUSES, createSelectOptions } from "@/types/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "better-auth";
import { Check, ChevronsUpDown, Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { type JourneyCreationFormValues, journeySchema } from "../journey-validator";

// Create select options for journey types and privacy statuses
const journeyTypeOptions = createSelectOptions(JOURNEY_TYPES);
const privacyStatusOptions = createSelectOptions(PRIVACY_STATUSES);

// Buddy selection component
function BuddySelect({
  value,
  onChange,
  users,
  isLoading,
}: { value: string[]; onChange: (value: string[]) => void; users: User[]; isLoading: boolean }) {
  const [open, setOpen] = useState(false);

  const toggleBuddy = (userId: string) => {
    if (value.includes(userId)) {
      onChange(value.filter((id) => id !== userId));
    } else {
      onChange([...value, userId]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value.length > 0
            ? `${value.length} buddy${value.length > 1 ? "ies" : ""} selected`
            : "Select buddies..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search users..." />
          <CommandList>
            <CommandEmpty>{isLoading ? "Loading..." : "No users found."}</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem key={user.id} value={user.id} onSelect={() => toggleBuddy(user.id)}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(user.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2">
                    {user.image && (
                      <img src={user.image} alt={user.name} className="h-6 w-6 rounded-full" />
                    )}
                    <div>
                      <p>{user.name}</p>
                      <p className="text-muted-foreground text-xs">{user.email}</p>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface JourneyFormProps {
  onSubmit: (data: JourneyCreationFormValues) => void;
  defaultValues?: Partial<JourneyCreationFormValues>;
  isSubmitting?: boolean;
  users: User[];
  isLoadingUsers: boolean;
}

export function JourneyForm({
  onSubmit,
  defaultValues,
  isSubmitting = false,
  users,
  isLoadingUsers,
}: JourneyFormProps) {
  const form = useForm<JourneyCreationFormValues>({
    resolver: zodResolver(journeySchema),
    defaultValues: defaultValues || {
      title: "",
      journeyType: "other", // Use the actual enum value instead of an index
      description: "",
      startDate: new Date(),
      endDate: new Date(),
      location: "",
      privacyStatus: "private", // Use the actual enum value instead of an index
      tags: [],
      buddyIds: [],
      memberNames: [],
      coverImageUrl: "",
    },
  });
  const {
    formState: { errors },
  } = form;

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  // Form submission handler
  const handleSubmit = (data: JourneyCreationFormValues) => {
    // Format dates if needed (no need to check instanceof Date as they're already strings)
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Title field */}
          <div className="col-span-2 md:col-span-1">
            <InputWithLabel
              nameInSchema={"title"}
              fieldTitle={"Title"}
              placeholder={"Enter journey title"}
            />
          </div>

          {/* Journey Type field */}
          <div className="col-span-2 md:col-span-1">
            <SelectWithLabel
              nameInSchema={"journeyType"}
              fieldTitle={"Journey Type"}
              options={journeyTypeOptions}
              placeholder={"Select journey type"}
            />
          </div>

          {/* Description field */}
          <div className="col-span-2">
            <TextareaWithLabel
              nameInSchema={"description"}
              fieldTitle={"Description"}
              placeholder={"Enter journey description"}
              rows={6}
            />
          </div>

          {/* Date Range fields */}
          <div className="col-span-2 md:col-span-1">
            <DatePickerWithLabel
              nameInSchema={"startDate"}
              fieldTitle={"Start Date"}
              placeholder={"Select start date"}
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <DatePickerWithLabel
              nameInSchema={"endDate"}
              fieldTitle={"End Date"}
              placeholder={"Select end date"}
            />
          </div>

          {/* Location field */}
          <div className="col-span-2 md:col-span-1">
            <InputWithLabel
              nameInSchema={"location"}
              fieldTitle={"Location"}
              placeholder={"Enter journey location"}
            />
          </div>

          {/* Privacy Status field */}
          <div className="col-span-2 md:col-span-1">
            <SelectWithLabel
              nameInSchema={"privacyStatus"}
              fieldTitle={"Privacy"}
              options={privacyStatusOptions}
              placeholder={"Select privacy status"}
            />
          </div>

          {/* Tags field */}
          <div className="col-span-2">
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {(field.value || []).map((tag) => {
                        // Use the tag itself as the key since it should be unique
                        const tagKey = `tag-${tag}`;
                        return (
                          <Badge
                            key={tagKey}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {tag}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => {
                                const newTags = (field.value || []).filter((t) => t !== tag);
                                field.onChange(newTags);
                              }}
                            />
                          </Badge>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
                            e.preventDefault();
                            const newTag = e.currentTarget.value.trim();
                            if (!(field.value || []).includes(newTag)) {
                              field.onChange([...(field.value || []), newTag]);
                            }
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          const input = e.currentTarget.previousSibling as HTMLInputElement;
                          if (input.value.trim() !== "") {
                            const newTag = input.value.trim();
                            if (!(field.value || []).includes(newTag)) {
                              field.onChange([...(field.value || []), newTag]);
                            }
                            input.value = "";
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Buddy Selection field */}
          <div className="col-span-2">
            <FormField
              control={form.control}
              name="buddyIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buddies</FormLabel>
                  <FormDescription>
                    Select registered users who are joining this journey
                  </FormDescription>
                  <FormControl>
                    <BuddySelect
                      value={field.value || []}
                      onChange={field.onChange}
                      users={users}
                      isLoading={isLoadingUsers}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Member Names field */}
          <div className="col-span-2">
            <FormField
              control={form.control}
              name="memberNames"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Members</FormLabel>
                  <FormDescription>
                    Add names of people joining who are not registered on the platform
                  </FormDescription>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {(field.value || []).map((name) => {
                        // Use the name itself as the key since it should be unique
                        const nameKey = `member-${name}`;
                        return (
                          <Badge
                            key={nameKey}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {name}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => {
                                const newNames = (field.value || []).filter((n) => n !== name);
                                field.onChange(newNames);
                              }}
                            />
                          </Badge>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a member name"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
                            e.preventDefault();
                            const newName = e.currentTarget.value.trim();
                            if (!(field.value || []).includes(newName)) {
                              field.onChange([...(field.value || []), newName]);
                            }
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          const input = e.currentTarget.previousSibling as HTMLInputElement;
                          if (input.value.trim() !== "") {
                            const newName = input.value.trim();
                            if (!(field.value || []).includes(newName)) {
                              field.onChange([...(field.value || []), newName]);
                            }
                            input.value = "";
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Journey"
          )}
        </Button>
      </form>
    </Form>
  );
}
