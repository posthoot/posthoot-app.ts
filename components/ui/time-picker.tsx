// components/ui/time-picker.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface TimePickerProps {
  value?: string;
  onChange?: (time: string) => void;
  className?: string;
  disabled?: boolean;
}

const TimePicker = React.forwardRef<HTMLDivElement, TimePickerProps>(
  ({ value, onChange, className, disabled }, ref) => {
    const [hours, setHours] = React.useState<string>(
      value ? value.split(":")[0] : "12"
    );
    const [minutes, setMinutes] = React.useState<string>(
      value ? value.split(":")[1] : "00"
    );
    const [period, setPeriod] = React.useState<"AM" | "PM">("AM");

    const hoursArray = Array.from({ length: 12 }, (_, i) =>
      (i + 1).toString().padStart(2, "0")
    );
    const minutesArray = Array.from({ length: 60 }, (_, i) =>
      i.toString().padStart(2, "0")
    );

    const handleTimeChange = (
      type: "hours" | "minutes" | "period",
      newValue: string
    ) => {
      switch (type) {
        case "hours":
          setHours(newValue);
          break;
        case "minutes":
          setMinutes(newValue);
          break;
        case "period":
          setPeriod(newValue as "AM" | "PM");
          break;
      }

      if (onChange) {
        const formattedHours =
          period === "PM" && hours !== "12"
            ? (parseInt(hours) + 12).toString()
            : hours;
        onChange(`${formattedHours}:${minutes}`);
      }
    };

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-2", className)}
      >
        <Select
          value={hours}
          onValueChange={(value) => handleTimeChange("hours", value)}
          disabled={disabled}
        >
          <SelectTrigger className="w-[70px]">
            <SelectValue placeholder="HH" />
          </SelectTrigger>
          <SelectContent>
            {hoursArray.map((hour) => (
              <SelectItem key={hour} value={hour}>
                {hour}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-slate-500">:</span>

        <Select
          value={minutes}
          onValueChange={(value) => handleTimeChange("minutes", value)}
          disabled={disabled}
        >
          <SelectTrigger className="w-[70px]">
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent>
            {minutesArray.map((minute) => (
              <SelectItem key={minute} value={minute}>
                {minute}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={period}
          onValueChange={(value) => handleTimeChange("period", value)}
          disabled={disabled}
        >
          <SelectTrigger className="w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }
);

TimePicker.displayName = "TimePicker";

export { TimePicker };