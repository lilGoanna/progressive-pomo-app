let timerInterval;
let startTime;
let totalSeconds = 0;
let extended = false; // Flag to indicate if time has been extended
let titleFlashInterval;
let titleOriginal = document.title; // Save the original title
let originalFocusRating; // Store the original focus rating
let originalTimeBlock; // Store the original time block

document.getElementById('startBtn').addEventListener('click', startTimer);
document.getElementById('stopBtn').addEventListener('click', stopTimer);
document.getElementById('submitFeedback').addEventListener('click', submitFeedback);
document.getElementById('extendTime').addEventListener('click', extendTime);
document.getElementById('takeBreak').addEventListener('click', takeBreak);

function startTimer() {
    const minutes = parseInt(document.getElementById('timeInput').value);
    if (isNaN(minutes) || minutes <= 0) {
        alert('Please enter a valid number of minutes.');
        return;
    }
    totalSeconds = minutes * 60;
    startTime = Date.now();
    originalTimeBlock = minutes; // Store the original time block
    extended = false; // Reset extended flag
    timerInterval = setInterval(updateTimer, 1000);
    
    // Activate timer and progress bar immediately
    document.getElementById('timer').textContent = `${formatTime(minutes)}:00`;
    document.getElementById('progressBar').style.width = '100%';
    
    // Clear timer input value
    document.getElementById('timeInput').value = '';

    document.querySelector('.feedback-form').style.display = 'none';
    document.getElementById('appTitle').style.color = ''; // Reset title color
    document.getElementById('appTitle').style.animation = ''; // Reset animation
    stopTitleFlash(); // Stop flashing if it's already flashing
    document.title = titleOriginal; // Reset the title
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    // Always show feedback form when stopping the timer, regardless of extension
    showFeedbackForm();
}

function updateTimer() {
    const currentTime = Date.now();
    const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
    const remainingSeconds = totalSeconds - elapsedSeconds;

    if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        document.getElementById('timer').textContent = '00:00';
        document.getElementById('progressBar').style.width = '0%';
        playNotificationSound();
        flashTitle(); // Start flashing the title
        showFeedbackForm();
    } else {
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        document.getElementById('timer').textContent = `${formatTime(minutes)}:${formatTime(seconds)}`;
        document.getElementById('progressBar').style.width = `${(remainingSeconds / totalSeconds) * 100}%`;
    }
}

function formatTime(time) {
    return time < 10 ? `0${time}` : time;
}

function showFeedbackForm() {
    document.querySelector('.feedback-form').style.display = 'block';
}

function submitFeedback() {
    const selectedRating = document.querySelector('input[name="focusRating"]:checked');
    if (!selectedRating) {
        alert('Please select a focus rating.');
        return;
    }

    const ratingValue = selectedRating.value; // Get the selected rating
    const notes = document.getElementById('notesInput').value.trim();
    
    // Get the current time block
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const timeString = `${minutes} mins`; // Consistent format

    // Log the time block
    const tableBody = document.getElementById('recordsBody');
    const row = tableBody.insertRow();

    // Set the original time block or extended time
    if (!extended) {
        row.insertCell(0).textContent = timeString;
    } else {
        row.insertCell(0).textContent = `Extended time from ${originalTimeBlock} mins to ${timeString}`;
    }

    row.insertCell(1).textContent = getFocusRatingText(ratingValue, notes);

    // Apply the golden color if "I experienced FLOW" was selected
    if (ratingValue === '1') {
        row.classList.add('row-golden');
    }

    // Apply the green color if "I felt highly focused" was selected
    if (ratingValue === '2') {
        row.classList.add('row-green');
    }

    // Reset for next session
    document.getElementById('timeInput').value = '';
    document.getElementById('timer').textContent = '00:00';
    document.getElementById('progressBar').style.width = '0%';
    document.querySelector('.feedback-form').style.display = 'none';
    document.getElementById('appTitle').style.color = ''; // Reset title color
    document.getElementById('appTitle').style.animation = ''; // Reset animation
    stopTitleFlash(); // Stop flashing
    // Clear notes input box
    document.getElementById('notesInput').value = '';
}

function playNotificationSound() {
    const sound = document.getElementById('notificationSound');
    sound.play();
}

function extendTime() {
    const selectedRating = document.querySelector('input[name="focusRating"]:checked');
    if (!selectedRating) {
        alert('Please select a focus rating before extending time.');
        return;
    }

    // Store the original time before extending
    const originalMinutes = Math.floor(totalSeconds / 60);
    const originalSeconds = totalSeconds % 60;
    const originalTimeString = `${originalMinutes} mins`;

    // Add 10 minutes to the total time
    const extendedMinutes = 10;
    totalSeconds += extendedMinutes * 60;

    // Restart the timer with the additional time
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    timerInterval = setInterval(updateTimer, 1000);

    // Log the extended time with a new row
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const timeString = `${minutes} mins`;

    const tableBody = document.getElementById('recordsBody');
    const newRow = tableBody.insertRow();
    newRow.insertCell(0).textContent = `Extended time from ${originalTimeString} to ${timeString}`; // Label for extended time
    newRow.insertCell(1).textContent = getFocusRatingText(selectedRating.value);

    // Apply the golden color if "I experienced FLOW" was selected
    if (selectedRating.value === '1') {
        newRow.classList.add('row-golden');
    }

    // Apply the green color if "I felt highly focused" was selected
    if (selectedRating.value === '2') {
        newRow.classList.add('row-green');
    }

    // Mark current session as extended
    extended = true;

    // Hide the feedback form
    document.querySelector('.feedback-form').style.display = 'none';
    
    // Stop the title flashing if it was happening
    stopTitleFlash(); 
}

function takeBreak() {
    // Log the time block without feedback
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const timeString = `${minutes} mins`; // Consistent format

    // Log the time block
    const tableBody = document.getElementById('recordsBody');
    const row = tableBody.insertRow();

    // Set the original time block or extended time
    if (!extended) {
        row.insertCell(0).textContent = timeString;
    } else {
        row.insertCell(0).textContent = `Extended time from ${originalTimeBlock} mins to ${timeString}`;
    }

    row.insertCell(1).textContent = 'Break (no feedback)';

    // Apply the golden color if "I experienced FLOW" was selected
    if (document.querySelector('input[name="focusRating"]:checked')?.value === '1') {
        row.classList.add('row-golden');
    }

    // Apply the green color if "I felt highly focused" was selected
    if (document.querySelector('input[name="focusRating"]:checked')?.value === '2') {
        row.classList.add('row-green');
    }

    // Reset for next session
    document.getElementById('timeInput').value = '';
    document.getElementById('timer').textContent = '00:00';
    document.getElementById('progressBar').style.width = '0%';
    document.querySelector('.feedback-form').style.display = 'none';
    document.getElementById('appTitle').style.color = ''; // Reset title color
    document.getElementById('appTitle').style.animation = ''; // Reset animation
    stopTitleFlash(); // Stop flashing
    // Clear notes input box
    document.getElementById('notesInput').value = '';
}

function getFocusRatingText(rating, notes = '') {
    switch (rating) {
        case '1': return notes ? `I experienced FLOW (${notes})` : 'I experienced FLOW';
        case '2': return notes ? `I felt highly focused (${notes})` : 'I felt highly focused';
        case '3': return notes ? `My focus was good (${notes})` : 'My focus was good';
        case '4': return notes ? `I felt distracted (${notes})` : 'I felt distracted';
        default: return 'Unknown rating';
    }
}

function flashTitle() {
    let flashState = false;
    titleFlashInterval = setInterval(() => {
        if (flashState) {
            document.title = 'Timeout!';
        } else {
            document.title = titleOriginal;
        }
        flashState = !flashState;
    }, 500); // Flash every 500ms
}

function stopTitleFlash() {
    clearInterval(titleFlashInterval);
    document.title = titleOriginal; // Reset to original title
}
