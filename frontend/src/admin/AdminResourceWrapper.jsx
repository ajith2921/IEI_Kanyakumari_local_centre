import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import DateRangeFilter from "../components/DateRangeFilter";
import { exportToCSV, exportToJSON } from "../utils/exportUtils";

/**
 * Enhanced Resource Manager Wrapper
 * Adds export and filtering capabilities to resource managers
 */
export default function AdminResourceWrapper({
  title,
  children,
  items = [],
  exportColumns = [],
  entityName = "items",
  onFilterChange = null,
}) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [dateFilters, setDateFilters] = useState({ startDate: "", endDate: "" });
  const [filteredItems, setFilteredItems] = useState(items);

  useEffect(() => {
    setFilteredItems(items);
  }, [items]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredItems.map((item) => item.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectItem = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleExportCSV = () => {
    const data = filteredItems.filter((item) => selectedIds.has(item.id));
    if (data.length === 0) {
      alert("No items selected for export");
      return;
    }
    const timestamp = new Date().toISOString().split("T")[0];
    exportToCSV(data, exportColumns, `${entityName}_${timestamp}.csv`);
  };

  const handleExportJSON = () => {
    const data = filteredItems.filter((item) => selectedIds.has(item.id));
    if (data.length === 0) {
      alert("No items selected for export");
      return;
    }
    const timestamp = new Date().toISOString().split("T")[0];
    exportToJSON(data, `${entityName}_${timestamp}.json`);
  };

  const handleFilterChange = (filters) => {
    setDateFilters(filters);
    if (onFilterChange) {
      onFilterChange(filters);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="heading-h2 mb-2 font-semibold text-gray-900">{title}</h2>
        <p className="text-gray-600">
          Manage and organize {entityName} with advanced filtering and export capabilities.
        </p>
      </div>

      {/* Filtering Section */}
      <Card className="mb-6 p-4">
        <h3 className="mb-4 font-semibold text-gray-900">Filters</h3>
        <DateRangeFilter onApply={handleFilterChange} />
      </Card>

      {/* Export Controls */}
      {selectedIds.size > 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50 p-4">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p className="text-sm font-medium text-yellow-800">
              {selectedIds.size} item{selectedIds.size !== 1 ? "s" : ""} selected for export
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportCSV}
              >
                Export as CSV
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportJSON}
              >
                Export as JSON
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Resource Manager Children */}
      <div className="mb-6">
        {children}
      </div>

      {/* Selection Context */}
      {items.length > 0 && (
        <Card className="p-4 bg-gray-50 border-gray-200">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedIds.size === filteredItems.length && filteredItems.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">
                Select All ({filteredItems.length})
              </span>
            </label>
            {selectedIds.size > 0 && (
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear Selection
              </button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
