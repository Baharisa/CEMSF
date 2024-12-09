document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem('token');
    const calendarElement = document.createElement('div');
    const monthDisplay = document.createElement('span');
    const prevButton = document.createElement('button');
    const nextButton = document.createElement('button');
    let currentMonth = moment(); // Start with the current month

    // Set up buttons and display
    prevButton.innerText = 'Previous';
    nextButton.innerText = 'Next';
    monthDisplay.style.margin = '0 10px';
    document.body.appendChild(prevButton);
    document.body.appendChild(monthDisplay);
    document.body.appendChild(nextButton);
    document.body.appendChild(calendarElement);

    // Fetch events for the current month
    function fetchEvents(month) {
        fetch(`http://localhost:5000/api/events?page=1&limit=100`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        })
        .then(response => response.json())
        .then(events => {
            displayCalendar(events, month);
        })
        .catch(error => console.error('Error fetching events:', error));
    }

    // Display the calendar
    function displayCalendar(events, month) {
        calendarElement.innerHTML = ''; // Clear previous calendar
        monthDisplay.textContent = month.format('MMMM YYYY'); // Update month display

        const daysInMonth = month.daysInMonth();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = month.date(day);
            const dayElement = document.createElement('div');
            dayElement.className = 'day';
            dayElement.style.border = '1px solid #ccc';
            dayElement.style.padding = '10px';
            dayElement.style.height = '100px';
            dayElement.style.position = 'relative';
            dayElement.style.boxSizing = 'border-box';
            dayElement.innerHTML = `<strong>${dayDate.format('ddd')}</strong> ${day}`;
            
            // Filter events for the current day
            const dayEvents = events.filter(event => moment(event.date, 'MM/DD/YYYY').isSame(dayDate, 'day'));
            dayEvents.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = 'event';
                eventElement.innerText = event.title; // Show event title only
                eventElement.style.backgroundColor = '#4CAF50';
                eventElement.style.color = 'white';
                eventElement.style.padding = '5px';
                eventElement.style.margin = '5px 0';
                eventElement.style.borderRadius = '3px';
                eventElement.style.cursor = 'pointer';

                // Add event to the day element
                dayElement.appendChild(eventElement);
            });

            calendarElement.appendChild(dayElement);
        }
    }

    // Handle month navigation
    prevButton.addEventListener('click', function() {
        currentMonth.subtract(1, 'months');
        fetchEvents(currentMonth);
    });

    nextButton.addEventListener('click', function() {
        currentMonth.add(1, 'months');
        fetchEvents(currentMonth);
    });

    // Initialize the calendar
    fetchEvents(currentMonth);
});