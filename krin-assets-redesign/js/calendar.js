document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("calendar-grid");
  if (!grid) return;

  const events = [
    {
      month: 0,
      day: 10,
      title: "Creative Story Lab",
      category: "haven",
      categoryName: "After School Program",
      time: "3:30 PM – 5:00 PM",
      age: "Ages 6–12",
      location: "Krin Learning House",
      description:
        "An imaginative afternoon of reading, story building, and collaborative creative play.",
    },
    {
      month: 0,
      day: 18,
      title: "Parent Peace Workshop",
      category: "parent",
      categoryName: "Parent Workshops",
      time: "10:00 AM – 12:00 PM",
      age: "Parents & caregivers",
      location: "Community Room",
      description:
        "Practical tools for creating calm routines, confident boundaries, and stronger family connection.",
    },
    {
      month: 1,
      day: 7,
      title: "Sponsor Studio Tour",
      category: "community",
      categoryName: "Community & Funding",
      time: "11:00 AM – 1:00 PM",
      age: "Partners & sponsors",
      location: "Prophetic Kids Studio",
      description:
        "See how a faith-filled story moves from sketchbook to screen and meet our creative team.",
    },
    {
      month: 1,
      day: 21,
      title: "Young Voices Recording",
      category: "media",
      categoryName: "Prophetic Kids",
      time: "1:00 PM – 4:00 PM",
      age: "Ages 8–12",
      location: "Prophetic Kids Studio",
      description:
        "A supervised introduction to voice acting, scripture storytelling, and studio confidence.",
    },
    {
      month: 2,
      day: 14,
      title: "Family Faith Picnic",
      category: "community",
      categoryName: "Community & Funding",
      time: "12:00 PM – 3:00 PM",
      age: "All families",
      location: "Hope Garden",
      description:
        "Games, music, food, and a joyful community gathering for the whole family.",
    },
    {
      month: 3,
      day: 4,
      title: "Homework Confidence Club",
      category: "haven",
      categoryName: "After School Program",
      time: "4:00 PM – 5:30 PM",
      age: "Ages 7–12",
      location: "Krin Learning House",
      description:
        "Study skills, guided homework time, and practical confidence-building activities.",
    },
    {
      month: 4,
      day: 16,
      title: "Animation Premiere",
      category: "media",
      categoryName: "Prophetic Kids",
      time: "4:00 PM – 6:00 PM",
      age: "All ages",
      location: "Krin Screening Hall",
      description:
        "A joyful premiere of our newest animated story, followed by a creator Q&A.",
    },
    {
      month: 5,
      day: 13,
      title: "Safe Summer Kickoff",
      category: "haven",
      categoryName: "After School Program",
      time: "9:30 AM – 12:30 PM",
      age: "Ages 3–12",
      location: "Krin Learning House",
      description:
        "Meet our educators, tour the space, and sample the summer enrichment programme.",
    },
    {
      month: 6,
      day: 11,
      title: "Faith at Home",
      category: "parent",
      categoryName: "Parent Workshops",
      time: "10:30 AM – 12:00 PM",
      age: "Parents & caregivers",
      location: "Community Room",
      description:
        "Simple, age-appropriate ways to make faith conversations part of everyday family life.",
    },
    {
      month: 7,
      day: 8,
      title: "Books for Bright Futures",
      category: "community",
      categoryName: "Community & Funding",
      time: "2:00 PM – 4:00 PM",
      age: "All supporters",
      location: "Krin Library",
      description:
        "A book drive and partner gathering supporting free faith-based resources for children.",
    },
    {
      month: 8,
      day: 19,
      title: "Character Design Lab",
      category: "media",
      categoryName: "Prophetic Kids",
      time: "1:00 PM – 3:00 PM",
      age: "Ages 8–12",
      location: "Prophetic Kids Studio",
      description:
        "Children learn how expressive shapes, colors, and values bring animated heroes to life.",
    },
    {
      month: 9,
      day: 24,
      title: "Harvest Family Day",
      category: "community",
      categoryName: "Community & Funding",
      time: "11:00 AM – 3:00 PM",
      age: "All families",
      location: "Hope Garden",
      description:
        "A seasonal celebration with creative stations, family challenges, and community giving.",
    },
    {
      month: 10,
      day: 14,
      title: "Preparing for Big Feelings",
      category: "parent",
      categoryName: "Parent Workshops",
      time: "10:00 AM – 11:30 AM",
      age: "Parents & caregivers",
      location: "Community Room",
      description:
        "A warm, evidence-informed conversation about helping children name and navigate emotions.",
    },
    {
      month: 11,
      day: 12,
      title: "Light of Christmas Premiere",
      category: "media",
      categoryName: "Prophetic Kids",
      time: "4:00 PM – 6:00 PM",
      age: "All ages",
      location: "Krin Screening Hall",
      description:
        "Celebrate the season with an original animated Christmas story and family sing-along.",
    },
  ];

  const now = new Date();
  let viewDate = new Date(now.getFullYear(), now.getMonth(), 1);
  let activeFilter = "all";
  const title = document.getElementById("month-title");
  const modal = document.getElementById("event-modal");

  const eventDate = (event) =>
    new Date(viewDate.getFullYear(), event.month, event.day);
  const showModal = (event) => {
    const date = eventDate(event);
    document.getElementById("modal-category").textContent = event.categoryName;
    document.getElementById("modal-title").textContent = event.title;
    document.getElementById("modal-date").textContent = date.toLocaleDateString(
      undefined,
      { weekday: "long", month: "long", day: "numeric", year: "numeric" },
    );
    document.getElementById("modal-time").textContent = event.time;
    document.getElementById("modal-age").textContent = event.age;
    document.getElementById("modal-location").textContent = event.location;
    document.getElementById("modal-description").textContent =
      event.description;
    const dates = `${date.toISOString().slice(0, 10).replaceAll("-", "")}T120000/${date.toISOString().slice(0, 10).replaceAll("-", "")}T130000`;
    const google = document.getElementById("google-calendar-link");
    google.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${dates}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    modal.classList.remove("animate-in");
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    requestAnimationFrame(() =>
      requestAnimationFrame(() => modal.classList.add("animate-in")),
    );
    window.setTimeout(() => modal.querySelector(".modal-close").focus(), 120);
  };

  const render = () => {
    grid.innerHTML = "";
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    title.textContent = viewDate.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    for (let cell = 0; cell < 42; cell++) {
      let day = cell - firstDay + 1;
      let outside = false;
      let cellMonth = month;
      if (day < 1) {
        day = prevDays + day;
        cellMonth = month - 1;
        outside = true;
      }
      if (day > daysInMonth) {
        day -= daysInMonth;
        cellMonth = month + 1;
        outside = true;
      }
      const normalizedMonth = (cellMonth + 12) % 12;
      const dayEvents = outside
        ? []
        : events.filter(
            (event) =>
              event.month === normalizedMonth &&
              event.day === day &&
              (activeFilter === "all" || event.category === activeFilter),
          );
      const cellButton = document.createElement("button");
      cellButton.type = "button";
      cellButton.className = `calendar-day${outside ? " outside" : ""}`;
      const isToday =
        !outside &&
        year === now.getFullYear() &&
        month === now.getMonth() &&
        day === now.getDate();
      if (isToday) cellButton.classList.add("today");
      cellButton.setAttribute(
        "aria-label",
        `${new Date(year, cellMonth, day).toLocaleDateString()}${dayEvents.length ? `, ${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""}` : ", no events"}`,
      );
      cellButton.innerHTML = `<span class="day-number">${day}</span>${dayEvents.map((event, index) => `<span class="event-pill ${event.category}" data-event-index="${events.indexOf(event)}">${event.title}</span>`).join("")}`;
      cellButton.querySelectorAll(".event-pill").forEach((pill) => {
        pill.addEventListener("click", (event) => {
          event.stopPropagation();
          pill.classList.remove("is-popping");
          void pill.offsetWidth;
          pill.classList.add("is-popping");
          const selectedEvent = events[Number(pill.dataset.eventIndex)];
          window.setTimeout(() => showModal(selectedEvent), 120);
        });
        pill.addEventListener("animationend", () =>
          pill.classList.remove("is-popping"),
        );
      });
      cellButton.addEventListener("click", () => {
        if (dayEvents.length) showModal(dayEvents[0]);
        else if (!outside) {
          const empty = {
            title: "No events scheduled",
            categoryName: "Open day",
            month,
            day,
            time: "—",
            age: "Everyone",
            location: "Krin Asset",
            description:
              "There are no scheduled events on this date. Browse another date or contact our team to plan a visit.",
          };
          showModal(empty);
        }
      });
      grid.appendChild(cellButton);
    }
  };

  document.getElementById("prev-month").addEventListener("click", () => {
    viewDate.setMonth(viewDate.getMonth() - 1);
    render();
  });
  document.getElementById("next-month").addEventListener("click", () => {
    viewDate.setMonth(viewDate.getMonth() + 1);
    render();
  });
  document.querySelectorAll(".filter-pill").forEach((pill) =>
    pill.addEventListener("click", () => {
      activeFilter = pill.dataset.filter;
      document.querySelectorAll(".filter-pill").forEach((item) => {
        item.classList.toggle("active", item === pill);
        item.setAttribute("aria-pressed", String(item === pill));
      });
      render();
    }),
  );
  modal.querySelectorAll("[data-close-modal]").forEach((button) =>
    button.addEventListener("click", () => {
      modal.classList.remove("open", "animate-in");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    }),
  );
  modal.addEventListener("click", (event) => {
    if (event.target === modal)
      modal.querySelector("[data-close-modal]").click();
  });
  render();
});
