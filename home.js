const yearGrid = document.querySelector("#year-grid");

if (yearGrid && typeof allEvents !== "undefined") {

    const years = [
        ...new Set(
            allEvents.map(event => event.year)
        )
    ];

    years.sort((a, b) => b - a);

    years.forEach(year => {

        const card = document.createElement("a");

        card.className = "year-card";

        card.href =
            `years/year.html?year=${year}`;

        card.textContent = year;

        yearGrid.appendChild(card);

    });
}