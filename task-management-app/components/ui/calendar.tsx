"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, CaptionProps, CustomComponents } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

// Define the CustomCalendarMonth type
type CustomCalendarMonth = {
  year: number
  month: number
  currentMonth: Date
  onMonthChange: (month: Date) => void
}
type CalendarMonth = Date | CustomCalendarMonth

function CustomCaption({ currentMonth, onMonthChange }: { currentMonth: Date; onMonthChange: (month: Date) => void }) {
  const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)

  return (
    <div className="flex items-center justify-between px-2 py-1">
      <button
        type="button"
        onClick={() => onMonthChange(previousMonth)}
        className="opacity-50 hover:opacity-100"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-sm font-medium">
        {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
      </span>
      <button
        type="button"
        onClick={() => onMonthChange(nextMonth)}
        className="opacity-50 hover:opacity-100"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      month={currentMonth}
      onMonthChange={setCurrentMonth}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium",
        table: "w-full border-collapse space-x-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_start:
          "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_range_end:
          "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Caption: () => (
          <CustomCaption
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />
        ),
      } as Partial<CustomComponents>} // Explicitly type the components prop
      {...props}
    />
  )
}

export { Calendar }