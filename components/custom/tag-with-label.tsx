"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { type Tag, TagInput } from "emblor";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

type Props<S> = {
  description?: string;
  fieldTitle?: string;
  nameInSchema: keyof S & string;
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
  maxTags?: number;
  allowDuplicates?: boolean;
  autocompleteOptions?: string[];
  enableAutocomplete?: boolean;
  clearAll?: boolean;
  showCounter?: boolean;
  addTagsOnBlur?: boolean;
  direction?: "row" | "column";
  truncate?: boolean;
};

export function TagWithLabel<S>({
  description,
  fieldTitle,
  nameInSchema,
  placeholder = "Add a tag",
  className,
  isLoading = false,
  disabled = false,
  maxTags,
  allowDuplicates = false,
  autocompleteOptions,
  enableAutocomplete = false,
  clearAll = false,
  showCounter = false,
  addTagsOnBlur = false,
  direction = "row",
  truncate = false,
}: Props<S>) {
  const form = useFormContext();
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  // Convert string[] to Tag[] for initial value
  useEffect(() => {
    const fieldValue = form.getValues(nameInSchema as string);
    if (Array.isArray(fieldValue) && fieldValue.length > 0) {
      const initialTags: Tag[] = fieldValue.map((text: string) => ({
        id: crypto.randomUUID(),
        text: text,
      }));
      setTags(initialTags);
    }
  }, [form, nameInSchema]);

  // Convert string[] to Tag[] for autocomplete options
  const tagAutocompleteOptions = autocompleteOptions?.map((text: string) => ({
    id: crypto.randomUUID(),
    text,
  }));

  // Handle clearing all tags - moved inside render to access field

  return (
    <FormField
      control={form.control}
      name={nameInSchema}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            {fieldTitle && <FormLabel htmlFor={nameInSchema}>{fieldTitle}</FormLabel>}
            {showCounter && maxTags && (
              <span className="text-muted-foreground text-xs">
                {tags.length}/{maxTags}
              </span>
            )}
          </div>
          {description && <FormDescription>{description}</FormDescription>}
          <FormControl>
            <div className={cn("relative", className)}>
              {isLoading ? (
                <div className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground">Loading...</span>
                </div>
              ) : (
                <>
                  <TagInput
                    id={nameInSchema as string}
                    placeholder={placeholder}
                    tags={tags}
                    setTags={(newTags) => {
                      // Handle both function and direct value for setTags
                      if (typeof newTags === "function") {
                        setTags((prevTags) => {
                          const updatedTags = newTags(prevTags);
                          const tagValues = updatedTags.map((tag: Tag) => tag.text);
                          field.onChange(tagValues);
                          return updatedTags;
                        });
                      } else {
                        setTags(newTags);
                        const tagValues = newTags.map((tag: Tag) => tag.text);
                        field.onChange(tagValues);
                      }
                    }}
                    activeTagIndex={activeTagIndex}
                    setActiveTagIndex={setActiveTagIndex}
                    disabled={disabled}
                    maxTags={maxTags}
                    allowDuplicates={allowDuplicates}
                    enableAutocomplete={enableAutocomplete}
                    autocompleteOptions={tagAutocompleteOptions}
                    styleClasses={{
                      tagList: {
                        container: `gap-1 ${direction === "column" ? "flex-col" : ""}`,
                      },
                      input:
                        "rounded-md transition-[color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-ring outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                      tag: {
                        body: "relative h-7 bg-background border border-input hover:bg-background rounded-md font-medium text-xs ps-2 pe-7",
                        closeButton:
                          "absolute -inset-y-px -end-px p-0 rounded-s-none rounded-e-md flex size-7 transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] text-muted-foreground/80 hover:text-foreground",
                      },
                    }}
                    inlineTags={false}
                    inputFieldPosition="top"
                    addTagsOnBlur={addTagsOnBlur}
                    truncate={truncate ? 1 : undefined}
                    direction={direction}
                  />
                  {clearAll && tags.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setTags([]);
                        field.onChange([]);
                      }}
                      className="mt-2 flex items-center text-muted-foreground text-xs hover:text-foreground"
                    >
                      <X className="mr-1 h-3 w-3" />
                      Clear All
                    </button>
                  )}
                </>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
