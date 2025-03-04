async function add_segment() {
    fixSpacing();
    const wrongText = document.getElementById('wrong_segment').value;
    const rightText = document.getElementById('right_segment').value;
    let main_text = document.getElementById('main-text').value;

    if (!wrongText || !rightText) {
        showStatusNotification("Please fill in both fields.");
        return;
    }

    showStatusNotification('Adding Segment...', false);
    const wrongArray = wrongText.split("\n");
    const rightArray = rightText.split("\n");
    

    if (wrongArray.length !== rightArray.length) {
        showStatusNotification("Mismatch in the number of wrong and right segments.");
        return;
    }

    try {
        const exists = await checkGroupExists("fix_segment");
        
        if (!exists) {
            console.log("Group doesn't exist. Creating group...");
            await createGroup("fix_segment"); // Wait for group creation to finish
        }

        let promises = [];

        for (let i = 0; i < wrongArray.length; i++) {
            main_text = main_text.replaceAll(wrongArray[i],rightArray[i]);
            let segmentData = {
                wrong_segment: wrongArray[i],
                right_segment: rightArray[i]
            };
            promises.push(addDataToGroup("fix_segment", segmentData));
        }

        await Promise.all(promises); // Wait for all segments to be added

        showStatusNotification('Segments added successfully ^_^', true);
        // Clear the text areas after adding segments
        
        document.getElementById('wrong_segment').value = '';
        document.getElementById('right_segment').value = '';
        manualValueChange(main_text);
        await hideWords();
 
        // Simulate a click on the modal overlay to close the modal
        var overlay = document.querySelector('.modal-overlay');
        if (overlay) {
            overlay.click();
        }

        
    } catch (error) {
        console.error("Error during segment addition:", error);
    }
}