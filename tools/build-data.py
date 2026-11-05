#!/usr/bin/env python3
"""Build the browser-ready HSQ recommendation matrix from recommendations.csv.

The script uses only Python's standard library so it can be run on a normal
Windows installation with Python available. It deliberately keeps the source
matrix exact: no recommendations are inferred where the CSV is blank.
"""
from __future__ import annotations

import csv
import json
from collections import defaultdict
from itertools import product
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source-data" / "recommendations.csv"
OUT_JS = ROOT / "data" / "recommendations-data.js"
OUT_JSON = ROOT / "data" / "recommendations.json"

YEARS = [f"Year {n}" for n in range(7, 13)]
STAYS = ["Less than 2 weeks", "2–4 weeks", "5–10 weeks", "More than 10 weeks"]
LEVELS = [
    "2 years above or below expected level",
    "At expected level",
    "Significantly below expected level",
]

OFFERING_META = {
    "HSQ Curriculum English": {
        "category": "Curriculum",
        "description": "HSQ English curriculum learning matched to the selected student profile.",
        "icon": "book",
    },
    "HSQ Curriculum Maths": {
        "category": "Curriculum",
        "description": "HSQ Mathematics curriculum learning matched to the selected student profile.",
        "icon": "calculator",
    },
    "Short Course Literacy": {
        "category": "Short course",
        "description": "Short Course Literacy is identified in the HSQ source matrix for this combination.",
        "icon": "book-open",
    },
    "Short Course Numeracy": {
        "category": "Short course",
        "description": "Short Course Numeracy is identified in the HSQ source matrix for this combination.",
        "icon": "calculator",
    },
    "Short Course Careers": {
        "category": "Careers",
        "description": "A careers short course identified in the HSQ source matrix for this combination.",
        "icon": "briefcase",
    },
    "SELF program": {
        "category": "Student support",
        "description": "The SELF program is identified in the HSQ source matrix for this combination.",
        "icon": "heart",
    },
    "QCAA Academic Integrity Course": {
        "category": "Academic skills",
        "description": "The QCAA Academic Integrity Course is identified in the HSQ source matrix for this combination.",
        "icon": "shield-check",
    },
    "STILE modules- Career & employment/ Adult life": {
        "category": "Life & career skills",
        "description": "STILE career, employment and adult-life modules are identified in the HSQ source matrix for this combination.",
        "icon": "compass",
    },
    "Certificate I in Active Volunteering": {
        "category": "Vocational pathway",
        "description": "Certificate I in Active Volunteering is identified in the HSQ source matrix for this combination.",
        "icon": "award",
    },
    "Certificate in General Education for Adults": {
        "category": "Alternative pathway",
        "description": "Certificate in General Education for Adults is identified in the HSQ source matrix for this combination.",
        "icon": "graduation-cap",
    },
}


def key(year: str, stay: str, literacy: str, numeracy: str) -> str:
    return "||".join((year, stay, literacy, numeracy))


def main() -> None:
    grouped: dict[str, list[dict[str, str]]] = defaultdict(list)
    source_rows = 0

    with SOURCE.open("r", encoding="utf-8-sig", newline="") as f:
        for row in csv.DictReader(f):
            source_rows += 1
            k = key(
                row["Year Level"].strip(),
                row["Length of Stay"].strip(),
                row["Literacy Level"].strip(),
                row["Numeracy Level"].strip(),
            )
            title = row["Curriculum Option"].strip()
            link = row["Link to Process"].strip()
            if not title:
                # Blank source output is meaningful: the matrix has no entered
                # recommendation for this row. Keep the combination but do not
                # invent a recommendation.
                continue
            meta = OFFERING_META.get(title, {})
            item = {
                "title": title,
                "link": link,
                "category": meta.get("category", "Curriculum option"),
                "description": meta.get(
                    "description",
                    "This option is identified in the HSQ source matrix for this combination.",
                ),
                "icon": meta.get("icon", "sparkles"),
            }
            # Avoid duplicate curriculum cards if a source row is repeated.
            if not any(existing["title"] == title for existing in grouped[k]):
                grouped[k].append(item)

    matrix: dict[str, list[dict[str, str]]] = {}
    for year, stay, literacy, numeracy in product(YEARS, STAYS, LEVELS, LEVELS):
        k = key(year, stay, literacy, numeracy)
        matrix[k] = grouped.get(k, [])

    payload = {
        "metadata": {
            "title": "Hospital School Queensland Secondary Education Options",
            "sourceFile": "Secondary Education Options.xlsx",
            "sourceRows": source_rows,
            "combinationCount": len(matrix),
            "logic": "Exact match only. No recommendations are inferred when the source matrix is blank.",
            "ageUsedForMatching": False,
        },
        "options": {
            "yearLevels": YEARS,
            "lengthsOfStay": STAYS,
            "learningLevels": LEVELS,
        },
        "matrix": matrix,
    }

    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    OUT_JS.write_text(
        "/* Generated from source-data/recommendations.csv. Do not hand-edit. */\n"
        "window.HSQ_RECOMMENDATION_DATA = "
        + json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )

    non_empty = sum(bool(v) for v in matrix.values())
    empty = len(matrix) - non_empty
    cards = sum(len(v) for v in matrix.values())
    print(f"Built {len(matrix)} combinations from {source_rows} source rows")
    print(f"Recommendation cards: {cards}; empty combinations: {empty}")
    print(OUT_JS)
    print(OUT_JSON)


if __name__ == "__main__":
    main()
