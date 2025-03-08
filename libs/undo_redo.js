// Declare the necessary variables globally
let history = [];
let currentHistoryIndex = -1; // Tracks the current position in the history array.
const maxHistory = 30;         // Maximum history size to keep.
let lastSavedText = '';
let textArea = null;           // Reference to the textarea element
let isSaving = false;          // Prevent re-entrant saves

// Function to initialize the text area and event listeners
function initTextArea() {
    textArea = document.getElementById('main-text');
    if (!textArea) return;
    
    lastSavedText = textArea.value;
    let cursorAdjustment = 0; // Tracks adjustment needed for cursor position
  
    // Capture keydown events to adjust cursor position logic
    textArea.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        cursorAdjustment = 1; // Increase cursor position by 1 on backspace
      } else {
        cursorAdjustment = -1; // Decrease cursor position by 1 on other keys
      }
    });
  
    // Listen for input events and record history
    textArea.addEventListener('input', () => {
      if (isSaving) return;
      isSaving = true;
  
      const currentValue = textArea.value;
      let cursorPosition = textArea.selectionStart + cursorAdjustment; // Apply adjustment
  
      if (currentValue !== lastSavedText) {
        // Truncate future history if not at the end
        if (currentHistoryIndex < history.length - 1) {
          history = history.slice(0, currentHistoryIndex + 1);
        }
        saveState(currentValue, cursorPosition);
        lastSavedText = currentValue;
      }
  
      // Reset cursor adjustment after applying it
      cursorAdjustment = 0;
      isSaving = false;
    });
  
    // Listen for undo (Ctrl+Z) and redo (Ctrl+Y) key combinations
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.code === 'KeyZ') {
          e.preventDefault();
          undo();
        }
        if (e.code === 'KeyY') {
          e.preventDefault();
          redo();
        }
      }
    });
  
    // Save the initial state
    saveState(textArea.value, textArea.selectionStart);
  }
  

function saveState(currentValue, cursorPosition) {
    if (history.length >= maxHistory) {
      history.shift(); // Remove the oldest entry if at max
    }
  
    // Ensure the last history entry (if exists) has the same cursor position
    if (history.length > 0) {
      history[history.length - 1].cursor = cursorPosition;
    }
  
    history.push({ text: currentValue, cursor: cursorPosition });
    currentHistoryIndex = history.length - 1;
  }
  

// Undo: restore the previous state (if available)
function undo() {
  if (currentHistoryIndex > 0) {
    currentHistoryIndex--;
    restoreState(history[currentHistoryIndex]);
  }
}

// Redo: restore the next state (if available)
function redo() {
  if (currentHistoryIndex < history.length - 1) {
    currentHistoryIndex++;
    if(history.length == currentHistoryIndex+1){
      restoreState(history[currentHistoryIndex],true);
    }
    else{restoreState(history[currentHistoryIndex]);}
  }
}

// Restore a saved state
function restoreState(state,last_redo=false) {
  if (textArea) {
    textArea.value = state.text;
    lastSavedText = state.text; // Sync lastSavedText to the restored text

    textArea.selectionEnd = textArea.selectionStart = state.cursor;
    textArea.blur();
    textArea.focus();
    if(last_redo){
      textArea.setSelectionRange(state.cursor+1, state.cursor+1);
    }
    else{
      textArea.setSelectionRange(state.cursor, state.cursor);
    }
}
}

// Initialize the text area when the page loads
document.addEventListener('DOMContentLoaded', initTextArea);

// Manually trigger a change when the value of the textarea is altered programmatically
function manualValueChange(newValue) {
  if (textArea) {
      textArea.value = newValue;
      const lastCursor = history.length ? history[history.length - 1].cursor : 0; // Use last known cursor position
      saveState(newValue, lastCursor);
      hideWords();
  }
}