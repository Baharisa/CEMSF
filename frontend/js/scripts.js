document.addEventListener("DOMContentLoaded", function() {
  let currentPage = 1; // Keep track of the current page
  const limit = 5; // Number of events per page

  // Function to fetch events with pagination
  function fetchEvents(page) {
    const token = localStorage.getItem('token'); // Get JWT token from localStorage
    fetch(`http://localhost:5000/api/events?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // Send the token with the request
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        const eventList = document.getElementById('event-list');
        eventList.innerHTML = ''; // Clear the event list before updating

        // Loop through the events and display them
        data.forEach(event => {
          const eventItem = document.createElement('div');
          eventItem.classList.add('event');
    
          // Format the date using moment.js (MM/DD/YYYY format)
          const formattedDate = moment(event.date).format('MM/DD/YYYY');
    
          eventItem.innerHTML = `
            <h2>${event.title}</h2>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Description:</strong> ${event.description}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <button onclick="updateEvent(${event.id})">Update</button>
            <button onclick="deleteEvent(${event.id})">Delete</button>
          `;
    
          // Append the event item to the event list
          eventList.appendChild(eventItem);
        });

        // Add pagination controls
        updatePagination(page);
      })
      .catch(error => console.error('Error fetching events:', error));
  }

  // Function to update pagination controls
  function updatePagination(page) {
    const paginationControls = document.getElementById('pagination-controls');
    paginationControls.innerHTML = ''; // Clear existing controls

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = page <= 1; // Disable if on the first page
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

  // Initially fetch the first page of events
  fetchEvents(currentPage);

  // Handle event form submission for creating new events
  document.getElementById('new-event-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const token = localStorage.getItem('token'); // Get JWT token from localStorage

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
        'Authorization': `Bearer ${token}`, // Add token to the header
      },
      body: JSON.stringify(newEvent)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Event created:', data);
      // Refresh the event list after creating a new event
      fetchEvents(currentPage); // Fetch events for the current page
    })
    .catch(error => console.error('Error creating event:', error));
  });
});

// Update event function
function updateEvent(id) {
  const updatedEvent = {
    title: prompt("Enter new title:"),
    date: prompt("Enter new date:"),
    description: prompt("Enter new description:"),
    location: prompt("Enter new location:")
  };

  const token = localStorage.getItem('token'); // Get JWT token from localStorage

  fetch(`http://localhost:5000/api/events/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Add token to the header
    },
    body: JSON.stringify(updatedEvent)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Event updated:', data);
    location.reload(); // Refresh the page to show updated events
  })
  .catch(error => console.error('Error updating event:', error));
}

// Delete event function
function deleteEvent(id) {
  if (confirm("Are you sure you want to delete this event?")) {
    const token = localStorage.getItem('token'); // Get JWT token from localStorage

    fetch(`http://localhost:5000/api/events/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`, // Add token to the header
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log('Event deleted:', data);
      location.reload(); // Refresh the page to remove the event
    })
    .catch(error => console.error('Error deleting event:', error));
  }
}
