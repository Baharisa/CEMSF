document.addEventListener("DOMContentLoaded", function () {
    let currentPage = 1;
    const limit = 5;

    const token = localStorage.getItem("token");
    const logoutButton = document.getElementById("logout-button");
    const noTokenMessage = document.getElementById("no-token-message");
    const newEventFormContainer = document.getElementById("new-event-form-container");
    const newEventForm = document.getElementById("new-event-form");
    const paginationControls = document.getElementById("pagination-controls");
    const calendarTitle = document.getElementById("calendar-title");
    const calendarBody = document.getElementById("calendar-body");
    const totalEvents = document.getElementById("total-events");
    const upcomingEvents = document.getElementById("upcoming-events");
    const totalUsers = document.getElementById("total-users");
    const eventsContainer = document.getElementById("events");

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let events = [];

    // Check if the user has a token and update UI accordingly
    if (!token) {
        if (noTokenMessage) noTokenMessage.style.display = "block";
        if (newEventFormContainer) newEventFormContainer.style.display = "none";
        return;
    } else {
        if (newEventFormContainer) newEventFormContainer.style.display = "block";
        if (logoutButton) {
            logoutButton.addEventListener("click", function () {
                localStorage.removeItem("token");
                window.location.href = "login.html";
            });
        }
    }

    // Fetch dashboard statistics
    function fetchDashboardStats() {
        fetch("http://localhost:5000/api/dashboard/statistics", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data) {
                    totalEvents.textContent = data.totalEvents || 0;
                    upcomingEvents.textContent = data.upcomingEvents || 0;
                    totalUsers.textContent = data.totalUsers || 0;
                }
            })
            .catch((error) => console.error("Error fetching dashboard statistics:", error));
    }

    // Fetch events with pagination
    function fetchEvents(page) {
        fetch(`http://localhost:5000/api/events?page=${page}&limit=${limit}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                const eventList = document.getElementById("event-list");
                eventList.innerHTML = "";

                if (Array.isArray(data) && data.length > 0) {
                    data.forEach((event) => {
                        const eventItem = document.createElement("div");
                        eventItem.classList.add("event");
                        const formattedDate = moment(event.date, "YYYY-MM-DD").format("MM/DD/YYYY");
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
                    eventList.innerHTML = "<p>No events available.</p>";
                }
            })
            .catch((error) => console.error("Error fetching events:", error));
    }

    // Update pagination controls
    function updatePagination(page) {
        paginationControls.innerHTML = "";

        const prevButton = document.createElement("button");
        prevButton.textContent = "Previous";
        prevButton.disabled = page <= 1;
        prevButton.onclick = () => {
            currentPage = page - 1;
            fetchEvents(currentPage);
        };

        const nextButton = document.createElement("button");
        nextButton.textContent = "Next";
        nextButton.onclick = () => {
            currentPage = page + 1;
            fetchEvents(currentPage);
        };

        paginationControls.appendChild(prevButton);
        paginationControls.appendChild(nextButton);
    }

    // Event creation
    if (newEventForm) {
        newEventForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const newEvent = {
                title: document.getElementById("title").value,
                date: document.getElementById("date").value,
                description: document.getElementById("description").value,
                location: document.getElementById("location").value,
            };

            fetch("http://localhost:5000/api/events", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newEvent),
            })
                .then((response) => response.json())
                .then(() => {
                    fetchEvents(currentPage);
                    fetchDashboardStats(); // Update statistics
                    newEventForm.reset();
                })
                .catch((error) => console.error("Error creating event:", error));
        });
    }

    // Load calendar data
    function loadCalendarData() {
        calendarTitle.textContent = `${moment().month(currentMonth).format("MMMM YYYY")}`;
        calendarBody.innerHTML = "";

        const daysInMonth = moment().month(currentMonth).daysInMonth();
        const firstDayOfMonth = moment().month(currentMonth).startOf("month").day();

        let days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }

        let row = [];
        days.forEach((day, index) => {
            if (index % 7 === 0 && index !== 0) {
                const tr = document.createElement("tr");
                row.forEach((dayCell) => tr.appendChild(dayCell));
                calendarBody.appendChild(tr);
                row = [];
            }

            const td = document.createElement("td");
            td.textContent = day || "";
            td.classList.add("calendar-day");

            if (
                day &&
                events.some(
                    (event) =>
                        new Date(event.date).getDate() === day &&
                        new Date(event.date).getMonth() === currentMonth
                )
            ) {
                td.classList.add("event");
            }

            row.push(td);
        });

        if (row.length > 0) {
            const tr = document.createElement("tr");
            row.forEach((dayCell) => tr.appendChild(dayCell));
            calendarBody.appendChild(tr);
        }
    }

    // Change calendar month logic
    function changeMonth(offset) {
        currentMonth += offset;

        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        } else if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }

        loadCalendarData();
    }

    document.getElementById("previous-month").addEventListener("click", function () {
        changeMonth(-1);
    });

    document.getElementById("next-month").addEventListener("click", function () {
        changeMonth(1);
    });

    // Initial data load
    loadCalendarData();
    fetchDashboardStats();
    fetchEvents(currentPage);
});