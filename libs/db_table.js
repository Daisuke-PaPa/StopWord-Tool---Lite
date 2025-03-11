document.getElementById('header-h3').innerText = activeDBName;

async function generateTableRows() {
    showStatusNotification("Loading Table...");
    // Get the target database name.
    const activeDBName = localStorage.getItem("active_database");
    
    // Fetch data for each group.
    const hideListData = await fetchGroupData("hide_list") ?? [];
    const cswListData  = await fetchGroupData("csw_list") ?? [];
    const fixSegmentData = await fetchGroupData("fix_segment") ?? [];
  
    // Determine the maximum number of rows needed.
    const maxRows = Math.max(hideListData.length, cswListData.length, fixSegmentData.length);
  
    // Get the table body element.
    const tbody = document.querySelector("table.responsive-table tbody");
    tbody.innerHTML = ""; // Clear existing rows.
  
    // Generate rows.
    for (let i = 0; i < maxRows; i++) {
        const row = document.createElement("tr");
  
        // Column 1: DB Index (row number)
        const tdIndex = document.createElement("td");
        tdIndex.className = "db_index";
        tdIndex.textContent = i+1;
        row.appendChild(tdIndex);
  
        // Column 2: Hide List group.
        const tdHide = document.createElement("td");
        tdHide.className = "hide_list";
        tdHide.textContent = hideListData[i]?.hide_item ?? ""; // Avoid errors if undefined.
        row.appendChild(tdHide);
  
        // Column 3: CSW group.
        const tdCsw = document.createElement("td");
        tdCsw.className = "csw_list";
        tdCsw.textContent = cswListData[i]?.csw_item ?? "";
        row.appendChild(tdCsw);
  
        // Column 4: Fix Segment group (2 items per row).
        const tdFix = document.createElement("td");
        tdFix.className = "fix_segment";
        
        let itemA = fixSegmentData[i]?.wrong_segment ?? "";
        let itemB = fixSegmentData[i]?.right_segment ?? "";
        tdFix.textContent = itemA && itemB ? `${itemA} | ${itemB}` : itemA || itemB; // Avoid " | " when empty.
        
        row.appendChild(tdFix);
  
        // Append the row to the table body.
        tbody.appendChild(row);
        
    }
    showStatusNotification("ရာမဲတဲ အိုနီးချန်");
  }




