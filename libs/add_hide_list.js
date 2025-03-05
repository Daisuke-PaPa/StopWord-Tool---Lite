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
    let savedState = null; // Global state to hold the textarea's cursor and scroll positions
  
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.target.matches(".modal")) {
          const modal = mutation.target;
          const textArea = document.getElementById("main-text");
          const isVisible = window.getComputedStyle(modal).display !== "none";
  
          // When modal becomes visible, save the state (only once)
          if (isVisible && savedState === null && textArea) {
            savedState = {
              selectionStart: textArea.selectionStart,
              selectionEnd: textArea.selectionEnd,
              scrollTop: textArea.scrollTop,
              scrollLeft: textArea.scrollLeft
            };
            console.log("State saved:", savedState);
          }
          // When modal becomes hidden, restore the state
          else if (!isVisible && savedState !== null && textArea) {
            // Use a minimal delay to let the modal finish hiding
            setTimeout(() => {
              textArea.focus({ preventScroll: true });
              textArea.setSelectionRange(savedState.selectionStart, savedState.selectionEnd);
              textArea.scrollTop = savedState.scrollTop;
              textArea.scrollLeft = savedState.scrollLeft;
              console.log("State restored:", savedState);
              savedState = null; // Clear saved state after restoring
            }, 0);
          }
        }
      });
    });
  
    // Observe style and class changes on all elements with the class "modal"
    document.querySelectorAll(".modal").forEach(modal => {
      observer.observe(modal, { attributes: true, attributeFilter: ["style", "class"] });
    });
  });
