#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Import catalog data from the local folder:
  НАШ САЙТ АКВИЛОН

Creates:
  - data/products.json
  - assets/products/<product-id>/* images

Run:
  python3 scripts/import_catalog.py
"""

import re
import json
import hashlib
import zipfile
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "НАШ САЙТ АКВИЛОН"
ASSETS = ROOT / "assets" / "products"
OUT = ROOT / "data" / "products.json"

CATEGORY_MAP = {
    "Автохимия": "equipment-chemistry",
    "Аксессуары для АВД": "equipment-accessories",
    "Аксессуары для автомоек": "equipment-wash-accessories",
    "Аппараты высокого давления(+-)": "equipment-high-pressure",
    "Насосы ВД и двигатели(+)": "equipment-engines",
    "Пеногенераторы(+)": "equipment-foam",
    "Поломоечные машины(+)": "equipment-cleaning",
    "Пылесосы и Химчистка(+)": "equipment-vacuums",
}

LABELS = [
    "Артикул", "Торговая марка", "Производитель", "Страна", "Габаритные размеры",
    "Вес", "Материал", "Вход", "Выход", "Давление", "Рабочее давление",
    "Макс. давление", "Производительность", "Температура", "Длина", "Ширина",
    "Высота", "Объем", "Мощность", "Напряжение", "Количество", "Диаметр",
]
LABEL_PATTERN = r"(" + "|".join(re.escape(l) for l in LABELS) + r")"


def extract_text(docx_path: Path) -> str:
    with zipfile.ZipFile(docx_path) as z:
        xml = z.read("word/document.xml").decode("utf-8", errors="ignore")
    xml = xml.replace("</w:p>", "\n")
    text = re.sub(r"<[^>]+>", "", xml)
    text = text.replace("\xa0", " ")
    lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
    joined = " ".join(lines)
    return re.sub(r"\s+", " ", joined).strip()


def parse_specs(text: str):
    sku = ""
    specs = []
    if not text:
        return sku, specs, ""
    text = text.replace("Общие характеристики", "").strip()
    matches = list(re.finditer(LABEL_PATTERN, text))
    for i, m in enumerate(matches):
        label = m.group(1)
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        value = text[start:end].strip(" :;,-")
        if not value:
            continue
        if label == "Артикул" and not sku:
            sku = value.split(" ")[0]
        specs.append(f"{label}: {value}")
    if matches:
        last = matches[-1]
        tail = text[last.end():].strip()
        tail = re.sub(r"^\S+\s*", "", tail)
        desc = tail.strip() or text
    else:
        desc = text
    return sku, specs, desc


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "item"


def main():
    if not SOURCE.exists():
        raise SystemExit(f"Folder not found: {SOURCE}")
    ASSETS.mkdir(parents=True, exist_ok=True)

    products = []

    for docx in SOURCE.rglob("Документ Microsoft Word.docx"):
        rel = docx.relative_to(SOURCE)
        top = rel.parts[0]
        if top == "Страницы сайта":
            continue
        category_id = CATEGORY_MAP.get(top)
        if not category_id:
            continue

        product_dir = docx.parent
        title = product_dir.name.strip()

        try:
            text = extract_text(docx)
        except Exception:
            continue

        sku, specs, desc = parse_specs(text)
        short_desc = (desc[:160].strip() if desc else "")

        images = sorted([p for p in product_dir.iterdir() if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}])
        if not images:
            continue

        pid = f"{slugify(title)}-{hashlib.md5(str(rel).encode()).hexdigest()[:8]}"
        dest_dir = ASSETS / pid
        dest_dir.mkdir(parents=True, exist_ok=True)

        img_paths = []
        for img in images:
            dest = dest_dir / img.name
            if not dest.exists():
                shutil.copy2(img, dest)
            img_paths.append(str(dest.relative_to(ROOT)).replace("\\", "/"))

        products.append({
            "id": pid,
            "title": title,
            "price": 0,
            "sku": sku,
            "shortDescription": short_desc or "Описание будет добавлено позже.",
            "description": desc or "Описание будет добавлено позже.",
            "specs": specs,
            "images": img_paths,
            "categoryId": category_id,
        })

    OUT.write_text(json.dumps(products, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Imported products: {len(products)}")


if __name__ == "__main__":
    main()
