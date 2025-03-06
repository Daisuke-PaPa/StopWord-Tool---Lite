
  document.addEventListener("DOMContentLoaded", function () {
    const dbAction = document.getElementById("db_action");
    const dbSelectDiv = document.getElementById("db_select_div");
    const dbName = document.getElementById("db_name");

    if (dbAction) {
      dbAction.addEventListener("change", function () {
        if ((this.value === "rename") || (this.value === "duplicate")) {
          dbName.classList.remove("tn_hidden");
          dbSelectDiv.classList.remove("tn_hidden");
        } else if ((this.value === "delete") || (this.value === "switch_to")) {
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

function manage_db() {
    const action = document.getElementById("db_action").value;

    if (action === "rename") {
        db_rename();
    } else if (action === "delete") {
        db_delete();
    } else if (action === "create") {
        db_create();
    } else if (action === "switch_to") {
        db_switch();
    } else if (action == "duplicate") {
        db_duplicate();
    } else {
      showStatusNotification("ကဲဘာလုပ်မှာလဲပြော မင်းမကြိုက်ရင်လာမရှုပ်ပါနဲ့တော့");
    }
  }

  function db_rename() {
    const selectElem = document.getElementById("db_select");
    if (!selectElem) {
      showStatusNotification("Error: Database select element not found.");
      return;
    }
  
    const selectedOption = selectElem.selectedOptions[0];
    if (!selectedOption) {
      showStatusNotification("Error: No database selected.");
      return;
    }
  
    if (selectedOption.disabled) {
      showStatusNotification("Error: The selected database is disabled.");
      return;
    }
  
    const oldDBName = selectedOption.value;
  
    // Get new database name from input element with id "db_name_input"
    const inputElem = document.getElementById("db_name_input");
    if (!inputElem) {
      showStatusNotification("Error: Input element for new database name not found.");
      return;
    }
  
    const newDBName = inputElem.value.trim();
    if (!newDBName) {
      showStatusNotification("Error: New database name is empty.");
      return;
    }
    
    if (newDBName === oldDBName) {
      showStatusNotification("No change in database name.");
      return;
    }
  
    // Check if a database with newDBName already exists (if supported)
    if (indexedDB.databases) {
      indexedDB.databases().then((databases) => {
        if (databases.some(dbInfo => dbInfo.name === newDBName)) {
          showStatusNotification(`Error: Database '${newDBName}' already exists.`);
          return;
        }
        // Proceed with migration
        migrateDatabase(oldDBName, newDBName)
          .then(() => {
            localStorage.setItem("active_database", newDBName);
            openNewDatabase(newDBName);
            showStatusNotification(`Database renamed from '${oldDBName}' to '${newDBName}' successfully.`);
            // Optionally, delete the old database
            const deleteRequest = indexedDB.deleteDatabase(oldDBName);
            deleteRequest.onsuccess = () => console.log(`Old database '${oldDBName}' deleted.`);
            deleteRequest.onsuccess = () => document.querySelector(`#db_select option[value="${oldDBName}"]`)?.remove();
            deleteRequest.onerror = (event) => console.error("Error deleting old database:", event.target.error);
          })
          .catch((err) => {
            showStatusNotification("Error renaming database: " + err);
          });
      }).catch((err) => {
        showStatusNotification("Error checking available databases: " + err);
      });
    } else {
      // Fallback if indexedDB.databases() is not supported
      migrateDatabase(oldDBName, newDBName)
        .then(() => {
          localStorage.setItem("active_database", newDBName);
          openNewDatabase(newDBName);
          showStatusNotification(`Database renamed from '${oldDBName}' to '${newDBName}' successfully.`);
          const deleteRequest = indexedDB.deleteDatabase(oldDBName);
          deleteRequest.onsuccess = () => console.log(`Old database '${oldDBName}' deleted.`);
          deleteRequest.onerror = (event) => console.error("Error deleting old database:", event.target.error);
        })
        .catch((err) => {
          showStatusNotification("Error renaming database: " + err);
        });
    }
  }
  
  // Helper function to migrate data from oldDBName to newDBName.
  // This function opens the old database, copies all data from each object store,
  // then creates (or opens) the new database with the same object stores and writes the data.
  function migrateDatabase(oldDBName, newDBName) {
    return new Promise((resolve, reject) => {
      const openOldRequest = indexedDB.open(oldDBName);
      openOldRequest.onerror = (event) => {
        reject("Error opening old database: " + event.target.error);
      };
      openOldRequest.onsuccess = (event) => {
        const oldDB = event.target.result;
        const storeNames = Array.from(oldDB.objectStoreNames);
  
        // Open (or create) the new database with version 1.
        const openNewRequest = indexedDB.open(newDBName, 1);
        openNewRequest.onupgradeneeded = (event) => {
          const newDB = event.target.result;
          storeNames.forEach((storeName) => {
            if (!newDB.objectStoreNames.contains(storeName)) {
              newDB.createObjectStore(storeName, { autoIncrement: true });
            }
          });
        };
        openNewRequest.onerror = (event) => {
          reject("Error opening new database: " + event.target.error);
        };
        openNewRequest.onsuccess = (event) => {
          const newDB = event.target.result;
          const migrationPromises = storeNames.map((storeName) => {
            return new Promise((res, rej) => {
              const transactionOld = oldDB.transaction(storeName, "readonly");
              const oldStore = transactionOld.objectStore(storeName);
              const getAllReq = oldStore.getAll();
  
              getAllReq.onerror = () => {
                rej("Error reading data from store: " + storeName);
              };
              getAllReq.onsuccess = (e) => {
                const data = e.target.result;
                if (!data || data.length === 0) {
                  res();
                  return;
                }
                const transactionNew = newDB.transaction(storeName, "readwrite");
                const newStore = transactionNew.objectStore(storeName);
                let addPromises = data.map((item) => {
                  return new Promise((r, rj) => {
                    const addReq = newStore.add(item);
                    addReq.onsuccess = () => r();
                    addReq.onerror = () => rj("Error adding item to store: " + storeName);
                  });
                });
                Promise.all(addPromises)
                  .then(() => res())
                  .catch((err) => rej(err));
              };
            });
          });
          Promise.all(migrationPromises)
            .then(() => {
              oldDB.close();
              newDB.close();
              resolve();
            })
            .catch((err) => reject(err));
        };
      };
    });
  }  

  function db_delete() {
    const selectElem = document.getElementById("db_select");
    if (!selectElem) {
      showStatusNotification("Error: Database select element not found.");
      return;
    }
  
    const selectedOption = selectElem.selectedOptions[0];
    if (!selectedOption) {
      showStatusNotification("Error: No database selected.");
      return;
    }
    
    if (selectedOption.disabled) {
      showStatusNotification("Error: The selected database is disabled.");
      return;
    }
    
    const dbNameToDelete = selectedOption.value;
    
    // Confirm deletion with the user.
    if (!confirm(`Are you sure you want to delete the database '${dbNameToDelete}'? This action cannot be undone.`)) {
      showStatusNotification("Deletion cancelled.");
      return;
    }
    
    const deleteRequest = indexedDB.deleteDatabase(dbNameToDelete);
    
    deleteRequest.onsuccess = () => {
      showStatusNotification(`Database '${dbNameToDelete}' deleted successfully.`);
      
      // If the deleted database was the active database, remove it.
      if (localStorage.getItem("active_database") === dbNameToDelete) {
        localStorage.removeItem("active_database");
        db = null;
      }
      populateDatabaseList();
    };
    
    deleteRequest.onerror = (event) => {
      showStatusNotification(`Error deleting database '${dbNameToDelete}': ${event.target.error}`);
    };
    
    deleteRequest.onblocked = () => {
      showStatusNotification(`Deletion blocked: Switch to other database first before deleting '${dbNameToDelete}'.`);
    };
  }
  

  function db_create() {
    const dbNameInput = document.getElementById("db_name_input");
    if (!dbNameInput) {
        showStatusNotification("Error: Database name input not found.");
        return;
    }

    const newDbName = dbNameInput.value.trim();
    if (!newDbName) {
        showStatusNotification("Error: Database name cannot be empty.");
        return;
    }

    // Check if the database already exists
    const existingDbs = Array.from(document.getElementById("db_select").options).map(option => option.value);
    if (existingDbs.includes(newDbName)) {
        showStatusNotification(`Error: Database '${newDbName}' already exists.`);
        return;
    }

    const request = indexedDB.open(newDbName, 1);

    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const storeNames = ["csw_list", "fix_segment", "hide_list"];

        storeNames.forEach(store => {
            if (!db.objectStoreNames.contains(store)) {
                db.createObjectStore(store, { keyPath: "id", autoIncrement: true });
            }
        });
    };

    request.onsuccess = (event) => {
        const db = event.target.result;
        localStorage.setItem("active_database", newDbName);
        showStatusNotification(`Database '${newDbName}' created successfully.`);
        openNewDatabase(newDbName); // Switch to new database
        populateDatabaseList(); // Refresh database list
    };

    request.onerror = (event) => {
        showStatusNotification(`Error creating database '${newDbName}': ${event.target.error}`);
    };
}

  

function db_switch() {
  const selectElem = document.getElementById("db_select");
  if (!selectElem) {
    showStatusNotification("Error: Select element 'db_select' not found.");
    return;
  }

  // Get the first selected option.
  const selectedOption = selectElem.selectedOptions[0];
  if (!selectedOption) {
    showStatusNotification("Error: No option selected.");
    return;
  }

  // Do not proceed if the selected option is disabled.
  if (selectedOption.disabled) {
    showStatusNotification("တစ်ခုရွေးလေ အော်");
    return;
  }

  const newDBName = selectedOption.value;
  if (!newDBName) {
    showStatusNotification("Error: No database name provided.");
    return;
  }

  // Check if the database exists (using the experimental indexedDB.databases API if available)
  if (indexedDB.databases) {
    indexedDB.databases()
      .then((databases) => {
        const exists = databases.some((dbInfo) => dbInfo.name === newDBName);
        if (!exists) {
          showStatusNotification(`Error: Database '${newDBName}' does not exist.`);
          return;
        }
        openNewDatabase(newDBName);
      })
      .catch((err) => {
        showStatusNotification("Error checking available databases: " + err);
      });
  } else {
    // If the API isn't supported, assume the database exists.
    openNewDatabase(newDBName);
  }
}

function openNewDatabase(newDBName) {
  // Update local storage with the new active database name.
  localStorage.setItem("active_database", newDBName);

  const request = indexedDB.open(newDBName);

  request.onupgradeneeded = (event) => {
    db = event.target.result;
    // Create object stores if they don't exist.
    ["csw_list", "fix_segment", "hide_list"].forEach((store) => {
      if (!db.objectStoreNames.contains(store)) {
        db.createObjectStore(store, { autoIncrement: true });
      }
    });
    showStatusNotification(`Database '${newDBName}' created/upgraded to version ${db.version}.`);
  };

  request.onsuccess = (event) => {
    db = event.target.result;
    showStatusNotification(`Database switched to '${newDBName}' successfully (version ${db.version}).`);
    populateDatabaseList();
  };

  request.onerror = (event) => {
    showStatusNotification(`Error switching to database '${newDBName}': ${event.target.error}`);
  };
}

function db_duplicate() {
  const dbSelect = document.getElementById("db_select");
  const originalDBName = dbSelect.value; // Get selected DB name
  const newDBName = document.getElementById("db_name_input").value.trim(); // Get new DB name

  if (!originalDBName || !newDBName) {
      showStatusNotification("Please select a database and enter a new name.");
      return;
  }

  // Open the original database
  const request = indexedDB.open(originalDBName);
  request.onsuccess = (event) => {
      const originalDB = event.target.result;
      const objectStoreNames = Array.from(originalDB.objectStoreNames); // Get all stores

      // Create a new database with the same version as the original
      const duplicateRequest = indexedDB.open(newDBName, originalDB.version);
      duplicateRequest.onupgradeneeded = (dupEvent) => {
          const duplicateDB = dupEvent.target.result;

          // Ensure the required stores are created
          const storeNames = ["csw_list", "fix_segment", "hide_list"];
          storeNames.forEach(store => {
              if (!duplicateDB.objectStoreNames.contains(store)) {
                  duplicateDB.createObjectStore(store, { keyPath: "id", autoIncrement: true });
              }
          });

          // Create stores from the original DB if not already included
          objectStoreNames.forEach(storeName => {
              if (!duplicateDB.objectStoreNames.contains(storeName)) {
                  duplicateDB.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
              }
          });
      };

      duplicateRequest.onsuccess = (dupEvent) => {
          const duplicateDB = dupEvent.target.result;
          const transaction = originalDB.transaction(objectStoreNames, "readonly");

          // Copy all data from original DB to the duplicate
          objectStoreNames.forEach(storeName => {
              const originalStore = transaction.objectStore(storeName);
              const duplicateTransaction = duplicateDB.transaction(storeName, "readwrite");
              const duplicateStore = duplicateTransaction.objectStore(storeName);

              originalStore.getAll().onsuccess = (dataEvent) => {
                  dataEvent.target.result.forEach(item => duplicateStore.add(item));
              };
          });

          // Switch to the newly duplicated database
          localStorage.setItem("active_database", newDBName);
          showStatusNotification(`Database '${originalDBName}' duplicated as '${newDBName}'.`);
          openNewDatabase(newDBName); // Switch to the new duplicated database
          populateDatabaseList(); // Refresh the database list
      };

      duplicateRequest.onerror = () => {
          showStatusNotification(`Error duplicating database: ${duplicateRequest.error}`);
      };
  };

  request.onerror = () => {
      showStatusNotification(`Error opening database: ${request.error}`);
  };
}

