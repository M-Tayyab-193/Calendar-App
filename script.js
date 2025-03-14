// Get the elements
const monthElement = document.getElementById("currentMonth");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const todayBtn = document.getElementById("todayBtn");
const calendar = document.querySelector(".calender");
const monthlyBtn = document.getElementById("monthlyViewBtn");
const weeklyBtn = document.getElementById("weeklyViewBtn");


let currentDate = new Date();
let today = new Date();
let events = JSON.parse(localStorage.getItem('calendarEvents')) || {};
let viewMode = "monthly"; 

const minDate = new Date(2024, 2, 1);
const maxDate = new Date(2025, 2, 31);

// Function to generate the calendar
function generateCalendar(month, year) {
    if (viewMode === "monthly") {
        generateMonthlyView(month, year);
    } else {
        generateWeeklyView();
    }
}

// Function to generate the monthly view
function generateMonthlyView(month, year) {
    calendar.innerHTML = ""; 
    monthElement.innerText = `${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(year, month))} ${year}`;

    let firstDay = new Date(year, month, 1).getDay();
    let totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        let emptyDiv = document.createElement("div");
        emptyDiv.classList.add("dates");
        calendar.appendChild(emptyDiv);
    }

    for (let day = 1; day <= totalDays; day++) {
        let dayDiv = document.createElement("div");
        dayDiv.classList.add("dates");
        dayDiv.innerText = day;
        
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayDiv.style.backgroundColor = "#4aa4ffbb";
            dayDiv.style.fontWeight = "bold";
        }

        dayDiv.addEventListener('click', () => openEventModal(day, month, year));

        const dateKey = `${year}-${month+1}-${day}`;
        if (events[dateKey]) {
            events[dateKey].forEach(event => {
                const eventDiv = document.createElement('div');
                eventDiv.classList.add('event');
                eventDiv.textContent = event.name;
                eventDiv.title = event.description;
                dayDiv.appendChild(eventDiv);
            });
        }

        calendar.appendChild(dayDiv);
    }
    updateNavButtons();
}

// Function to generate the weekly view
function generateWeeklyView() {
    calendar.innerHTML = "";
    let startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); 
    let weekTitle = `${startOfWeek.toDateString()} - `;
    let weekEnd = new Date(startOfWeek);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekTitle += weekEnd.toDateString();
    monthElement.innerText = weekTitle;

    for (let i = 0; i < 7; i++) {
        let dayDiv = document.createElement("div");
        let currentDay = new Date(startOfWeek);
        currentDay.setDate(currentDay.getDate() + i);

        dayDiv.classList.add("dates");
        dayDiv.innerText = `${new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(currentDay)} ${currentDay.getDate()}`;
        
        if (currentDay.toDateString() === today.toDateString()) {
            dayDiv.style.backgroundColor = "#4aa4ffbb";
            dayDiv.style.fontWeight = "bold";
        }

        dayDiv.addEventListener('click', () => openEventModal(currentDay.getDate(), currentDay.getMonth(), currentDay.getFullYear()));

        const dateKey = `${currentDay.getFullYear()}-${currentDay.getMonth()+1}-${currentDay.getDate()}`;
        if (events[dateKey]) {
            events[dateKey].forEach(event => {
                const eventDiv = document.createElement('div');
                eventDiv.classList.add('event');
                eventDiv.textContent = event.name;
                eventDiv.title = event.description;
                dayDiv.appendChild(eventDiv);
            });
        }

        calendar.appendChild(dayDiv);
    }
    updateNavButtons(); 
}

// Toggle between Monthly and Weekly view
monthlyBtn.addEventListener("click", () => {
    viewMode = "monthly";
    generateCalendar(currentDate.getMonth(), currentDate.getFullYear());
    monthlyBtn.classList.add("active");
    weeklyBtn.classList.remove("active");
});

weeklyBtn.addEventListener("click", () => {
    viewMode = "weekly";
    generateWeeklyView();
    weeklyBtn.classList.add("active");
    monthlyBtn.classList.remove("active");
});

// Open the event modal
function openEventModal(day, month, year) {
    const modal = document.getElementById('eventModal');
    modal.style.display = 'flex';

    const dateKey = `${year}-${month+1}-${day}`;

    document.getElementById('saveEvent').onclick = () => {
        const name = document.getElementById('eventName').value;
        const description = document.getElementById('eventDescription').value;

        if (name.trim() === '') {
            alert('Please enter an event name');
            return;
        }

        if (!events[dateKey]) {
            events[dateKey] = [];
        }

        events[dateKey].push({ name, description });
        localStorage.setItem('calendarEvents', JSON.stringify(events));

        modal.style.display = 'none';
        document.getElementById('eventName').value = '';
        document.getElementById('eventDescription').value = '';

        generateCalendar(currentDate.getMonth(), currentDate.getFullYear());
    };

    document.getElementById('cancelEvent').onclick = () => {
        modal.style.display = 'none';
        document.getElementById('eventName').value = '';
        document.getElementById('eventDescription').value = '';
    };
}

// Navigation button updates
function updateNavButtons() {
    if (viewMode === "monthly") {
        // Monthly navigation: disable if the next month would exceed maxDate
        const prevMonth = new Date(currentDate);
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        prevBtn.disabled = prevMonth < minDate;

        const nextMonth = new Date(currentDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextBtn.disabled = nextMonth > maxDate;
    } else {
        // Weekly navigation: disable if the next week would exceed maxDate
        const prevWeek = new Date(currentDate);
        prevWeek.setDate(prevWeek.getDate() - 7);
        prevBtn.disabled = prevWeek < minDate;

        const nextWeek = new Date(currentDate);
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextBtn.disabled = nextWeek > maxDate;
    }
}



// Navigation buttons logic
prevBtn.addEventListener("click", () => {
    if (viewMode === "monthly" && currentDate > minDate) {
        currentDate.setMonth(currentDate.getMonth() - 1);
    } else if (viewMode === "weekly") {
        currentDate.setDate(currentDate.getDate() - 7);
    }
    generateCalendar(currentDate.getMonth(), currentDate.getFullYear());
});
nextBtn.addEventListener("click", () => {
    if (viewMode === "monthly") {
        currentDate.setMonth(currentDate.getMonth() + 1);
        generateCalendar(currentDate.getMonth(), currentDate.getFullYear());
    } else if (viewMode === "weekly") {
        currentDate.setDate(currentDate.getDate() + 7);
        generateWeeklyView(); // This will now update navigation buttons as well.
    }
});

todayBtn.addEventListener("click", () => {
    let realToday = new Date();
    
    if (viewMode === "monthly") {
        // Apply boundaries for monthly view
        if (realToday < minDate) {
            realToday = new Date(minDate);
        } else if (realToday > maxDate) {
            realToday = new Date(maxDate);
        }
        currentDate = new Date(realToday);
        generateCalendar(realToday.getMonth(), realToday.getFullYear());
    } else { // weekly view
        // Use actual current date regardless of boundaries.
        currentDate = new Date(realToday);
        // Adjust to the Sunday of the current week.
        currentDate.setDate(realToday.getDate() - realToday.getDay());
        generateWeeklyView();
    }
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('eventModal');
    if (modal && e.target === modal) {
        modal.style.display = 'none';
    }
});

// Initialize calendar on page load
generateCalendar(currentDate.getMonth(), currentDate.getFullYear());
