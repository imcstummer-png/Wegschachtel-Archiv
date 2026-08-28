const R2_BASE_URL =
    "https://pub-ebd4187f42fe4ee0b12e028556010158.r2.dev";


/* ========================================
   JAHR AUS URL LESEN
   ======================================== */

const params =
    new URLSearchParams(window.location.search);

const selectedYear =
    Number(params.get("year"));


/* ========================================
   SEITE AUFBAUEN
   ======================================== */

if (!selectedYear) {

    document.body.innerHTML = `
        <main style="padding: 50px;">
            <h1>Jahr nicht gefunden</h1>

            <a href="../index.html">
                ← Zurück zum Archiv
            </a>
        </main>
    `;

} else {

    buildYearPage(selectedYear);

}


/* ========================================
   JAHRESSEITE
   ======================================== */

function buildYearPage(year) {

    document.title =
        `${year} | Wegschachtel Archiv`;

    document
        .querySelector("#year-title")
        .textContent = year;

    document
        .querySelector("#year-description")
        .textContent =
        `Erinnerungen aus ${year}.`;

    const eventGrid =
        document.querySelector("#event-grid");

    const yearEvents =
        allEvents.filter(
            event => event.year === year
        );

    if (yearEvents.length === 0) {

        eventGrid.innerHTML = `
            <p>
                Für dieses Jahr gibt es noch keine Events.
            </p>
        `;

        return;
    }

    yearEvents.forEach(event => {

        createEventCard(
            event,
            eventGrid
        );

    });
}


/* ========================================
   EVENTKARTE ERSTELLEN
   ======================================== */

function createEventCard(event, eventGrid) {

    const card =
        document.createElement("a");

    card.className =
        "event-card";

    card.href =
        `../events/event.html?event=${event.slug}`;


    const imageArea =
        document.createElement("div");

    imageArea.className =
        "event-cover";


    const info =
        document.createElement("div");

    info.className =
        "event-info";

    info.innerHTML = `
        <p class="archive-label">
            ${event.displayDate.toUpperCase()}
            · FILE ${event.fileNumber}
        </p>

        <h3>
            ${event.title}
        </h3>

        <p>
            ${event.location}
        </p>
    `;


    card.appendChild(imageArea);
    card.appendChild(info);

    eventGrid.appendChild(card);


    loadEventCover(
        event,
        imageArea
    );
}


/* ========================================
   COVER AUS EVENT-DATEN LADEN
   ======================================== */

function loadEventCover(event, imageArea) {

    const script =
        document.createElement("script");

    script.src =
        `../data/${event.slug}-data.js`;


    script.onload = () => {

        if (
            !window.eventData
            ||
            !window.eventData.photos
            ||
            window.eventData.photos.length === 0
        ) {

            showPlaceholder(
                imageArea,
                event.title
            );

            window.eventData = undefined;

            return;
        }


        let coverPhoto =
            window.eventData.photos[0];


        if (window.eventData.cover) {

            const selectedCover =
                window.eventData.photos.find(
                    photo =>
                        photo.name === window.eventData.cover
                );

            if (selectedCover) {
                coverPhoto = selectedCover;
            }
        }


        const image =
            document.createElement("img");


        image.src =
            `${R2_BASE_URL}/${event.year}/${event.slug}/previews/${coverPhoto.name}.jpg`;


        image.alt =
            `${event.title} Cover`;


        imageArea.appendChild(image);


        /* Daten wieder leeren,
           damit das nächste Event
           sauber geladen werden kann */

        window.eventData =
            undefined;
    };


    script.onerror = () => {

        showPlaceholder(
            imageArea,
            event.title
        );

        window.eventData =
            undefined;
    };


    document.head.appendChild(script);
}


/* ========================================
   FALLBACK
   ======================================== */

function showPlaceholder(
    imageArea,
    title
) {

    imageArea.classList.add(
        "event-cover-placeholder"
    );

    imageArea.textContent =
        title.toUpperCase();
}
