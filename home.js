const R2_BASE_URL =
    "https://pub-ebd4187f42fe4ee0b12e028556010158.r2.dev";
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

    /* ========================================
   RANDOM MEMORY
   ======================================== */

const randomMemoryButton =
    document.querySelector("#random-memory");


if (
    randomMemoryButton
    &&
    typeof allEvents !== "undefined"
    &&
    allEvents.length > 0
) {

    randomMemoryButton.addEventListener(
        "click",
        () => {

            const randomIndex =
                Math.floor(
                    Math.random()
                    * allEvents.length
                );

            const randomEvent =
                allEvents[randomIndex];


            window.location.href =
                `events/event.html?event=${randomEvent.slug}`;
        }
    );
}

/* ========================================
   RANDOM PHOTO
   ======================================== */

const randomPhoto =
    document.querySelector("#random-photo");

const randomPhotoLink =
    document.querySelector("#random-photo-link");

const randomPhotoEvent =
    document.querySelector("#random-photo-event");

const randomPhotoNumber =
    document.querySelector("#random-photo-number");


if (
    randomPhoto
    &&
    typeof allEvents !== "undefined"
    &&
    allEvents.length > 0
) {

    const randomEvent =
        allEvents[
            Math.floor(
                Math.random()
                * allEvents.length
            )
        ];


    const dataScript =
        document.createElement("script");


    dataScript.src =
        `data/${randomEvent.slug}-data.js`;


    dataScript.onload = () => {

        if (
            !window.eventData
            ||
            !window.eventData.photos
            ||
            window.eventData.photos.length === 0
        ) {
            return;
        }


        const photos =
            window.eventData.photos;


        const randomIndex =
            Math.floor(
                Math.random()
                * photos.length
            );


        const photo =
            photos[randomIndex];


        randomPhoto.src =
            `${R2_BASE_URL}/${randomEvent.year}/${randomEvent.slug}/previews/${photo.name}.jpg`;


        randomPhoto.alt =
            `${randomEvent.title} – zufälliges Foto`;


        randomPhotoEvent.textContent =
            `${randomEvent.title} · ${randomEvent.year}`;


        randomPhotoNumber.textContent =
            `PHOTO ${String(randomIndex + 1).padStart(3, "0")}`;


        randomPhotoLink.href =
            `events/event.html?event=${randomEvent.slug}`;


        window.eventData =
            undefined;
    };


    document.head.appendChild(
        dataScript
    );
}
}