async function add_hide_list() {
    fixSpacing();
    var text = document.getElementById('main-text').value;
    const hidelist = document.getElementById('hide_list').value.trim();

    if (!hidelist) {
        showStatusNotification("Hide ရမယ့်ဟာ ထည့်လေ အော်");
        return;
    }

    showStatusNotification('Adding Word to hide list...', false);
    let hideArray = hidelist.split("\n").map(item => item.trim()).filter(item => item !== ""); // Remove empty entries

    if (hideArray.length === 0) {
        showStatusNotification("Empty words can't be hidden!", true);
        return;
    }

    try {
        const exists = await checkGroupExists("hide_list");

        if (!exists) {
            console.log("Group doesn't exist. Creating group...");
            await createGroup("hide_list");
        }

        let promises = hideArray.map(hideItem => addDataToGroup("hide_list", { hide_item: hideItem }));

        await Promise.all(promises); // Wait for all segments to be added
        await hideWords();
        showStatusNotification('Word(s) hidden successfully ^_^', true);
        
        // Clear the text areas after adding segments
        document.getElementById('hide_list').value = '';
        
        // Close the modal if the overlay exists
        document.querySelector('.modal-overlay')?.click();

    } catch (error) {
        console.error("Error during segment addition:", error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.matches(".modal")) {
                // Check if the modal is hidden
                if (getComputedStyle(mutation.target).display === "none" || !mutation.target.offsetParent) {
                    const textArea = document.getElementById("main-text");
                    if (textArea && document.activeElement !== textArea) {
                        textArea.focus();
                    }
                }
            }
        });
    });

    document.querySelectorAll(".modal").forEach(modal => {
        observer.observe(modal, { attributes: true, attributeFilter: ["style", "class"] });
    });
});
