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

  async function getTDValues() {
    showStatusNotification("Fetching Table..");
    const classes = ["hide_list", "csw_list", "fix_segment"];
    let results = {};

    classes.forEach(cls => {
        results[cls] = [];
        document.querySelectorAll(`td.${cls}`).forEach(td => {
            let text = td.innerText.trim();
            if (text) results[cls].push(text);
        });
    });

    console.log(results);
    saveToIndexedDB(results);
    return results;
}

async function saveToIndexedDB(data) {
    showStatusNotification("အားအား");
    let request = indexedDB.open(activeDBName);

    request.onupgradeneeded = function(event) {
        let db = event.target.result;
        
        // Create object stores based on the data structure
        Object.keys(data).forEach(group => {
            if (!db.objectStoreNames.contains(group)) {
                db.createObjectStore(group, { autoIncrement: true }); // Store expects objects
            }
        });
    };

    request.onsuccess = function(event) {
        let db = event.target.result;
        let transaction = db.transaction(Object.keys(data), "readwrite");

        Object.keys(data).forEach(group => {
            let store = transaction.objectStore(group);
            store.clear(); // Clear the current store

            // Process each group based on specific logic
            data[group].forEach(item => {
                if (group === "csw_list") {
                    // Save each item as csw_item in csw_list
                    store.add({ csw_item: item });
                } else if (group === "fix_segment") {
                    // Process the fix segment (a | dog) and save them together in the same object
                    let [wrongSegment, rightSegment] = item.split(" | ");
                    store.add({ wrong_segment: wrongSegment, right_segment: rightSegment });
                } else if (group === "hide_list") {
                    // Save each item as hide_item in hide_list
                    store.add({ hide_item: item });
                } else {
                    // Default case for any other groups (just save as is)
                    store.add({ value: item });
                }
            });
        });

        transaction.oncomplete = function() {
            console.log("Data successfully saved to IndexedDB");
            showStatusNotification("ပြီးပါပြီ");
        };
    };

    request.onerror = function(event) {
        console.error("IndexedDB error:", event.target.error);
    };
}





