

// Function to build table rows
async function populateTable() {
    let tbody = document.querySelector("tbody");
    tbody.innerHTML = ""; // Clear existing rows

    let groups = ["db_index", "hide_list", "csw_list", "fix_segment"];
    let dataMap = {};

    // Fetch data for all groups
    for (let group of groups) {
        dataMap[group] = await fetchGroupData(group);
    }

    let maxRows = Math.max(
        dataMap["hide_list"].length,
        dataMap["csw_list"].length,
        dataMap["fix_segment"].length
    );

    for (let i = 0; i < maxRows; i++) {
        let row = document.createElement("tr");

        // Create table cells dynamically
        groups.forEach(group => {
            let cell = document.createElement("td");
            cell.className = group;

            if (group === "fix_segment") {
                let itemA = dataMap[group][i * 2] || "";
                let itemB = dataMap[group][i * 2 + 1] || "";
                cell.textContent = `${itemA} | ${itemB}`; // Format fix_segment
            } else {
                cell.textContent = dataMap[group][i] || ""; // Regular cases
            }

            row.appendChild(cell);
        });

        tbody.appendChild(row); // Append row to table
    }
}

// Call populateTable to update table
//populateTable();