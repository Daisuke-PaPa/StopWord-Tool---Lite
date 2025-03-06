// Declare the necessary variables globally
let history = [];
let currentHistoryIndex = -1; // Tracks the current position in the history array.
const maxHistory = 30; // Max history size to keep.
let lastSavedText = '';
let textArea = null; // Initially set textArea to null
let isSaving = false; // Prevents re-entrant execution

// Function to initialize the text area and event listeners
function initTextArea() {
    textArea = document.getElementById('main-text'); // Define textArea when the DOM is fully loaded

    if (textArea) {  // Ensure textArea exists before using it
        lastSavedText = textArea.value;

        // Listen for input to update history (only when necessary)
        textArea.addEventListener('input', function () {
            if (isSaving) return; // Prevent function from running if a save is in progress
            isSaving = true;

            const currentValue = textArea.value;
            const cursorPosition = textArea.selectionStart; // Get cursor position

            if (currentValue !== lastSavedText) {
                // If we're not at the end of the history, remove future history steps
                if (currentHistoryIndex < history.length - 1) {
                    history = history.slice(0, currentHistoryIndex + 1);
                }

                // Save the current state
                saveState(currentValue, cursorPosition);
                lastSavedText = currentValue;
            }

            isSaving = false;
        });

        document.addEventListener('keydown', function (e) {
            if (e.ctrlKey || e.metaKey) {
                const isTextAreaFocused = document.activeElement === textArea;
                const isInputOrTextAreaFocused = document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT';
        
                if (e.code === 'KeyZ') {
                    e.preventDefault();
                    if (isTextAreaFocused || (!isInputOrTextAreaFocused && !isTextAreaFocused)) {
                        undo();
                    }
                }
        
                if (e.code === 'KeyY') {
                    e.preventDefault();
                    if (isTextAreaFocused || (!isInputOrTextAreaFocused && !isTextAreaFocused)) {
                        redo();
                    }
                }
            }
        });        

        // Initial save state (when the page loads)
        saveState(textArea.value, textArea.selectionStart);
    }
}

// Save the current state of the textarea to history, including cursor position
function saveState(currentValue, cursorPosition) {
    if (history.length >= maxHistory) {
        history.shift(); // Remove the oldest entry if max limit is reached
    }
    history.push({ text: currentValue, cursor: cursorPosition });
    currentHistoryIndex = history.length - 1;
}

// Undo functionality
function undo() {
    if (currentHistoryIndex > 0) {
        currentHistoryIndex--;
        restoreState(history[currentHistoryIndex]);
    }
}

// Redo functionality
function redo() {
    if (currentHistoryIndex < history.length - 1) {
        currentHistoryIndex++;
        restoreState(history[currentHistoryIndex]);
    }
}

// Restore a saved state, including cursor position
function restoreState(state) {
    if (textArea) {
        textArea.value = state.text;
        setCursorPosition(state.cursor);
    }
}

// Set the cursor position in the text area
function setCursorPosition(index) {
    if (textArea) {
        textArea.selectionStart = textArea.selectionEnd = index;
        textArea.blur();
        textArea.focus();
    }
}

// Manually trigger a change when the value of the textarea is altered programmatically
function manualValueChange(newValue) {
    if (textArea) {
        textArea.value = newValue;
        const lastCursor = history.length ? history[history.length - 1].cursor : 0; // Use last known cursor position
        saveState(newValue, lastCursor);
    }
}

// Initialize the text area when the page loads
document.addEventListener('DOMContentLoaded', initTextArea);
