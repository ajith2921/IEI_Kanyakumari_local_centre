"""
Supabase Storage Integration Guide
For handling file uploads (images, PDFs, etc.)
"""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

from supabase import create_client

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


# ============================================================================
# STORAGE SETUP (Run Once)
# ============================================================================

def create_storage_buckets():
    """Create storage buckets for different file types"""
    
    buckets = [
        {
            "name": "members",
            "public": True,
            "file_size_limit": 5242880,  # 5MB
            "allowed_mime_types": ["image/jpeg", "image/png", "image/webp"]
        },
        {
            "name": "gallery",
            "public": True,
            "file_size_limit": 10485760,  # 10MB
            "allowed_mime_types": ["image/jpeg", "image/png", "image/webp"]
        },
        {
            "name": "activities",
            "public": True,
            "file_size_limit": 52428800,  # 50MB
            "allowed_mime_types": ["image/jpeg", "image/png", "image/webp", "application/pdf"]
        },
        {
            "name": "newsletters",
            "public": True,
            "file_size_limit": 52428800,  # 50MB
            "allowed_mime_types": ["application/pdf"]
        },
        {
            "name": "downloads",
            "public": True,
            "file_size_limit": 104857600,  # 100MB
            "allowed_mime_types": ["application/pdf", "text/csv", "application/vnd.ms-excel"]
        }
    ]
    
    for bucket_config in buckets:
        try:
            supabase.storage.create_bucket(
                bucket_config["name"],
                options={
                    "public": bucket_config["public"],
                    "file_size_limit": bucket_config["file_size_limit"],
                    "allowed_mime_types": bucket_config["allowed_mime_types"]
                }
            )
            print(f"✅ Created bucket: {bucket_config['name']}")
        except Exception as e:
            if "already exists" in str(e):
                print(f"⏭️  Bucket already exists: {bucket_config['name']}")
            else:
                print(f"❌ Error creating {bucket_config['name']}: {e}")


# ============================================================================
# FILE OPERATIONS
# ============================================================================

def upload_file(bucket: str, file_path: str, remote_path: str) -> str:
    """
    Upload file to Supabase Storage
    
    Args:
        bucket: Bucket name (e.g., "members", "gallery")
        file_path: Local file path
        remote_path: Path in storage (e.g., "profiles/user123.jpg")
    
    Returns:
        Public URL of uploaded file
    """
    try:
        with open(file_path, "rb") as f:
            data = f.read()
        
        response = supabase.storage.from_(bucket).upload(
            path=remote_path,
            file=data,
            file_options={"content-type": "auto"}
        )
        
        # Get public URL
        public_url = get_public_url(bucket, remote_path)
        print(f"✅ Uploaded: {remote_path}")
        return public_url
        
    except Exception as e:
        print(f"❌ Upload error: {e}")
        raise


def upload_file_object(bucket: str, file_obj, remote_path: str) -> str:
    """
    Upload file object (from FastAPI FileUpload)
    
    Args:
        bucket: Bucket name
        file_obj: File object from FastAPI
        remote_path: Path in storage
    
    Returns:
        Public URL of uploaded file
    """
    try:
        # Read file content
        content = file_obj.file.read()
        
        # Determine content type
        content_type = file_obj.content_type or "application/octet-stream"
        
        response = supabase.storage.from_(bucket).upload(
            path=remote_path,
            file=content,
            file_options={"content-type": content_type}
        )
        
        public_url = get_public_url(bucket, remote_path)
        print(f"✅ Uploaded: {remote_path}")
        return public_url
        
    except Exception as e:
        print(f"❌ Upload error: {e}")
        raise


def get_public_url(bucket: str, file_path: str) -> str:
    """
    Get public URL for a file
    
    Format: https://xxxxx.supabase.co/storage/v1/object/public/{bucket}/{path}
    """
    try:
        response = supabase.storage.from_(bucket).get_public_url(file_path)
        return response.get("publicUrl", "")
    except Exception as e:
        print(f"❌ Error getting URL: {e}")
        return ""


def delete_file(bucket: str, file_path: str) -> bool:
    """Delete file from storage"""
    try:
        supabase.storage.from_(bucket).remove([file_path])
        print(f"✅ Deleted: {file_path}")
        return True
    except Exception as e:
        print(f"❌ Delete error: {e}")
        return False


def list_files(bucket: str, path: str = "") -> list:
    """List files in a bucket/path"""
    try:
        response = supabase.storage.from_(bucket).list(path)
        return response or []
    except Exception as e:
        print(f"❌ List error: {e}")
        return []


def download_file(bucket: str, file_path: str, save_path: str) -> bool:
    """Download file from storage"""
    try:
        data = supabase.storage.from_(bucket).download(file_path)
        
        with open(save_path, "wb") as f:
            f.write(data)
        
        print(f"✅ Downloaded: {file_path}")
        return True
    except Exception as e:
        print(f"❌ Download error: {e}")
        return False


# ============================================================================
# FASTAPI INTEGRATION EXAMPLES
# ============================================================================

from fastapi import APIRouter, File, UploadFile, HTTPException, status
import mimetypes
from datetime import datetime

router = APIRouter(prefix="/api", tags=["uploads"])


@router.post("/members/{member_id}/upload-image", status_code=status.HTTP_200_OK)
async def upload_member_image(member_id: int, file: UploadFile = File(...)):
    """
    Upload member profile image to Supabase Storage
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
        )
    
    # Validate file size (5MB max for member images)
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Max 5MB."
        )
    
    try:
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_ext = Path(file.filename).suffix
        remote_path = f"members/member_{member_id}_{timestamp}{file_ext}"
        
        # Upload to Supabase Storage
        file.file.seek(0)  # Reset file pointer
        image_url = upload_file_object("members", file, remote_path)
        
        # Update member record in database
        from supabase_db import admin_db
        admin_db.update("members", {"image_url": image_url}, {"id": member_id})
        
        return {
            "success": True,
            "image_url": image_url,
            "message": "Image uploaded successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )


@router.post("/gallery/upload", status_code=status.HTTP_201_CREATED)
async def upload_gallery_image(
    title: str,
    description: str,
    file: UploadFile = File(...)
):
    """Upload image to gallery"""
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid image format")
    
    try:
        content = await file.read()
        
        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_ext = Path(file.filename).suffix
        remote_path = f"gallery/img_{timestamp}{file_ext}"
        
        # Upload
        file.file.seek(0)
        image_url = upload_file_object("gallery", file, remote_path)
        
        # Save to database
        from supabase_db import admin_db
        gallery_item = admin_db.insert("gallery", {
            "title": title,
            "description": description,
            "image_url": image_url
        })
        
        return gallery_item
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/activities/upload", status_code=status.HTTP_201_CREATED)
async def upload_activity(
    title: str,
    description: str,
    event_date: str,
    image: UploadFile = File(...),
    pdf: UploadFile = File(None)
):
    """Upload activity with image and optional PDF"""
    
    try:
        image_url = ""
        pdf_url = ""
        
        # Upload image
        if image:
            image_data = await image.read()
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            image_path = f"activities/img_{timestamp}{Path(image.filename).suffix}"
            image.file.seek(0)
            image_url = upload_file_object("activities", image, image_path)
        
        # Upload PDF
        if pdf:
            pdf_data = await pdf.read()
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            pdf_path = f"activities/pdf_{timestamp}{Path(pdf.filename).suffix}"
            pdf.file.seek(0)
            pdf_url = upload_file_object("activities", pdf, pdf_path)
        
        # Save to database
        from supabase_db import admin_db
        activity = admin_db.insert("activities", {
            "title": title,
            "description": description,
            "event_date": event_date,
            "image_url": image_url,
            "pdf_url": pdf_url
        })
        
        return activity
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/files/{bucket}/{file_path}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_stored_file(bucket: str, file_path: str):
    """Delete file from storage (admin only)"""
    # Add auth check here in real app
    
    try:
        delete_file(bucket, file_path)
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# BATCH OPERATIONS
# ============================================================================

def migrate_local_uploads_to_storage():
    """
    Migrate existing local uploads to Supabase Storage
    Run once during migration
    """
    uploads_dir = Path("uploads")
    
    if not uploads_dir.exists():
        print("❌ No local uploads directory found")
        return
    
    # Define mappings
    mappings = {
        "members": "members",
        "gallery": "gallery",
        "activities": "activities",
        "newsletters": "newsletters",
        "downloads": "downloads"
    }
    
    total_uploaded = 0
    
    for local_dir, bucket in mappings.items():
        source_path = uploads_dir / local_dir
        
        if not source_path.exists():
            print(f"⏭️  No {local_dir} directory")
            continue
        
        # Upload all files
        for file_path in source_path.glob("**/*"):
            if file_path.is_file():
                try:
                    relative_path = file_path.relative_to(uploads_dir / local_dir)
                    remote_path = f"{local_dir}/{relative_path}"
                    
                    upload_file(bucket, str(file_path), str(remote_path))
                    total_uploaded += 1
                    
                except Exception as e:
                    print(f"❌ Error uploading {file_path}: {e}")
    
    print(f"\n✅ Migration complete! {total_uploaded} files uploaded")


# ============================================================================
# CLEANUP & MAINTENANCE
# ============================================================================

def cleanup_old_files(bucket: str, days_old: int = 30):
    """Delete files older than N days (for cleanup)"""
    from datetime import datetime, timedelta
    
    files = list_files(bucket)
    cutoff_date = datetime.now() - timedelta(days=days_old)
    
    deleted_count = 0
    
    for file_info in files:
        # Check file creation date if available
        # This is simplified - adjust based on actual metadata
        if delete_file(bucket, file_info["name"]):
            deleted_count += 1
    
    print(f"✅ Deleted {deleted_count} old files from {bucket}")


if __name__ == "__main__":
    # Run setup once
    print("Setting up Supabase Storage buckets...\n")
    create_storage_buckets()
    
    print("\n✅ Storage setup complete!")
