"use client";

import {
  eachMonthOfInterval,
  eachYearOfInterval,
  endOfYear,
  format,
  isAfter,
  isBefore,
  startOfYear,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatUTCForDisplay, parseDateToUTC } from "@/lib/utils/date";
import type { CaptionLabelProps, MonthGridProps } from "react-day-picker";

type Props<S> = {
  fieldTitle: string;
  nameInSchema: keyof S & string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  startDate?: Date;
  endDate?: Date;
};

export function DatePickerWithLabel<S>({
  fieldTitle,
  nameInSchema,
  className,
  disabled = false,
  placeholder = "Pick a date",
  startDate = new Date(1980, 0),
  endDate = new Date(2030, 11),
}: Props<S>) {
  const form = useFormContext();
  const today = new Date();
  const [month, setMonth] = useState(today);
  const [isYearView, setIsYearView] = useState(false);

  const years = eachYearOfInterval({
    start: startOfYear(startDate),
    end: endOfYear(endDate),
  });

  function CaptionLabel({
    children,
    ...props
  }: CaptionLabelProps & {
    isYearView: boolean;
    setIsYearView: React.Dispatch<React.SetStateAction<boolean>>;
  }) {
    return (
      <Button
        className="-ms-2 flex cursor-pointer items-center gap-2 font-medium text-sm hover:bg-transparent data-[state=open]:text-muted-foreground/80 [&[data-state=open]>svg]:rotate-180"
        variant="ghost"
        size="sm"
        onClick={() => props.setIsYearView((prev) => !prev)}
        data-state={props.isYearView ? "open" : "closed"}
      >
        {children}
        <ChevronDown
          size={16}
          strokeWidth={2}
          className="shrink-0 text-muted-foreground/80 transition-transform duration-200"
          aria-hidden="true"
        />
      </Button>
    );
  }

  function CollapsibleYear({
    title,
    children,
    open,
  }: {
    title: string;
    children: React.ReactNode;
    open?: boolean;
  }) {
    return (
      <Collapsible className="border-border border-t px-2 py-1.5" defaultOpen={open}>
        <CollapsibleTrigger asChild>
          <Button
            className="flex w-full cursor-pointer justify-start gap-2 font-medium text-sm hover:bg-transparent [&[data-state=open]>svg]:rotate-180"
            variant="ghost"
            size="sm"
          >
            <ChevronDown
              size={16}
              strokeWidth={2}
              className="shrink-0 text-muted-foreground/80 transition-transform duration-200"
              aria-hidden="true"
            />
            {title}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden px-3 py-1 text-sm transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          {children}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  function MonthGrid({
    className,
    children,
    ...props
  }: MonthGridProps & {
    isYearView: boolean;
    setIsYearView: React.Dispatch<React.SetStateAction<boolean>>;
    startDate: Date;
    endDate: Date;
    years: Date[];
    currentYear: number;
    currentMonth: number;
    onMonthSelect: (date: Date) => void;
  }) {
    const currentYearRef = useRef<HTMLDivElement>(null);
    const currentMonthButtonRef = useRef<HTMLButtonElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (props.isYearView && currentYearRef.current && scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector(
          "[data-radix-scroll-area-viewport]"
        ) as HTMLElement;
        if (viewport) {
          const yearTop = currentYearRef.current.offsetTop;
          viewport.scrollTop = yearTop;
        }
        setTimeout(() => {
          currentMonthButtonRef.current?.focus();
        }, 100);
      }
    }, [props.isYearView]);

    return (
      <div className="relative">
        <table className={className}>{children}</table>
        {props.isYearView && (
          <div className="-mx-2 -mb-2 absolute inset-0 z-20 bg-background">
            <ScrollArea ref={scrollAreaRef} className="h-full">
              {props.years.map((year) => {
                const months = eachMonthOfInterval({
                  start: startOfYear(year),
                  end: endOfYear(year),
                });
                const isCurrentYear = year.getFullYear() === props.currentYear;

                return (
                  <div key={year.getFullYear()} ref={isCurrentYear ? currentYearRef : undefined}>
                    <CollapsibleYear title={year.getFullYear().toString()} open={isCurrentYear}>
                      <div className="grid grid-cols-3 gap-2">
                        {months.map((month) => {
                          const isDisabled =
                            isBefore(month, props.startDate) || isAfter(month, props.endDate);
                          const isCurrentMonth =
                            month.getMonth() === props.currentMonth &&
                            year.getFullYear() === props.currentYear;

                          return (
                            <Button
                              key={month.getTime()}
                              ref={isCurrentMonth ? currentMonthButtonRef : undefined}
                              variant={isCurrentMonth ? "default" : "outline"}
                              size="sm"
                              className="h-7"
                              disabled={isDisabled}
                              onClick={() => props.onMonthSelect(month)}
                            >
                              {format(month, "MMM")}
                            </Button>
                          );
                        })}
                      </div>
                    </CollapsibleYear>
                  </div>
                );
              })}
            </ScrollArea>
          </div>
        )}
      </div>
    );
  }

  return (
    <FormField
      control={form.control}
      name={nameInSchema}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{fieldTitle}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full cursor-pointer pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground",
                    className
                  )}
                  disabled={disabled}
                >
                  {field.value ? (
                    formatUTCForDisplay(field.value, "PPP")
                  ) : (
                    <span>{placeholder}</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={(date) => {
                  if (date) {
                    // Convert the selected date to UTC before storing
                    const utcDate = parseDateToUTC(date.toISOString());
                    field.onChange(utcDate);
                  } else {
                    field.onChange("");
                  }
                }}
                month={month}
                onMonthChange={setMonth}
                defaultMonth={today}
                startMonth={startDate}
                endMonth={endDate}
                disabled={disabled}
                initialFocus
                locale={enUS}
                weekStartsOn={0}
                classNames={{
                  month_caption: "ms-2.5 me-20 justify-start",
                  nav: "justify-end",
                }}
                components={{
                  CaptionLabel: (props) => (
                    <CaptionLabel
                      isYearView={isYearView}
                      setIsYearView={setIsYearView}
                      {...props}
                    />
                  ),
                  MonthGrid: (props) => (
                    <MonthGrid
                      className={props.className}
                      isYearView={isYearView}
                      setIsYearView={setIsYearView}
                      startDate={startDate}
                      endDate={endDate}
                      years={years}
                      currentYear={month.getFullYear()}
                      currentMonth={month.getMonth()}
                      onMonthSelect={(selectedMonth: Date) => {
                        setMonth(selectedMonth);
                        setIsYearView(false);
                      }}
                      {...props}
                    />
                  ),
                }}
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
