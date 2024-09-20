if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

document.getElementById('reminderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const message = document.getElementById('message').value;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            saveReminder(location, message);
            displayAlert('Reminder set successfully!', 'success');
        }, (error) => {
            displayAlert('Unable to retrieve location. Please check your settings.', 'error');
        });
    } else {
        displayAlert('Geolocation is not supported by this browser.', 'error');
    }
});

function saveReminder(location, message) {
    const reminders = JSON.parse(localStorage.getItem('reminders')) || [];
    reminders.push({ location, message });
    localStorage.setItem('reminders', JSON.stringify(reminders));
    checkReminders(); // Immediately check for reminders
}

function checkReminders() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            const reminders = JSON.parse(localStorage.getItem('reminders')) || [];

            reminders.forEach(reminder => {
                const distance = calculateDistance(latitude, longitude, reminder.location.lat, reminder.location.lng);
                if (distance < 1) { // 1 km radius
                    notifyUser(reminder.message);
                }
            });
        });
    }
}

// Haversine formula to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function notifyUser(message) {
    if (Notification.permission === "granted") {
        new Notification('Reminder', { body: message });
    }
}

// Check reminders every minute
setInterval(checkReminders, 60000);

// **Home Button Reload**

// Option 1: Using a dedicated button with click event listener
const homeButton = document.getElementById('homeButton'); // Assuming you have an element with id="homeButton"
if (homeButton) {
    homeButton.addEventListener('click', function() {
        window.location.reload(); // Reload the current page
    });
}

// Option 2: Using a link with a specific href attribute
// Assuming you have a link element with id="homeLink" and you want to reload to the same page
const homeLink = document.getElementById('homeLink');  // Assuming you have an element with id="homeLink"
if (homeLink) {
    homeLink.href = window.location.href; // Set the href to the current page URL
}

// Dark Mode Toggle
const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

// Load dark mode state from localStorage
window.onload = () => {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
};

function displayAlert(message, type) {
    const alert = document.createElement('div');
    alert.textContent = message;
    alert.className = `alert alert-${type}`;
}
