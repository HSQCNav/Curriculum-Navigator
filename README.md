# HSQ Curriculum Options — Web v1

A responsive, static web version of the **Option 1** Hospital Learning Helper interface. It uses the supplied Hospital School Queensland colour palette and the curriculum recommendation matrix derived from `Secondary Education Options.xlsx`.

## What is included

- Option 1 card-style interface with a **slide-out / pop-out menu**.
- Five student inputs:
  - Age — optional and not used in matching.
  - Year Level — Year 7 to Year 12.
  - Length of Stay — the four exact spreadsheet bands.
  - Literacy Level — the three exact spreadsheet categories.
  - Numeracy Level — the three exact spreadsheet categories.
- Exact matrix lookup against all **216 student-variable combinations**.
- **648 entered curriculum recommendation cards** from 660 source rows.
- Intentionally blank source combinations remain blank; the web app does not infer a recommendation.
- Process/resource links from the spreadsheet where provided.
- Print / Save PDF and Copy Summary actions.
- Responsive desktop, tablet and phone layout.
- PWA manifest and service worker for installation/offline use when served over localhost or HTTPS.
- No web framework and no third-party runtime libraries.

## Quickest way to open it

You can double-click `index.html`. The recommendation matrix is included as a local JavaScript data file, so the core app works without a web server.

For the full PWA/offline-install experience, run the included Windows file:

`start-local-server.bat`

Then open:

`http://localhost:8080`

If the `.bat` file cannot find Python, open a terminal in this folder and run:

```text
python -m http.server 8080
```

## Folder structure

```text
HSQ_Curriculum_Options_Web_v1/
├── index.html
├── manifest.webmanifest
├── service-worker.js
├── start-local-server.bat
├── README.md
├── assets/
│   ├── hsq-logo.svg
│   ├── icon-192.png
│   └── icon-512.png
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── data/
│   ├── recommendations-data.js
│   └── recommendations.json
├── source-data/
│   ├── Secondary Education Options.xlsx
│   └── recommendations.csv
└── tools/
    └── build-data.py
```

## Recommendation logic

The app builds an exact lookup key from:

`Year Level + Length of Stay + Literacy Level + Numeracy Level`

Age is retained only for the on-screen/printed summary.

No fuzzy matching or fallback recommendation is used. If the supplied source matrix contains no entered curriculum option for the selected combination, the app says so explicitly.

## Updating the curriculum data

The browser data is generated from:

`source-data/recommendations.csv`

After updating/replacing that CSV, rebuild the browser data with:

```text
python tools/build-data.py
```

This regenerates:

- `data/recommendations-data.js` — used directly by the browser and works from `file://`.
- `data/recommendations.json` — human/developer-readable equivalent.

The original supplied workbook is also retained in `source-data/` for reference.

## Branding

Primary colours used:

- Plum `#A6499A`
- Emerald `#349F48`
- Yellow `#F9E700`
- Lime `#C5D12E`
- Orange `#F89521`
- Grey `#929497`
- Pink `#E87CAE`

## Privacy / prototype scope

This static prototype does not submit form data to a server. It deliberately does not request a student name, diagnosis or other identifying health information. Selected values may be retained in the browser's local storage on that device for convenience.

Some curriculum process links point to Queensland Education SharePoint locations and may require an authorised account.

This tool presents curriculum options from the supplied matrix; professional judgement and current HSQ processes still apply.
