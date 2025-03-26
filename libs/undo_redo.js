// Declare the necessary variables globally
let history = [];
let currentHistoryIndex = -1; // Tracks the current position in the history array.
const maxHistory = 30;         // Maximum history size to keep.
let lastSavedText = '';
let textArea = null;           // Reference to the textarea element
let isSaving = false;          // Prevent re-entrant saves

// Initialize the textarea and event listeners
function initTextArea() {
  textArea = document.getElementById('main-text');
  if (!textArea) return;
  
  lastSavedText = textArea.value;
  
  // Update current history's cursor on click (and mouseup to cover non-click interactions)
  const updateCursor = () => {
    if (currentHistoryIndex >= 0 && history[currentHistoryIndex]) {
      history[currentHistoryIndex].cursor = textArea.selectionStart;
    }
  };
  textArea.addEventListener('click', updateCursor);
  textArea.addEventListener('mouseup', updateCursor);
  
  // Listen for input events and record history
  textArea.addEventListener('input', () => {
    if (isSaving) return;
    isSaving = true;
    
    const currentValue = textArea.value;
    // Capture the exact cursor position
    let cursorPosition = textArea.selectionStart;
    
    // Only save if the text actually changed
    if (currentValue !== lastSavedText) {
      // If not at the end of history, truncate future states
      if (currentHistoryIndex < history.length - 1) {
        history = history.slice(0, currentHistoryIndex + 1);
      }
      saveState(currentValue, cursorPosition);
      lastSavedText = currentValue;
    }
    
    isSaving = false;
  });
  
  // Listen for undo (Ctrl+Z) and redo (Ctrl+Y) key combinations
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.code === 'KeyZ') {
        e.preventDefault();
        undo();
      } else if (e.code === 'KeyY') {
        e.preventDefault();
        redo();
      }
    }
  });
  
  // Save the initial state
  saveState(textArea.value, textArea.selectionStart);
}

// Save the current state into history
function saveState(currentValue, cursorPosition) {
  // Remove the oldest entry if at max and adjust the index accordingly
  if (history.length >= maxHistory) {
    history.shift();
    currentHistoryIndex = Math.max(0, currentHistoryIndex - 1);
  }
  
  history.push({ text: currentValue, cursor: cursorPosition });
  currentHistoryIndex = history.length - 1;
  console.log(history);
}

// Restore a saved state exactly as saved
function restoreState(state,msg) {
  if (textArea) {
    textArea.value = state.text;
    lastSavedText = state.text; // Sync lastSavedText to the restored text
    // Simply restore the saved cursor position.
    textArea.selectionEnd = textArea.selectionStart = state.cursor;
    textArea.blur();
    textArea.focus();
    textArea.setSelectionRange(state.cursor, state.cursor);
    if(msg=="redo"){showStatusNotification("Redone")};
    if(msg=="undo"){showStatusNotification("Undone")};
  }
}

// Undo: restore the previous state (if available)
function undo() {
  if (currentHistoryIndex > 0) {
    currentHistoryIndex--;
    restoreState(history[currentHistoryIndex],"undo");
  }
}

// Redo: restore the next state (if available)
function redo() {
  if (currentHistoryIndex < history.length - 1) {
    currentHistoryIndex++;
    restoreState(history[currentHistoryIndex],"redo");
  }
}

async function manualValueChange(newValue) {
  if (!textArea) return;
  
  // Prevent recursive saves if a change is already being processed
  if (isSaving) return;
  isSaving = true;
  
  // Get the current state from history (or default)
  const current = history[currentHistoryIndex] || { text: "", cursor: textArea.selectionStart };
  
  // Check if the new value is actually different from the current state
  if (current.text === newValue) {
    console.log("New value matches current history. No update.");
    isSaving = false;
    return;
  }
  
  // Set the new value on the textArea
  textArea.value = newValue;
  
  // Capture the new cursor position (it might be reset by setting the value)
  const currentCursor = textArea.selectionStart;
  
  // If not at the end of the history, truncate future states
  if (currentHistoryIndex < history.length - 1) {
    history = history.slice(0, currentHistoryIndex + 1);
  }
  
  // Save the new state with both text and cursor position
  saveState(newValue, currentCursor);
  
  // Update the last saved text so that future changes compare correctly
  lastSavedText = newValue;
  
  isSaving = false;
  
  await hideWords();
}


// Initialize the textarea when the page loads
document.addEventListener('DOMContentLoaded', initTextArea);
