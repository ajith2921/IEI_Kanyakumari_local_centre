/**
 * Export utilities for admin dashboard
 */

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Column headers (keys from objects)
 * @param {string} filename - Name of the file to download
 */
export function exportToCSV(data, columns, filename = "export.csv") {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Create CSV header
  const header = columns.join(",");

  // Create CSV rows
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const value = item[col];
        // Escape quotes and wrap in quotes if contains comma or newline
        if (value === null || value === undefined) {
          return "";
        }
        const stringValue = String(value);
        if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(",")
  );

  const csv = [header, ...rows].join("\n");

  // Create blob and download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export array of objects to JSON file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file to download
 */
export function exportToJSON(data, filename = "export.json") {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export selected items to CSV
 * @param {Array} items - All items
 * @param {Array} selectedIds - IDs of selected items
 * @param {Array} columns - Column headers
 * @param {string} entityName - Name of entity for filename
 */
export function exportSelectedAsCSV(items, selectedIds, columns, entityName = "items") {
  const selected = items.filter((item) => selectedIds.includes(item.id));
  const timestamp = new Date().toISOString().split("T")[0];
  exportToCSV(selected, columns, `${entityName}_${timestamp}.csv`);
}

/**
 * Export selected items to JSON
 * @param {Array} items - All items
 * @param {Array} selectedIds - IDs of selected items
 * @param {string} entityName - Name of entity for filename
 */
export function exportSelectedAsJSON(items, selectedIds, entityName = "items") {
  const selected = items.filter((item) => selectedIds.includes(item.id));
  const timestamp = new Date().toISOString().split("T")[0];
  exportToJSON(selected, `${entityName}_${timestamp}.json`);
}
