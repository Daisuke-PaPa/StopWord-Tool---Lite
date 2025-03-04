async function add_csw_list() {
    fixSpacing();
    var text = document.getElementById('main-text').value;
    const cswList = document.getElementById('csw_list_input').value.trim();

    if (!cswList) {
        showStatusNotification("Please enter an item for CSW list.");
        return;
    }

    showStatusNotification('Adding Word to CSW list...', false);
    let cswArray = cswList.split("\n").map(item => item.trim()).filter(item => item); // Remove empty/null values

    if (cswArray.length === 0) {
        showStatusNotification("No valid items to add.");
        return;
    }

    try {
        const exists = await checkGroupExists("csw_list");

        if (!exists) {
            console.log("Group doesn't exist. Creating group...");
            await createGroup("csw_list"); // Wait for group creation to finish
        }

        let promises = cswArray.map(cswItem => {
            return addDataToGroup("csw_list", { csw_item: cswItem });
        });

        await Promise.all(promises); // Wait for all segments to be added
        manualValueChange(text);
        await hideWords();
        await processCSWMatches();
        showStatusNotification('CSW added successfully ^_^', true);
        
        // Clear the input after adding segments
        document.getElementById('csw_list_input').value = '';

        // Simulate a click on the modal overlay to close the modal
        document.querySelector('.modal-overlay')?.click();
        
    } catch (error) {
        console.error("Error during segment addition:", error);
    }
}
