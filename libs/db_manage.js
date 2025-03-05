
  document.addEventListener("DOMContentLoaded", function () {
    const dbAction = document.getElementById("db_action");
    const dbSelectDiv = document.getElementById("db_select_div");
    const dbName = document.getElementById("db_name");

    if (dbAction) {
      dbAction.addEventListener("change", function () {
        if (this.value === "rename") {
          dbName.classList.remove("tn_hidden");
          dbSelectDiv.classList.remove("tn_hidden");
        } else if (this.value === "delete") {
          dbName.classList.add("tn_hidden");
          dbSelectDiv.classList.remove("tn_hidden");
        } else if (this.value === "create") {
          dbName.classList.remove("tn_hidden");
          dbSelectDiv.classList.add("tn_hidden");
        }
      });
    }
  });

function populateDatabaseList(){
    const dbSelect = document.getElementById("db_select");

    if (dbSelect && 'databases' in indexedDB) {
      indexedDB.databases().then(databases => {
        console.log("Databases:", databases);
        // Keep the first "Select Database" option, then add the others
        dbSelect.innerHTML = `<option disabled selected>Select Database</option>`;
        databases.forEach(db => {
            if (db.name) {
              const option = document.createElement("option");
              option.value = db.name;
              option.textContent = db.name;
              dbSelect.appendChild(option);
            }
          });ini_select_shit();
      }).catch(error => {
        console.error("Error fetching databases:", error);
      });
    } else {
      console.error("indexedDB.databases() is not supported in this browser.");
    }
}
