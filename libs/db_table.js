async function generateTableRows() {
  // Get the target database name.
  const activeDBName = localStorage.getItem("active_database");
  
  // Fetch data for each group.
  // Adjust the function signature as needed (e.g. fetchGroupData might require both parameters).
  const hideListData = await fetchGroupData(activeDBName, "hide_list");
  const cswListData  = await fetchGroupData(activeDBName, "csw_list");
  const fixSegmentData = await fetchGroupData(activeDBName, "fix_segment");

  // For fix_segment, each row will combine two items.
  const fixRows = Math.ceil(fixSegmentData.length / 2);
  // Get number of rows for hide_list and csw_list.
  const hideRows = hideListData.length;
  const cswRows  = cswListData.length;
  
  // Determine the maximum number of rows needed.
  const maxRows = Math.max(hideRows, cswRows, fixRows);

  // Get the table body element.
  const tbody = document.querySelector("table.responsive-table tbody");
  // Clear any existing rows.
  tbody.innerHTML = "";

  // Generate rows.
  for (let i = 0; i < maxRows; i++) {
      // Create a new table row.
      const row = document.createElement("tr");

      // Column 1: DB Index (row number)
      const tdIndex = document.createElement("td");
      tdIndex.className = "db_index";
      tdIndex.textContent = i;
      row.appendChild(tdIndex);

      // Column 2: Hide List group.
      const tdHide = document.createElement("td");
      tdHide.className = "hide_list";
      // If there is an item at index i, show it; otherwise leave blank.
      tdHide.textContent = hideListData[i] !== undefined ? hideListData[i] : "";
      row.appendChild(tdHide);

      // Column 3: CSW group.
      const tdCsw = document.createElement("td");
      tdCsw.className = "csw_list";
      tdCsw.textContent = cswListData[i] !== undefined ? cswListData[i] : "";
      row.appendChild(tdCsw);

      // Column 4: Fix Segment group (2 items per row).
      const tdFix = document.createElement("td");
      tdFix.className = "fix_segment";
      let itemA = fixSegmentData[2 * i];
      let itemB = fixSegmentData[2 * i + 1];
      // Only add the separator if both items exist.
      let fixText = "";
      if (itemA !== undefined) {
          fixText = itemA;
          if (itemB !== undefined) {
              fixText += " | " + itemB;
          }
      }
      tdFix.textContent = fixText;
      row.appendChild(tdFix);

      // Append the row to the table body.
      tbody.appendChild(row);
  }
}

generateTableRows;