const figures = document.querySelectorAll(".archive-photo");

let currentImageIndex = 0;

const lightbox = document.createElement("div");
lightbox.classList.add("lightbox");

lightbox.innerHTML = `
    <button class="lightbox-close" aria-label="Schließen">×</button>

    <button class="lightbox-arrow lightbox-prev" aria-label="Vorheriges Bild">
        ←
    </button>

    <div class="lightbox-content">
        <img class="lightbox-image" src="" alt="">

        <div class="lightbox-info">
            <span class="lightbox-number"></span>
            <span class="lightbox-caption"></span>
        </div>
    </div>

    <button class="lightbox-arrow lightbox-next" aria-label="Nächstes Bild">
        →
    </button>
`;

document.body.appendChild(lightbox);

const lightboxImage = lightbox.querySelector(".lightbox-image");
const lightboxNumber = lightbox.querySelector(".lightbox-number");
const lightboxCaption = lightbox.querySelector(".lightbox-caption");

function showImage(index) {
    currentImageIndex = index;

    const figure = figures[index];
    const image = figure.querySelector("img");
    const captionParts = figure.querySelectorAll("figcaption span");

    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;

    lightboxNumber.textContent =
        `${String(index + 1).padStart(3, "0")} / ${String(figures.length).padStart(3, "0")}`;

  lightboxCaption.textContent = "BARI · AUG 2026";
}

function openLightbox(index) {
    showImage(index);
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
}

function nextImage() {
    currentImageIndex++;

    if (currentImageIndex >= figures.length) {
        currentImageIndex = 0;
    }

    showImage(currentImageIndex);
}

function previousImage() {
    currentImageIndex--;

    if (currentImageIndex < 0) {
        currentImageIndex = figures.length - 1;
    }

    showImage(currentImageIndex);
}

figures.forEach((figure, index) => {
    const image = figure.querySelector("img");

    image.addEventListener("click", () => {
        openLightbox(index);
    });
});

lightbox
    .querySelector(".lightbox-close")
    .addEventListener("click", closeLightbox);

lightbox
    .querySelector(".lightbox-next")
    .addEventListener("click", nextImage);

lightbox
    .querySelector(".lightbox-prev")
    .addEventListener("click", previousImage);

lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
        closeLightbox();
    }
});

document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("active")) {
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
});