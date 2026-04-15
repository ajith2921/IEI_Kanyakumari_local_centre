from __future__ import annotations

from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from auth import get_current_active_user
from database import get_db
from models import Newsletter, User
from routes.file_utils import delete_local_upload_if_exists, save_upload_file
from schemas import NewsletterOut

router = APIRouter(prefix="/newsletters", tags=["Newsletters"])
BASE_UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads"
PDF_TYPES = {".pdf"}


@router.get("", response_model=list[NewsletterOut])
def list_newsletters(db: Session = Depends(get_db)) -> list[Newsletter]:
    return db.query(Newsletter).order_by(Newsletter.published_at.desc()).all()


@router.post("", response_model=NewsletterOut, status_code=status.HTTP_201_CREATED)
def create_newsletter(
    title: str = Form(...),
    summary: str = Form(default=""),
    pdf: Optional[UploadFile] = File(default=None),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> Newsletter:
    pdf_url = ""
    if pdf:
        try:
            pdf_url = save_upload_file(pdf, BASE_UPLOAD_DIR, "newsletters", PDF_TYPES)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    newsletter = Newsletter(title=title, summary=summary, pdf_url=pdf_url)
    db.add(newsletter)
    db.commit()
    db.refresh(newsletter)
    return newsletter


@router.put("/{newsletter_id}", response_model=NewsletterOut)
def update_newsletter(
    newsletter_id: int,
    title: str = Form(...),
    summary: str = Form(default=""),
    pdf: Optional[UploadFile] = File(default=None),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> Newsletter:
    newsletter = db.query(Newsletter).filter(Newsletter.id == newsletter_id).first()
    if not newsletter:
        raise HTTPException(status_code=404, detail="Newsletter not found")

    newsletter.title = title
    newsletter.summary = summary

    if pdf:
        try:
            next_pdf_url = save_upload_file(
                pdf,
                BASE_UPLOAD_DIR,
                "newsletters",
                PDF_TYPES,
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

        delete_local_upload_if_exists(newsletter.pdf_url, BASE_UPLOAD_DIR)
        newsletter.pdf_url = next_pdf_url

    db.commit()
    db.refresh(newsletter)
    return newsletter


@router.delete(
    "/{newsletter_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
)
def delete_newsletter(
    newsletter_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> None:
    newsletter = db.query(Newsletter).filter(Newsletter.id == newsletter_id).first()
    if not newsletter:
        raise HTTPException(status_code=404, detail="Newsletter not found")

    delete_local_upload_if_exists(newsletter.pdf_url, BASE_UPLOAD_DIR)
    db.delete(newsletter)
    db.commit()
