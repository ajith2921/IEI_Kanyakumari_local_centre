import Button from "../ui/Button";
import { exportToCSV, exportToJSON } from "../../utils/exportUtils";

/**
 * Admin Table Export Toolbar
 * Displays export options for table data
 */
export default function AdminTableExport({
  items = [],
  exportColumns = [],
  entityName = "data",
  selectedIds = null,
  loading = false,
}) {
  const itemsToExport = selectedIds
    ? items.filter((item) => selectedIds.has(item.id))
    : items;

  const handleExportCSV = () => {
    if (itemsToExport.length === 0) {
      alert(`No ${entityName} selected for export`);
      return;
    }
    const timestamp = new Date().toISOString().split("T")[0];
    exportToCSV(itemsToExport, exportColumns, `${entityName}_${timestamp}.csv`);
  };

  const handleExportJSON = () => {
    if (itemsToExport.length === 0) {
      alert(`No ${entityName} selected for export`);
      return;
    }
    const timestamp = new Date().toISOString().split("T")[0];
    exportToJSON(itemsToExport, `${entityName}_${timestamp}.json`);
  };

  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-lg bg-gray-50 p-4 sm:flex-row sm:items-center">
      <p className="text-sm text-gray-600">
        {itemsToExport.length} item{itemsToExport.length !== 1 ? "s" : ""} available for export
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleExportCSV}
          disabled={itemsToExport.length === 0 || loading}
        >
          📥 Export as CSV
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleExportJSON}
          disabled={itemsToExport.length === 0 || loading}
        >
          📥 Export as JSON
        </Button>
      </div>
    </div>
  );
}
