from pathlib import Path
from PIL import Image, ImageOps
from datetime import datetime
import re
import os
import boto3


# ========================================
# GRUNDEINSTELLUNGEN
# ========================================

PROJECT_DIR = Path(
    r"C:\Users\imcst\OneDrive\Wegschachtel-Archiv\Wegschachtel-Archiv"
)

MAX_SIZE = 1600
QUALITY = 82

SUPPORTED = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}

BUCKET_NAME = "wegschachtel-photos"

R2_ACCESS_KEY_ID = os.environ.get(
    "R2_ACCESS_KEY_ID"
)

R2_SECRET_ACCESS_KEY = os.environ.get(
    "R2_SECRET_ACCESS_KEY"
)

R2_ENDPOINT = os.environ.get(
    "R2_ENDPOINT"
)


# ========================================
# R2 ZUGANG PRÜFEN
# ========================================

if not all([
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_ENDPOINT
]):

    print(
        "FEHLER: R2-Zugangsdaten wurden nicht gefunden."
    )

    print(
        "Prüfe deine Windows-Umgebungsvariablen."
    )

    raise SystemExit


r2 = boto3.client(
    "s3",
    endpoint_url=R2_ENDPOINT,
    aws_access_key_id=R2_ACCESS_KEY_ID,
    aws_secret_access_key=R2_SECRET_ACCESS_KEY,
    region_name="auto"
)


# ========================================
# HILFSFUNKTIONEN
# ========================================

def create_slug(text):

    text = text.lower().strip()

    replacements = {
        "ä": "ae",
        "ö": "oe",
        "ü": "ue",
        "ß": "ss"
    }

    for old, new in replacements.items():
        text = text.replace(old, new)

    text = re.sub(
        r"[^a-z0-9]+",
        "-",
        text
    )

    return text.strip("-")


def escape_js(text):

    return (
        text
        .replace("\\", "\\\\")
        .replace('"', '\\"')
        .replace("\n", " ")
    )


def validate_date(date_text):

    try:

        datetime.strptime(
            date_text,
            "%Y-%m-%d"
        )

        return True

    except ValueError:

        return False


# ========================================
# ZENTRALE EVENTLISTE AKTUALISIEREN
# ========================================

def update_event_registry(
    title,
    slug,
    year,
    start_date,
    end_date,
    display_date,
    location,
    file_number
):

    registry_file = (
        PROJECT_DIR
        / "data"
        / "events.js"
    )

    registry_file.parent.mkdir(
        parents=True,
        exist_ok=True
    )


    if not registry_file.exists():

        registry_file.write_text(
            "const allEvents = [\n];\n",
            encoding="utf-8"
        )


    content = registry_file.read_text(
        encoding="utf-8"
    )


    # Prüfen, ob Event schon existiert

    if f'slug: "{slug}"' in content:

        print()
        print(
            f"Event '{slug}' ist bereits in events.js eingetragen."
        )

        return


    event_block = f'''    {{
        title: "{escape_js(title)}",
        slug: "{slug}",
        year: {year},
        startDate: "{start_date}",
        endDate: "{end_date}",
        displayDate: "{escape_js(display_date)}",
        location: "{escape_js(location)}",
        fileNumber: "{escape_js(file_number)}"
    }}'''


    position = content.rfind("];")


    if position == -1:

        print(
            "FEHLER: events.js hat ein unerwartetes Format."
        )

        return


    before = content[:position].rstrip()


    if before.endswith("["):

        new_content = (
            before
            + "\n"
            + event_block
            + "\n];\n"
        )

    else:

        new_content = (
            before
            + ",\n"
            + event_block
            + "\n];\n"
        )


    registry_file.write_text(
        new_content,
        encoding="utf-8"
    )


    print()
    print(
        f"Event automatisch registriert: {slug}"
    )


# ========================================
# EVENT-INFORMATIONEN ABFRAGEN
# ========================================

print()
print(
    "========================================"
)

print(
    "      WEGSCHACHTEL EVENT IMPORT"
)

print(
    "========================================"
)

print()


source_input = input(
    "Pfad zum Ordner mit den Originalfotos: "
).strip().strip('"')


source_dir = Path(
    source_input
)


if not source_dir.exists():

    print()
    print(
        "FEHLER: Dieser Ordner existiert nicht."
    )

    raise SystemExit


event_title = input(
    "Eventname: "
).strip()


year_input = input(
    "Jahr (z.B. 2025): "
).strip()


try:

    event_year = int(
        year_input
    )

except ValueError:

    print()
    print(
        "FEHLER: Das Jahr muss eine Zahl sein."
    )

    raise SystemExit


# ========================================
# STARTDATUM
# ========================================

while True:

    start_date = input(
        "Startdatum (YYYY-MM-DD): "
    ).strip()

    if validate_date(start_date):

        break

    print(
        "Ungültiges Datum. Beispiel: 2025-08-24"
    )


# ========================================
# ENDDATUM
# ========================================

while True:

    end_date = input(
        "Enddatum (YYYY-MM-DD, Enter = gleicher Tag): "
    ).strip()

    if end_date == "":

        end_date = start_date
        break

    if not validate_date(end_date):

        print(
            "Ungültiges Datum. Beispiel: 2025-08-28"
        )

        continue


    start_datetime = datetime.strptime(
        start_date,
        "%Y-%m-%d"
    )

    end_datetime = datetime.strptime(
        end_date,
        "%Y-%m-%d"
    )


    if end_datetime < start_datetime:

        print(
            "Das Enddatum darf nicht vor dem Startdatum liegen."
        )

        continue


    break


# ========================================
# RESTLICHE DATEN
# ========================================

display_date = input(
    "Angezeigtes Datum (z.B. 24.–28. August 2025): "
).strip()


location = input(
    "Ort (z.B. Cannes, France): "
).strip()


description = input(
    "Kurze Beschreibung: "
).strip()


file_number = get_next_file_number()

print(
    f"Archivnummer automatisch vergeben: {file_number}"
)


event_slug = create_slug(
    event_title
)


print()
print(
    f"Technischer Eventname: {event_slug}"
)

print()


# ========================================
# ZIELORDNER
# ========================================

preview_dir = (
    PROJECT_DIR
    / "generated-previews"
    / str(event_year)
    / event_slug
)


data_file = (
    PROJECT_DIR
    / "data"
    / f"{event_slug}-data.js"
)


preview_dir.mkdir(
    parents=True,
    exist_ok=True
)


data_file.parent.mkdir(
    parents=True,
    exist_ok=True
)


# ========================================
# FOTOS SUCHEN
# ========================================

files = sorted(
    file
    for file in source_dir.iterdir()

    if file.is_file()

    and file.suffix.lower()
    in SUPPORTED
)


if not files:

    print()
    print(
        "FEHLER: Keine unterstützten Fotos gefunden."
    )

    raise SystemExit


print(
    f"{len(files)} Fotos gefunden."
)

print()


# ========================================
# PREVIEWS + R2 UPLOAD
# ========================================

photo_data = []


for index, file in enumerate(files):

    generated_name = (
        f"{event_slug}-{index + 1:03}"
    )


    output_name = (
        f"{generated_name}.jpg"
    )


    output_file = (
        preview_dir
        / output_name
    )


    try:

        # --------------------------------
        # Preview erstellen
        # --------------------------------

        with Image.open(file) as img:

            img = ImageOps.exif_transpose(
                img
            )


            original_width, original_height = (
                img.size
            )


            is_portrait = (
                original_height
                > original_width
            )


            if img.mode not in (
                "RGB",
                "L"
            ):

                img = img.convert(
                    "RGB"
                )


            img.thumbnail(
                (
                    MAX_SIZE,
                    MAX_SIZE
                )
            )


            img.save(
                output_file,
                "JPEG",
                quality=QUALITY,
                optimize=True
            )


        # --------------------------------
        # Layout bestimmen
        # --------------------------------

        if is_portrait:

            layout = "portrait"

        elif index % 5 == 0:

            layout = "large"

        elif index % 3 == 0:

            layout = "medium"

        else:

            layout = "small"


        # --------------------------------
        # Original-Endung merken
        # --------------------------------

        original_extension = (
            file.suffix.lower()
        )


        # --------------------------------
        # R2 Pfade
        # --------------------------------

        preview_key = (
            f"{event_year}/"
            f"{event_slug}/"
            f"previews/"
            f"{generated_name}.jpg"
        )


        original_key = (
            f"{event_year}/"
            f"{event_slug}/"
            f"originals/"
            f"{generated_name}"
            f"{original_extension}"
        )


        # --------------------------------
        # Preview hochladen
        # --------------------------------

        print(
            f"OK: {file.name} "
            f"→ {generated_name}"
        )


        print(
            "   Upload Preview..."
        )


        r2.upload_file(
            str(output_file),
            BUCKET_NAME,
            preview_key,
            ExtraArgs={
                "ContentType":
                "image/jpeg"
            }
        )


        # --------------------------------
        # Original hochladen
        # --------------------------------

        print(
            "   Upload Original..."
        )


        r2.upload_file(
            str(file),
            BUCKET_NAME,
            original_key
        )


        # --------------------------------
        # Daten speichern
        # --------------------------------

        photo_data.append({

            "name":
                generated_name,

            "layout":
                layout,

            "original_extension":
                original_extension,

            "original_filename":
                file.name
        })


    except Exception as error:

        print()
        print(
            f"FEHLER bei {file.name}: "
            f"{error}"
        )


# ========================================
# EVENT-DATEI ERSTELLEN
# ========================================

lines = []


lines.append(
    "window.eventData = {"
)


lines.append(
    f'    title: "{escape_js(event_title)}",'
)


lines.append(
    f'    slug: "{event_slug}",'
)


lines.append(
    f"    year: {event_year},"
)


lines.append(
    f'    startDate: "{start_date}",'
)


lines.append(
    f'    endDate: "{end_date}",'
)


lines.append(
    f'    displayDate: "{escape_js(display_date)}",'
)


lines.append(
    f'    location: "{escape_js(location)}",'
)


lines.append(
    f'    description: "{escape_js(description)}",'
)


lines.append(
    f'    fileNumber: "{escape_js(file_number)}",'
)


lines.append("")

lines.append(
    "    photos: ["
)


for index, photo in enumerate(
    photo_data
):

    comma = (
        ","
        if index
        < len(photo_data) - 1
        else ""
    )


    lines.append(
        "        {"
    )


    lines.append(
        f'            name: "{photo["name"]}",'
    )


    lines.append(
        f'            layout: "{photo["layout"]}",'
    )


    lines.append(
        f'            originalExtension: "{photo["original_extension"]}",'
    )


    lines.append(
        f'            originalFilename: "{escape_js(photo["original_filename"])}"'
    )


    lines.append(
        f"        }}{comma}"
    )


lines.append(
    "    ]"
)


lines.append(
    "};"
)


data_file.write_text(
    "\n".join(lines),
    encoding="utf-8"
)


# ========================================
# ZENTRALE EVENTLISTE AKTUALISIEREN
# ========================================

update_event_registry(
    event_title,
    event_slug,
    event_year,
    start_date,
    end_date,
    display_date,
    location,
    file_number
)


# ========================================
# FERTIG
# ========================================

print()
print(
    "========================================"
)

print(
    "              IMPORT FERTIG"
)

print(
    "========================================"
)

print()


print(
    f"Event: {event_title}"
)


print(
    f"Slug: {event_slug}"
)


print(
    f"Zeitraum: {start_date} bis {end_date}"
)


print(
    f"Fotos erfolgreich verarbeitet: "
    f"{len(photo_data)}"
)


print()


print(
    "Previews:"
)

print(
    preview_dir
)


print()


print(
    "Event-Daten:"
)

print(
    data_file
)


print()


print(
    "Originalfotos wurden NICHT verändert."
)


print()


print(
    "Cloudflare R2 Upload abgeschlossen."
)
def get_next_file_number():

    registry_file = (
        PROJECT_DIR
        / "data"
        / "events.js"
    )

    if not registry_file.exists():
        return "001"

    content = registry_file.read_text(
        encoding="utf-8"
    )

    numbers = re.findall(
        r'fileNumber:\s*"(\d+)"',
        content
    )

    if not numbers:
        return "001"

    highest_number = max(
        int(number)
        for number in numbers
    )

    return str(
        highest_number + 1
    ).zfill(3)