const R2_BASE_URL =
    "https://pub-ebd4187f42fe4ee0b12e028556010158.r2.dev";


/* ========================================
   EVENT AUS URL AUSLESEN
   ======================================== */

const params =
    new URLSearchParams(window.location.search);

const eventSlug =
    params.get("event");


if (!eventSlug) {

    document.body.innerHTML = `
        <main style="padding: 50px;">
            <h1>Event nicht gefunden</h1>

            <p>
                In der URL wurde kein Event angegeben.
            </p>

            <a href="../index.html">
                ← Zurück zum Archiv
            </a>
        </main>
    `;

} else {

    loadEventData(eventSlug);

}


/* ========================================
   EVENT-DATEI LADEN
   ======================================== */

function loadEventData(slug) {

    const dataScript =
        document.createElement("script");

    dataScript.src =
        `../data/${slug}-data.js`;


    dataScript.onload = () => {

        if (typeof eventData === "undefined") {

            showEventError();
            return;

        }

        buildEventPage(eventData);

    };


    dataScript.onerror = () => {

        showEventError();

    };


    document.head.appendChild(dataScript);

}


/* ========================================
   FEHLER
   ======================================== */

function showEventError() {

    document.body.innerHTML = `
        <main style="padding: 50px;">
            <h1>Event nicht gefunden</h1>

            <p>
                Die Event-Daten konnten nicht geladen werden.
            </p>

            <a href="../index.html">
                ← Zurück zum Archiv
            </a>
        </main>
    `;

}


/* ========================================
   EVENTSEITE AUFBAUEN
   ======================================== */

function buildEventPage(data) {

    document.title =
        `${data.title} ${data.year} | Wegschachtel Archiv`;


    document
        .querySelector("#event-title")
        .textContent =
        data.title;


    document
        .querySelector("#event-number")
        .textContent =
        `FILE ${data.fileNumber}`;


    document
        .querySelector("#event-date")
        .textContent =
        data.displayDate.toUpperCase();


    document
        .querySelector("#event-location")
        .textContent =
        data.location.toUpperCase();


    document
        .querySelector("#event-description")
        .textContent =
        data.description;


    document
        .querySelector("#photo-count")
        .textContent =
        `001—${String(data.photos.length).padStart(3, "0")}`;


    document
        .querySelector("#nav-event")
        .textContent =
        data.title.toUpperCase();


    const yearLink =
        document.querySelector("#nav-year");

    yearLink.textContent =
        data.year;

    yearLink.href =
        `../years/year.html?year=${data.year}`


    const backLink =
        document.querySelector("#back-to-year");

    backLink.textContent =
        `← BACK TO ${data.year}`;

    backLink.href =
        `../years/year.html?year=${data.year}`


    document
        .querySelector("#footer-title")
        .textContent =
        `WEGSCHACHTEL ARCHIVE · ${data.year}`;


    buildGallery(data);

}


/* ========================================
   GALERIE ERSTELLEN
   ======================================== */

function buildGallery(data) {

    const gallery =
        document.querySelector("#photo-archive");


    data.photos.forEach((photo, index) => {

        const figure =
            document.createElement("figure");


        let layoutClass = "photo-small";


        if (photo.layout === "large") {

            layoutClass = "photo-large";

        }


        if (photo.layout === "medium") {

            layoutClass = "photo-medium";

        }


        if (photo.layout === "portrait") {

            layoutClass =
                "photo-small portrait-photo";

        }


        figure.className =
            `archive-photo ${layoutClass}`;


        const number =
            String(index + 1)
            .padStart(3, "0");


        const originalExtension =
            photo.originalExtension || ".JPG";


        figure.innerHTML = `

            <img
                src="${R2_BASE_URL}/${data.year}/${data.slug}/previews/${photo.name}.jpg"

                data-original="${R2_BASE_URL}/${data.year}/${data.slug}/originals/${photo.name}${originalExtension}"

                alt="${data.title} – Foto ${number}"
            >

            <figcaption>

                <span>
                    ${number}
                </span>

                <span>
                    ${data.location.toUpperCase()}
                </span>

            </figcaption>

        `;


        gallery.appendChild(figure);

    });


    createLightbox(data);

}


/* ========================================
   LIGHTBOX
   ======================================== */

function createLightbox(data) {

    const figures =
        document.querySelectorAll(".archive-photo");


    let currentImageIndex = 0;


    const lightbox =
        document.createElement("div");

    lightbox.classList.add("lightbox");


    lightbox.innerHTML = `

        <button
            class="lightbox-close"
            aria-label="Schließen">
            ×
        </button>


        <button
            class="lightbox-arrow lightbox-prev"
            aria-label="Vorheriges Bild">
            ←
        </button>


        <div class="lightbox-content">

            <img
                class="lightbox-image"
                src=""
                alt=""
            >


            <div class="lightbox-info">

                <span class="lightbox-number"></span>

                <span class="lightbox-caption"></span>

            </div>

        </div>


        <button
            class="lightbox-arrow lightbox-next"
            aria-label="Nächstes Bild">
            →
        </button>

    `;


    document.body.appendChild(lightbox);


    const lightboxImage =
        lightbox.querySelector(".lightbox-image");

    const lightboxNumber =
        lightbox.querySelector(".lightbox-number");

    const lightboxCaption =
        lightbox.querySelector(".lightbox-caption");


    function showImage(index) {

        currentImageIndex = index;


        const image =
            figures[index]
            .querySelector("img");


        lightboxImage.src =
            image.dataset.original || image.src;


        lightboxImage.alt =
            image.alt;


        lightboxNumber.textContent =
            `${String(index + 1).padStart(3, "0")} / ${String(figures.length).padStart(3, "0")}`;


        lightboxCaption.textContent =
            `${data.title.toUpperCase()} · ${data.displayDate.toUpperCase()}`;

    }


    function openLightbox(index) {

        showImage(index);

        lightbox.classList.add("active");

        document.body.style.overflow =
            "hidden";

    }


    function closeLightbox() {

        lightbox.classList.remove("active");

        document.body.style.overflow =
            "";

    }


    function nextImage() {

        currentImageIndex++;

        if (
            currentImageIndex >= figures.length
        ) {

            currentImageIndex = 0;

        }

        showImage(currentImageIndex);

    }


    function previousImage() {

        currentImageIndex--;

        if (currentImageIndex < 0) {

            currentImageIndex =
                figures.length - 1;

        }

        showImage(currentImageIndex);

    }


    figures.forEach(
        (figure, index) => {

            figure
                .querySelector("img")
                .addEventListener(
                    "click",
                    () => openLightbox(index)
                );

        }
    );


    lightbox
        .querySelector(".lightbox-close")
        .addEventListener(
            "click",
            closeLightbox
        );


    lightbox
        .querySelector(".lightbox-next")
        .addEventListener(
            "click",
            nextImage
        );


    lightbox
        .querySelector(".lightbox-prev")
        .addEventListener(
            "click",
            previousImage
        );


    lightbox.addEventListener(
        "click",
        event => {

            if (event.target === lightbox) {

                closeLightbox();

            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                !lightbox.classList.contains("active")
            ) {
                return;
            }


            if (event.key === "Escape") {

                closeLightbox();

            }


            if (event.key === "ArrowRight") {

                nextImage();

            }


            if (event.key === "ArrowLeft") {

                previousImage();

            }

        }
    );

}