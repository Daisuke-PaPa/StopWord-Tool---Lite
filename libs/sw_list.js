// Run the function when the page is fully loaded
document.addEventListener("DOMContentLoaded", checkAndLoadSWList);

document.addEventListener("DOMContentLoaded",async function(){
    document.getElementById('main-text').value = JSON.parse(localStorage.getItem("work_file")) || "";
    currentFileName = JSON.parse(localStorage.getItem("work_file_name")) || "";
    if (document.getElementById('main-text').value !== "")
    {
        await hideWords();
        showStatusNotification('Save file loaded');
        text_content_memory = document.getElementById('main-text').value;
        console.log("Global Hidden Indexes:", globalHiddenIndexes);
        if(currentFileName!==""){document.title = currentFileName;}
    }
});

function create_sw_list() {
    const sw_list = {
        "က": ["ထို့ ကြောင့်", "ဒါ့ ကြောင့်", "ဒါ ကြောင့်", "ကို", "ကြီး", "ကြောင်း", "ကြည့်", "ကြ", "ကာ", "ကြောင့်", "ကဲ့", "ကွာ", "က", "ဤ"],
        "ခ": ["ခဲ့", "ခြင်း", "ချင်"],
        "စ": ["စေ", "စို့"],
        "ဆ": ["ဆို"],
        "တ": ["တို့", "တယ်", "တွေ", "တော့", "တည်း", "တဲ့", "တွင်"],
        "ထ": ["ထိ", "ထား", "ထဲ", "ထို"],
        "ဒ": ["ဒီ", "ဒါ"],
        "န": ["နှင့်", "နဲ့", "နေ", "နိုင်", "နော်"],
        "ပ": ["ပေါ့", "ပြီး", "ပြီ", "ပဲ", "ပါ", "ပေး"],
        "ဖ": ["ဖြစ်", "ဖို့", "ဖြင့်"],
        "ဗ": ["ဗျာ"],
        "ဘ": ["ဘယ်", "ဘဲ", "ဘာ", "ဘူး"],
        "မ": ["မည်", "မိ", "များ", "မည့်", "မှာ", "မှ", "မှု", "မင်း", "မယ်", "မယ့်", "မို့", "မ"],
        "ရ": ["ရှိ", "ရင်", "ရေး", "ရာ", "ရန်", "ရောက်", "ရဲ့", "ရဲ", "ရုံ", "ရှင့်", "ရ", "၍"],
        "လ": ["သလား", "လဲ", "လျှင်", "လေ", "လိမ့်", "လား", "လိုက်", "လို့", "လို", "လုပ်", "လာ", "လည်း", "လည်းကောင်း"],
        "ဝ": ["ဝံ့"],
        "သ": ["သည်", "သာ", "သည့်", "သို့", "သော", "သူ", "သလို", "သော်", "သြော်", "သွား", "သြ"],
        "ဟ": ["ဟုတ်", "ဟု", "ဟာ", "ဟို"],
        "အ": ["အတွင်း", "အတွက်", "အား", "အောင်", "အဲ့", "အံ့", "အံ့သြ", "အထိ", "အ"],
        "၌-ဦး": ["၌", "၎င်း", "၏", "ဦး"],
        "SW File": [""]
    };
    
    localStorage.setItem("sw_list", JSON.stringify(sw_list));
    console.log("sw_list has been initialized and saved to local storage.");
}

let sw_global = {};
let sw_index = "က";

function checkAndLoadSWList() {
    if (!localStorage.getItem("sw_list")) {
        create_sw_list();
    }

    // Load the data into the global array
    sw_global = JSON.parse(localStorage.getItem("sw_list")) || {};
    console.log("sw_list loaded into global array:", sw_global);
    displaySWList();
}

function displaySWList() {
    const textBox = document.getElementById("sw_list");

    if (!sw_global || !sw_index || !sw_global[sw_index]) {
        console.error("Invalid sw_index or sw_list not found.");
        textBox.value = "No data found.";
        return;
    }

    // Get the values from the selected key
    const values = sw_global[sw_index];

    // Join the values with line breaks and display in the textbox
    textBox.value = values.join("\n");
    document.getElementById("sw_label").innerText = sw_index;
    
    if (sw_index == 'က') {
        document.getElementById("sw_left").classList.add("disabled");
        document.getElementById("sw_right").classList.remove("disabled");
    }
    else if (sw_index == 'SW File') {
        document.getElementById("sw_right").classList.add("disabled");
        document.getElementById("sw_left").classList.remove("disabled");
    }
    else
    {
        document.getElementById("sw_left").classList.remove("disabled");
        document.getElementById("sw_right").classList.remove("disabled");
    }
}

function moveSwIndex(direction) {
    const keys = Object.keys(sw_global); // Get all keys in sw_global
    const currentIndex = keys.indexOf(sw_index); // Get the current index of sw_index

    console.log("Moving from index:", currentIndex, "with direction:", direction);

    if (currentIndex === -1) {
        console.error("sw_index not found in sw_global.");
        return;
    }

    // Store the old sw_index (key name) before attempting the move
    const oldIndex = sw_index;

    // Calculate the new index based on the direction
    let newIndex = currentIndex + direction;

    // Check if the new index is within bounds
    if (newIndex >= 0 && newIndex < keys.length) {
        console.log("Moving to index:", newIndex);
        // Update sw_index with the new key name
        sw_index = keys[newIndex];
        displaySWList(); // Call the displaySWList function to update the display
    } else {
        // If the new index is out of bounds, reset sw_index to the old value
        console.log("New index is out of bounds. Resetting to previous index.");
        showStatusNotification("မရှိတော့ဘူးလေ အော်...");
        sw_index = oldIndex;
    }
}



function moveForward() {
    console.log("Moving forward...");
    moveSwIndex(1); // Move forward by 1
}

function moveBackward() {
    console.log("Moving backward...");
    moveSwIndex(-1); // Move backward by 1
}

function updateSWList() {
    document.addEventListener("DOMContentLoaded", function () {
        const textBox = document.getElementById("sw_list");

        textBox.addEventListener("input", function () {
            // Get the current value and split into an array by line breaks
            const newValues = textBox.value.split("\n").filter(Boolean);

            // Update `sw_global` (keeps the script's in-memory data in sync)
            sw_global[sw_index] = newValues;

            // Retrieve the full `sw_list` object from localStorage
            let sw_list = JSON.parse(localStorage.getItem("sw_list")) || {};

            // Update only the current `sw_index` key in localStorage
            sw_list[sw_index] = newValues;
            localStorage.setItem("sw_list", JSON.stringify(sw_list));

            console.log(`Updated ${sw_index} in sw_global and localStorage.`);
        });
    });
}

updateSWList();

function loadSWTextFile() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt";

    input.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            let newValues = e.target.result.split("\n").map(line => line.trim()).filter(Boolean); // Convert to array per line
            
            // Set sw_index to "SW File"
            sw_index = "SW File";

            // Fetch existing sw_list from localStorage
            let sw_list = JSON.parse(localStorage.getItem("sw_list")) || {};
            let allPreviousValues = [];

            // Loop through all keys in sw_list except the current sw_index
            for (const key in sw_list) {
                if (key !== sw_index) {
                    allPreviousValues.push(...Object.values(sw_list[key]).flat());
                }
            }

            // Remove matches between newValues and all previous values
            newValues = newValues.filter(value => !allPreviousValues.includes(value));

            // Remove unwanted characters [0-9], [a-z], [special chars], [၀-၉] (properly escaped regex)
            newValues = newValues.map(value => value.replace(/[0-9a-z\u1040-\u1049!@#\$%\^\&\*\(\)_\+\-=\[\]{};':"\\|,.<>\/?]/g, "").trim())
                                 .filter(Boolean); // Ensure no empty keys remain

            // Update `sw_global`
            sw_global[sw_index] = newValues;

            // Update only "SW File" in localStorage
            sw_list[sw_index] = newValues;
            localStorage.setItem("sw_list", JSON.stringify(sw_list));

            showStatusNotification('Loaded SW file')
            console.log("Processed text file and saved to localStorage:", newValues);

            // Refresh display
            displaySWList();
        };

        reader.readAsText(file);
    });

    input.click(); // Trigger file selection dialog
}


document.addEventListener("DOMContentLoaded", function () {
    const swListTextbox = document.getElementById("sw_list");
    const cswListTextbox = document.getElementById("csw_list_textbox");

    // Function to handle click and select the nearest line
    function handleClick(event, textarea) {
        // Get the position of the click relative to the textarea
        const clickPos = event.clientY - textarea.getBoundingClientRect().top;

        // Get the line height from the computed styles
        const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight, 10);

        // Calculate the line number by dividing the click position by line height
        const lineNumber = Math.floor(clickPos / lineHeight);

        // Get all the lines from the textarea
        const lines = textarea.value.split("\n");

        // Calculate the start and end index of the line that should be selected
        let startIndex = 0;
        for (let i = 0; i < lineNumber && i < lines.length; i++) {
            startIndex += lines[i].length + 1; // +1 for the newline character
        }

        // Calculate the end of the line (if it exists)
        let endIndex = startIndex + (lines[lineNumber] ? lines[lineNumber].length : 0);

        // Select the line by setting the selection range
        textarea.setSelectionRange(startIndex, endIndex);
    }

    // Attach the click event to the sw_list textbox, if it exists
    if (swListTextbox) {
        swListTextbox.addEventListener("click", function (event) {
            handleClick(event, swListTextbox);
        });
    }

    // Attach the click event to the csw_list_textbox, if it exists
    if (cswListTextbox) {
        cswListTextbox.addEventListener("click", function (event) {
            handleClick(event, cswListTextbox);
        });
    }
});



