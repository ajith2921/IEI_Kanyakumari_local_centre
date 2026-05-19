import { useState } from "react";
import Button from "./ui/Button";
import Input from "./ui/Input";

export default function DateRangeFilter({
  onApply,
  loading = false,
}) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleApply = () => {
    onApply({
      startDate,
      endDate,
    });
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    onApply({
      startDate: "",
      endDate: "",
    });
  };

  const hasFilters = startDate || endDate;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-end sm:gap-4">
      <div className="flex-1">
        <label htmlFor="start-date" className="block text-xs font-medium text-gray-700 mb-1">
          Start Date
        </label>
        <Input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="flex-1">
        <label htmlFor="end-date" className="block text-xs font-medium text-gray-700 mb-1">
          End Date
        </label>
        <Input
          id="end-date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleApply}
          disabled={loading}
          className="!h-11"
        >
          Filter
        </Button>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={loading}
            className="!h-11"
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
