from __future__ import annotations

from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from auth import get_current_active_user
from database import get_db
from models import Download, User
from routes.file_utils import delete_local_upload_if_exists, save_upload_file
from schemas import DownloadOut

router = APIRouter(prefix="/downloads", tags=["Downloads"])
BASE_UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads"
PDF_TYPES = {".pdf"}


@router.get("", response_model=list[DownloadOut])
def list_downloads(db: Session = Depends(get_db)) -> list[Download]:
    return db.query(Download).order_by(Download.created_at.desc()).all()


@router.post("", response_model=DownloadOut, status_code=status.HTTP_201_CREATED)
def create_download(
    title: str = Form(...),
    description: str = Form(default=""),
    pdf: UploadFile = File(...),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> Download:
    try:
        pdf_url = save_upload_file(pdf, BASE_UPLOAD_DIR, "downloads", PDF_TYPES)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    download = Download(title=title, description=description, pdf_url=pdf_url)
    db.add(download)
    db.commit()
    db.refresh(download)
    return download


@router.put("/{download_id}", response_model=DownloadOut)
def update_download(
    download_id: int,
    title: str = Form(...),
    description: str = Form(default=""),
    pdf: Optional[UploadFile] = File(default=None),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> Download:
    download = db.query(Download).filter(Download.id == download_id).first()
    if not download:
        raise HTTPException(status_code=404, detail="Download not found")

    download.title = title
    download.description = description

    if pdf:
        try:
            next_pdf_url = save_upload_file(pdf, BASE_UPLOAD_DIR, "downloads", PDF_TYPES)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

        delete_local_upload_if_exists(download.pdf_url, BASE_UPLOAD_DIR)
        download.pdf_url = next_pdf_url

    db.commit()
    db.refresh(download)
    return download


@router.delete(
    "/{download_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
)
def delete_download(
    download_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> None:
    download = db.query(Download).filter(Download.id == download_id).first()
    if not download:
        raise HTTPException(status_code=404, detail="Download not found")

    delete_local_upload_if_exists(download.pdf_url, BASE_UPLOAD_DIR)
    db.delete(download)
    db.commit()
