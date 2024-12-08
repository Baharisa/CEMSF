document.addEventListener("DOMContentLoaded", function() {
  let currentPage = 1; // Current pagination page
  const limit = 5;     // Number of events per page

  const token = localStorage.getItem('token');
  const logoutButton = document.getElementById('logout-button');
  const noTokenMessage = document.getElementById('no-token-message');
  const newEventFormContainer = document.getElementById('new-event-form-container');
  const newEventForm = document.getElementById('new-event-form');

  // Check for token presence
  if (!token) {
    console.log('No token found. User is not logged in.');
    if (noTokenMessage) noTokenMessage.style.display = 'block';
    if (newEventFormContainer) newEventFormContainer.style.display = 'none';
    return; // Stop execution since we can't fetch events without a token
  } else {
    // If token present, show event form and logout button
    if (newEventFormContainer) newEventFormContainer.style.display = 'block';
    if (logoutButton) {
      logoutButton.addEventListener('click', function() {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
      });
    }
  }

  // Fetch events with pagination
  function fetchEvents(page) {
    console.log(`Fetching events for page ${page} with token:`, token);

    fetch(`http://localhost:5000/api/events?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    })
    .then(response => response.json())
    .then(data => {
      const eventList = document.getElementById('event-list');
      if (!eventList) {
        console.error('No element with id="event-list" found in your HTML.');
        return;
      }

      eventList.innerHTML = ''; // Clear the event list before updating

      if (Array.isArray(data) && data.length > 0) {
        data.forEach(event => {
          const eventItem = document.createElement('div');
          eventItem.classList.add('event');

          const formattedDate = moment(event.date, 'YYYY-MM-DD').format('MM/DD/YYYY');
          eventItem.innerHTML = `
            <h2>${event.title}</h2>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Description:</strong> ${event.description}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <button onclick="updateEvent(${event.id})">Update</button>
            <button onclick="deleteEvent(${event.id})">Delete</button>
          `;

          eventList.appendChild(eventItem);
        });
        updatePagination(page);
      } else {
        eventList.innerHTML = '<p>No events available.</p>';
      }
    })
    .catch(error => console.error('Error fetching events:', error));
  }

  // Update pagination controls
  function updatePagination(page) {
    const paginationControls = document.getElementById('pagination-controls');
    if (!paginationControls) return;

    paginationControls.innerHTML = ''; // Clear existing controls

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = page <= 1;
    prevButton.onclick = () => {
      currentPage = page - 1;
      fetchEvents(currentPage);
    };

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.onclick = () => {
      currentPage = page + 1;
      fetchEvents(currentPage);
    };

    paginationControls.appendChild(prevButton);
    paginationControls.appendChild(nextButton);
  }

  // Initially fetch events if token is present
  if (token) {
    fetchEvents(currentPage);
  }

  // Handle form submission for creating new events
  if (newEventForm) {
    newEventForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const newEvent = {
        title: document.getElementById('title').value,
        date: document.getElementById('date').value,
        description: document.getElementById('description').value,
        location: document.getElementById('location').value
      };

      fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newEvent)
      })
      .then(response => response.json())
      .then(data => {
        console.log('Event created:', data);
        fetchEvents(currentPage);
        newEventForm.reset();
      })
      .catch(error => console.error('Error creating event:', error));
    });
  }
});

// 🟢 Update event function
function updateEvent(id) {
  const token = localStorage.getItem('token');
  const title = prompt("Enter new title:");
  const date = prompt("Enter new date (YYYY-MM-DD):");
  const description = prompt("Enter new description:");
  const location = prompt("Enter new location:");

  if (!title || !date || !description || !location) {
    alert('All fields are required to update the event.');
    return; 
  }

  const updatedEvent = { title, date, description, location };

  fetch(`http://localhost:5000/api/events/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updatedEvent)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Event updated:', data);
    fetchEvents(1); // Refresh events on the first page
  })
  .catch(error => console.error('Error updating event:', error));
}

// 🟢 Delete event function
function deleteEvent(id) {
  const token = localStorage.getItem('token');
  if (confirm("Are you sure you want to delete this event?")) {
    fetch(`http://localhost:5000/api/events/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log('Event deleted:', data);
      fetchEvents(1); // Refresh the page to remove the event
    })
    .catch(error => console.error('Error deleting event:', error));
  }
}