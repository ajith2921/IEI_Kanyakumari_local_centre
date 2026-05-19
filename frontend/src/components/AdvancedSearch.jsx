import { useEffect, useState } from "react";
import Button from "./ui/Button";
import Input from "./ui/Input";

/**
 * Advanced Search Component
 * Provides search, filter, and sort capabilities
 */
export default function AdvancedSearch({
  onSearch = null,
  onFilterChange = null,
  onSortChange = null,
  searchPlaceholder = "Search...",
  sortOptions = [],
  showSort = true,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSortChange = (e) => {
    const field = e.target.value;
    setSortBy(field);
    if (onSortChange) {
      onSortChange(field, sortDirection);
    }
  };

  const toggleSortDirection = () => {
    const newDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newDirection);
    if (onSortChange && sortBy) {
      onSortChange(sortBy, newDirection);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setSortBy("");
    setSortDirection("asc");
    if (onSearch) onSearch("");
    if (onSortChange) onSortChange("", "asc");
    if (onFilterChange) onFilterChange({});
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {/* Search Input */}
        <div className="sm:col-span-2 lg:col-span-2">
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>

        {/* Sort Controls */}
        {showSort && sortOptions.length > 0 && (
          <>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:border-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Sort by</option>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {sortBy && (
              <button
                onClick={toggleSortDirection}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                title={`Sort ${sortDirection === "asc" ? "descending" : "ascending"}`}
              >
                {sortDirection === "asc" ? "↑ ASC" : "↓ DESC"}
              </button>
            )}
          </>
        )}

        {/* Clear Button */}
        {(searchTerm || sortBy) && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClear}
            className="w-full sm:w-auto"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Search Summary */}
      {(searchTerm || sortBy) && (
        <div className="mt-3 rounded-lg bg-blue-50 p-2">
          <p className="text-xs text-blue-700">
            {searchTerm && <span>Searching for: <strong>{searchTerm}</strong></span>}
            {searchTerm && sortBy && <span> • </span>}
            {sortBy && (
              <span>
                Sorted by: <strong>{sortOptions.find((o) => o.value === sortBy)?.label}</strong>{" "}
                {sortDirection === "desc" && "(descending)"}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
