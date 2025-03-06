// Global reference for the database and active database name
let db;
let activeDBName = localStorage.getItem("active_database");

// Function to initialize the IndexedDB using activeDBName
function initDB() {
    const request = indexedDB.open(activeDBName);

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        console.log(`Database '${activeDBName}' created/upgraded to version ${db.version}.`);

        // Create object stores if they don't exist
        ["csw_list", "fix_segment", "hide_list"].forEach((store) => {
            if (!db.objectStoreNames.contains(store)) {
                db.createObjectStore(store, { autoIncrement: true }); // Auto-generate keys
            }
        });
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        console.log(`Database '${activeDBName}' is ready. Version: ${db.version}`);
    };

    request.onerror = (event) => {
        console.error("Error opening database:", event.target.error);
    };
}

// Universal function to check if a group exists (generic)
function checkGroupExists(groupName) {
    return new Promise((resolve, reject) => {
        if (db) {
            // If global db is available, check directly
            resolve(db.objectStoreNames.contains(groupName));
        } else {
            // Otherwise, open the database and check
            const req = indexedDB.open(activeDBName);
            req.onsuccess = (event) => {
                const tempDB = event.target.result;
                resolve(tempDB.objectStoreNames.contains(groupName));
            };
            req.onerror = (event) => {
                reject(event.target.error);
            };
        }
    });
}

// Universal function to add data to a specified group (generic)
function addDataToGroup(groupName, data) {
    if (!db) {
        console.error("Database not initialized");
        return;
    }
    const transaction = db.transaction(groupName, 'readwrite');
    const store = transaction.objectStore(groupName);

    const request = store.add(data);

    request.onsuccess = () => {
        console.log(`Data added to ${groupName} group.`);
    };

    request.onerror = (event) => {
        console.error(`Error adding data to ${groupName}:`, event.target.error);
    };
}

// Determine activeDBName: check if one is set, otherwise list existing databases (if supported)
if (!activeDBName) {
    if (indexedDB.databases) {
        indexedDB.databases().then((databases) => {
            if (databases.length > 0) {
                // Use the last created database or default to "sw_data" if name is not available
                activeDBName = databases[databases.length - 1].name || "sw_data";
            } else {
                activeDBName = "sw_data";
            }
            localStorage.setItem("active_database", activeDBName);
            initDB();
        }).catch((error) => {
            console.error("Error listing databases:", error);
            activeDBName = "sw_data";
            localStorage.setItem("active_database", activeDBName);
            initDB();
        });
    } else {
        // Fallback if indexedDB.databases() is not supported
        activeDBName = "sw_data";
        localStorage.setItem("active_database", activeDBName);
        initDB();
    }
} else {
    // If activeDBName exists in localStorage, initialize DB immediately
    initDB();
}


//depricated
let upgradeInProgress = false; // Prevents multiple upgrades at the same time



function createGroup(groupName) {
    return new Promise((resolve, reject) => {
        if (upgradeInProgress) {
            console.log(`Upgrade in progress, waiting...`);
            setTimeout(() => createGroup(groupName).then(resolve).catch(reject), 100);
            return;
        }

        if (db.objectStoreNames.contains(groupName)) {
            console.log(`Group "${groupName}" already exists.`);
            resolve(db);
            return;
        }

        console.log(`Upgrading database to create group "${groupName}"...`);
        upgradeInProgress = true; // Mark as upgrading

        const currentVersion = db.version;
        db.close();
        const newVersion = currentVersion + 1;
        const request = indexedDB.open("sw_data", newVersion);

        request.onupgradeneeded = function(event) {
            let upgradeDB = event.target.result;
            if (!upgradeDB.objectStoreNames.contains(groupName)) {
                upgradeDB.createObjectStore(groupName, { autoIncrement: true });
                console.log(`Group "${groupName}" created.`);
            }
        };

        request.onsuccess = function(event) {
            db = event.target.result;
            upgradeInProgress = false; // Upgrade complete
            console.log(`Database upgraded. Group "${groupName}" is now ready.`);
            resolve(db);
        };

        request.onerror = function(event) {
            upgradeInProgress = false; // Reset flag
            console.error(`Failed to create group "${groupName}":`, event.target.error);
            reject(`Failed to create group "${groupName}": ${event.target.error}`);
        };
    });
}


// Function to fetch group data from the database
function fetchGroupData(groupName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([groupName], "readonly");
        const store = transaction.objectStore(groupName);
        
        const request = store.getAll(); // Get all entries from the group

        request.onsuccess = function(event) {
            resolve(event.target.result); // Return all segments in the group
        };

        request.onerror = function(event) {
            reject(event.target.error); // Return error if any
        };
    });
}