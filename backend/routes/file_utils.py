from io import BytesIO
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse
from uuid import uuid4

from fastapi import UploadFile
from PIL import Image, ImageOps

LOCAL_UPLOAD_PREFIX = "/uploads/"


def save_upload_file(file: UploadFile, base_folder: Path, sub_folder: str, allowed_types: set[str]) -> str:
    extension = Path(file.filename or "").suffix.lower()
    if extension not in allowed_types:
        allowed_str = ", ".join(sorted(allowed_types))
        raise ValueError(f"Invalid file type. Allowed: {allowed_str}")

    target_folder = base_folder / sub_folder
    target_folder.mkdir(parents=True, exist_ok=True)
    unique_name = f"{uuid4().hex}{extension}"
    target_path = target_folder / unique_name

    with target_path.open("wb") as buffer:
        buffer.write(file.file.read())

    return f"/uploads/{sub_folder}/{unique_name}"


def save_optimized_image_file(
    file: UploadFile,
    base_folder: Path,
    sub_folder: str,
    allowed_types: set[str],
    target_size: tuple[int, int],
    crop_center: tuple[float, float] = (0.5, 0.5),
) -> str:
    extension = Path(file.filename or "").suffix.lower()
    if extension not in allowed_types:
        allowed_str = ", ".join(sorted(allowed_types))
        raise ValueError(f"Invalid file type. Allowed: {allowed_str}")

    raw_content = file.file.read()
    if not raw_content:
        raise ValueError("Uploaded file is empty.")

    try:
        image = Image.open(BytesIO(raw_content))
        image = ImageOps.exif_transpose(image)
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
        resized = ImageOps.fit(
            image,
            target_size,
            method=Image.Resampling.LANCZOS if hasattr(Image, "Resampling") else Image.LANCZOS,
            centering=crop_center,
        )
    except Exception as exc:  # pragma: no cover - defensive validation
        raise ValueError("Invalid image file.") from exc

    target_folder = base_folder / sub_folder
    target_folder.mkdir(parents=True, exist_ok=True)
    unique_name = f"{uuid4().hex}.webp"
    target_path = target_folder / unique_name

    with target_path.open("wb") as buffer:
        resized.save(buffer, format="WEBP", quality=78, method=6)

    return f"/uploads/{sub_folder}/{unique_name}"


def resolve_local_upload_path(upload_url: str, upload_root: Path) -> Optional[Path]:
    if not upload_url or not upload_url.startswith(LOCAL_UPLOAD_PREFIX):
        return None

    relative_path = upload_url[len(LOCAL_UPLOAD_PREFIX) :]
    if not relative_path:
        return None

    return upload_root / relative_path


def save_optimized_local_image_path(
    source_path: Path,
    base_folder: Path,
    sub_folder: str,
    target_size: tuple[int, int],
    crop_center: tuple[float, float] = (0.5, 0.5),
) -> str:
    if not source_path.exists() or not source_path.is_file():
        raise ValueError("Source image not found.")

    raw_content = source_path.read_bytes()
    if not raw_content:
        raise ValueError("Source image is empty.")

    try:
        image = Image.open(BytesIO(raw_content))
        image = ImageOps.exif_transpose(image)
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
        resized = ImageOps.fit(
            image,
            target_size,
            method=Image.Resampling.LANCZOS if hasattr(Image, "Resampling") else Image.LANCZOS,
            centering=crop_center,
        )
    except Exception as exc:  # pragma: no cover - defensive validation
        raise ValueError("Invalid source image.") from exc

    target_folder = base_folder / sub_folder
    target_folder.mkdir(parents=True, exist_ok=True)
    unique_name = f"{uuid4().hex}.webp"
    target_path = target_folder / unique_name

    with target_path.open("wb") as buffer:
        resized.save(buffer, format="WEBP", quality=78, method=6)

    return f"/uploads/{sub_folder}/{unique_name}"


def normalize_remote_image_url(url: str) -> str:
    candidate = url.strip()
    if not candidate:
        return ""

    parsed = urlparse(candidate)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError("Image URL must be a valid http or https URL.")

    return candidate


def delete_local_upload_if_exists(upload_url: str, upload_root: Path) -> None:
    target_path = resolve_local_upload_path(upload_url, upload_root)
    if not target_path:
        return

    target_path.unlink(missing_ok=True)
