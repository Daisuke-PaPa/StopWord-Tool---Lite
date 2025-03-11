// Get the active database name from localStorage
let activeDBName2 = localStorage.getItem("active_database");

// Function to fetch group data from IndexedDB
async function fetchGroupData2(groupName) {
  return new Promise((resolve, reject) => {
    let dbRequest = indexedDB.open(activeDBName2);
    
    dbRequest.onsuccess = function (event) {
      let db = event.target.result;
      let transaction = db.transaction([groupName], "readonly");
      let store = transaction.objectStore(groupName);
      
      // Get all data from the group
      store.getAll().onsuccess = function (event) {
        console.log(`Data for ${groupName}:`, event.target.result); // Log the data to debug
        resolve(event.target.result);
      };
      
      store.getAll().onerror = function (event) {
        reject("Error fetching data: " + event.target.error);
      };
    };

    dbRequest.onerror = function (event) {
      reject("Error opening database: " + event.target.error);
    };
  });
}

async function populateTable() {
    let tbody = document.querySelector("tbody");
    tbody.innerHTML = ""; // Clear the table before populating

    let groups = ["hide_list", "csw_list", "fix_segment"];
    let dataMap = {};

    // Fetch data for all groups
    for (let group of groups) {
        dataMap[group] = await fetchGroupData2(group);
    }

    // Populate table with fetched data
    for (let group of groups) {
        let groupData = dataMap[group];

        if (groupData && Array.isArray(groupData)) {
            groupData.forEach(item => {
                let row = document.createElement("tr");

                // Adjust this based on the structure of your `item`
                row.innerHTML = `
                    <td>${group}</td>
                    <td>${item || "N/A"}</td>
                    <td>${item.value || "N/A"}</td>
                `;

                tbody.appendChild(row);
            });
        }
    }
}

window.addEventListener("DOMContentLoaded", populateTable);

// Call renderTable function to populate the table
populateTable();

  
  
 
  