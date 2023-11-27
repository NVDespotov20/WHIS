document.addEventListener('DOMContentLoaded', function () {
    loadDeviceList(); // Load connected devices on page load
});

function loadDeviceList() {
    // Make an API call or fetch request to get the list of connected devices
    // Update the deviceListItems element with the retrieved data
    const deviceListItems = document.getElementById('deviceListItems');
    
    // Example: Displaying dummy data
    const dummyDevices = ['ESP8266-1', 'ESP8266-2', 'ESP8266-3'];
    dummyDevices.forEach(device => {
        const listItem = document.createElement('li');
        listItem.textContent = device;
        deviceListItems.appendChild(listItem);
    });
}

function uploadAudio() {
    const audioFileInput = document.getElementById('audioFileInput');
    
    if (audioFileInput.files.length > 0) {
        const audioFile = audioFileInput.files[0];

        // Use AJAX, Fetch API, or another method to upload the audio file to the server
        // Ensure that the server handles the file and stores it in the designated folder
        // You might want to consider using FormData for more complex scenarios

        // Example: Displaying a message for demo purposes
        alert(`Audio file "${audioFile.name}" uploaded successfully.`);
    } else {
        alert('Please select an audio file.');
    }
}

