function deleteSpecialCharacters() {
    const textarea = document.getElementById('main-text');
    var output = textarea.value;
    if (textarea) {
        // Regex to remove special characters and emojis, excluding full stop (.), '&', and '%'
        const outString = textarea.value.replace(
            /[\\~!@#$^*()_\-+=`|{}\[\]:";'<>,?\/…၊။•↪⭐■▪━༻༺“”‘’–—]|[\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Extended_Pictographic}/gu,
            ''
        );
        // Remove non-English spaces if needed
        output = removeNonEnglishSpaces(outString);
        // Replace '&' with 'and' and '%' with 'percent'
        output = output.replace(/&/g, 'and').replace(/%/g, 'percent');
    }
    textarea.value = output;
    manualValueChange(output);
    copyAndRedirect();
}



function copyAndRedirect() {
    const textarea = document.getElementById('main-text');
    if (textarea) {
        // Copy the content of the textarea
        textarea.select();
        document.execCommand('copy');  // Execute the copy command

        // Redirect to the new page in a new tab
        window.open('http://www.nlpresearch-ucsy.edu.mm/wsandpos.html', '_blank');
    }
}

function checkPayday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    // Set payday as the 5th day of next month
    let payday = new Date(year, month + 1, 5);

    // If the 5th is a Sunday, move it to Saturday
    if (payday.getDay() === 0) {
        payday.setDate(payday.getDate() - 1);
    }

    // Calculate days left
    const daysLeft = Math.ceil((payday - today) / (1000 * 60 * 60 * 24));

    // Check if today is payday
    if (daysLeft === 0) {
        showStatusNotification('ဒီနေ့လစာထုတ်ပြီကွ!');
    } else {
        console.log(`📅 ${daysLeft} days left until payday.`);
        showStatusNotification('လစာထုတ်ဖို့ ' + daysLeft + ' ရက်လိုသေးတယ် -_-');
    }
}

