import { useState, useCallback } from "react";

/**
 * Advanced Search and Filter Utilities
 * Provides client-side search and filtering capabilities
 */

/**
 * Simple text search across object properties
 * @param {Array} items - Array of objects to search
 * @param {string} searchTerm - Term to search for
 * @param {Array<string>} searchFields - Fields to search in
 * @returns {Array} Filtered items
 */
export function searchItems(items, searchTerm, searchFields = []) {
  if (!searchTerm.trim() || searchFields.length === 0) {
    return items;
  }

  const term = searchTerm.toLowerCase();
  return items.filter((item) =>
    searchFields.some((field) => {
      const value = getNestedProperty(item, field);
      return String(value).toLowerCase().includes(term);
    })
  );
}

/**
 * Filter items by date range
 * @param {Array} items - Array of objects to filter
 * @param {string} dateField - Field name containing the date
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Array} Filtered items
 */
export function filterByDateRange(items, dateField, startDate, endDate) {
  if (!startDate || !endDate) {
    return items;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // Include entire end date

  return items.filter((item) => {
    const value = getNestedProperty(item, dateField);
    if (!value) return false;
    const itemDate = new Date(value);
    return itemDate >= start && itemDate <= end;
  });
}

/**
 * Filter items by multiple conditions
 * @param {Array} items - Array of objects to filter
 * @param {Object} filters - Object with {fieldName: value} pairs
 * @returns {Array} Filtered items
 */
export function filterByFields(items, filters) {
  return items.filter((item) =>
    Object.entries(filters).every(([field, value]) => {
      if (!value) return true; // Skip empty filters
      const itemValue = getNestedProperty(item, field);
      return String(itemValue).toLowerCase() === String(value).toLowerCase();
    })
  );
}

/**
 * Sort items by field
 * @param {Array} items - Array of objects to sort
 * @param {string} field - Field to sort by
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array} Sorted items
 */
export function sortItems(items, field, direction = "asc") {
  const sorted = [...items];
  sorted.sort((a, b) => {
    const aVal = getNestedProperty(a, field);
    const bVal = getNestedProperty(b, field);

    if (aVal == null) return 1;
    if (bVal == null) return -1;

    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();

    if (aStr < bStr) return direction === "asc" ? -1 : 1;
    if (aStr > bStr) return direction === "asc" ? 1 : -1;
    return 0;
  });
  return sorted;
}

/**
 * Get nested property from object (e.g., "user.address.city")
 * @param {Object} obj - Object to get property from
 * @param {string} path - Property path
 * @returns {any} Property value or undefined
 */
export function getNestedProperty(obj, path) {
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
}

/**
 * React Hook for advanced search and filtering
 * @param {Array} initialItems - Initial array of items
 * @param {Object} options - Configuration options
 * @returns {Object} Search state and functions
 */
export function useAdvancedSearch(initialItems, options = {}) {
  const {
    searchFields = [],
    sortField = null,
    sortDirection = "asc",
  } = options;

  const [items, setItems] = useState(initialItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilters, setDateFilters] = useState({ startDate: "", endDate: "", dateField: "created_at" });
  const [fieldFilters, setFieldFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ field: sortField, direction: sortDirection });

  // Apply all filters and search
  const applyFilters = useCallback(() => {
    let result = [...initialItems];

    // Apply text search
    if (searchTerm && searchFields.length > 0) {
      result = searchItems(result, searchTerm, searchFields);
    }

    // Apply date range filter
    if (dateFilters.startDate || dateFilters.endDate) {
      result = filterByDateRange(
        result,
        dateFilters.dateField,
        dateFilters.startDate,
        dateFilters.endDate
      );
    }

    // Apply field filters
    if (Object.keys(fieldFilters).length > 0) {
      result = filterByFields(result, fieldFilters);
    }

    // Apply sorting
    if (sortConfig.field) {
      result = sortItems(result, sortConfig.field, sortConfig.direction);
    }

    setItems(result);
  }, [initialItems, searchTerm, dateFilters, fieldFilters, sortConfig]);

  // Update items when filters change
  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return {
    items,
    searchTerm,
    setSearchTerm,
    dateFilters,
    setDateFilters,
    fieldFilters,
    setFieldFilters,
    sortConfig,
    setSortConfig,
    reset: () => {
      setSearchTerm("");
      setDateFilters({ startDate: "", endDate: "", dateField: "created_at" });
      setFieldFilters({});
      setSortConfig({ field: sortField, direction: sortDirection });
    },
  };
}

export default {
  searchItems,
  filterByDateRange,
  filterByFields,
  sortItems,
  getNestedProperty,
  useAdvancedSearch,
};
