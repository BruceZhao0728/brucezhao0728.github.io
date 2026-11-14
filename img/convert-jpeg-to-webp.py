#!/usr/bin/env python3
"""Convert a JPEG file or recursively convert JPEG files in a directory."""

import argparse
from pathlib import Path
from runpy import run_path

JPEG_EXTENSIONS = {".jpg", ".jpeg"}


def main() -> None:
    parser = argparse.ArgumentParser(
        description=__doc__,
        epilog="Writes -480.webp and -960.webp beside each original. Requires Pillow.",
    )
    parser.add_argument("source", type=Path, help="JPG/JPEG file or directory to scan")
    args = parser.parse_args()
    source = args.source

    if source.is_dir():
        images = sorted(
            path for path in source.rglob("*")
            if path.is_file() and path.suffix.lower() in JPEG_EXTENSIONS
        )
    elif source.is_file() and source.suffix.lower() in JPEG_EXTENSIONS:
        images = [source]
    else:
        parser.error(f"Expected a JPG/JPEG file or directory: {source}")

    if not images:
        parser.error(f"No JPG/JPEG files found in {source}")
    if len({(path.parent, path.stem.casefold()) for path in images}) != len(images):
        parser.error("JPEG files in the same directory must have distinct base names")

    converter = Path(__file__).resolve().parents[1] / "scripts" / "convert-to-webp.py"
    convert = run_path(str(converter))["convert"]
    for image in images:
        for output in convert(image, image.parent, False, False, both_sizes=True):
            print(output)


if __name__ == "__main__":
    main()
