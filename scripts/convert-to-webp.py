#!/usr/bin/env python3
"""Create the 480 px and 960 px WebP files used by the site.

Requires Pillow: python3 -m pip install Pillow
"""

import argparse
import re
from pathlib import Path

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
VARIANT_NAME = re.compile(r"-(?:480|960)\.webp$", re.IGNORECASE)


def convert(source: Path, destination: Path, remove_source: bool, only_480: bool) -> list[Path]:
    try:
        from PIL import Image, ImageOps
    except ImportError as error:
        raise SystemExit("Pillow is required. Run: python3 -m pip install Pillow") from error
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)
        image = image.convert("RGBA" if image.mode == "RGBA" or "transparency" in image.info else "RGB")
        widths = (480, 960) if image.width > 480 and not only_480 else (480,)
        destination.mkdir(parents=True, exist_ok=True)
        outputs = []
        for width in widths:
            resized = image.copy()
            resized.thumbnail((width, max(1, round(width * image.height / image.width))), Image.Resampling.LANCZOS)
            target = destination / f"{source.stem}-{width}.webp"
            resized.save(target, "WEBP", quality=72, method=6)
            outputs.append(target)
    if remove_source:
        source.unlink()
    return outputs


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="An image or a directory of images")
    parser.add_argument("destination", type=Path, nargs="?", help="Output directory; defaults to each source directory")
    parser.add_argument("--only-480", action="store_true", help="Create only the small variant, for album covers")
    parser.add_argument("--remove-source", action="store_true", help="Delete each original after the requested variants are saved")
    args = parser.parse_args()
    if not args.source.exists():
        parser.error(f"Source does not exist: {args.source}")
    sources = [args.source] if args.source.is_file() else sorted(
        file for file in args.source.rglob("*")
        if file.is_file() and file.suffix.lower() in IMAGE_EXTENSIONS and not VARIANT_NAME.search(file.name)
    )
    for source in sources:
        if source.suffix.lower() not in IMAGE_EXTENSIONS:
            parser.error(f"Unsupported image: {source}")
        target_dir = (args.destination / source.relative_to(args.source).parent) if args.destination and args.source.is_dir() else (args.destination or source.parent)
        for output in convert(source, target_dir, args.remove_source, args.only_480):
            print(output)


if __name__ == "__main__":
    main()
