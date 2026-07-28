export function exportToExcel(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]) {
  if (!rows || rows.length === 0) {
    alert("No data available to export.");
    return;
  }

  // Format headers and rows cleanly into CSV RFC-4180 format
  const cleanHeaders = headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(",");
  const cleanRows = rows.map((row) =>
    row
      .map((cell) => {
        if (cell === null || cell === undefined) return '""';
        return `"${String(cell).replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  const csvContent = "\uFEFF" + [cleanHeaders, ...cleanRows].join("\n"); // Add UTF-8 BOM for Excel compatibility
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  const dateStr = new Date().toISOString().split("T")[0];
  link.setAttribute("download", `${filename}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
