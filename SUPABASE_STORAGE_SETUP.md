# Supabase Storage Setup - Quick Guide

## 🪣 Create Storage Buckets in Supabase

### Step 1: Go to Supabase Storage
1. Open your Supabase project: https://app.supabase.com
2. Click **Storage** in the left sidebar
3. Click **"New bucket"**

### Step 2: Create Each Bucket

Create these 5 buckets (one at a time):

#### Bucket 1: **members**
- **Bucket name**: `members`
- **Public bucket**: ✅ Yes (toggle ON)
- Click **Create bucket**

#### Bucket 2: **gallery**
- **Bucket name**: `gallery`
- **Public bucket**: ✅ Yes
- Click **Create bucket**

#### Bucket 3: **activities**
- **Bucket name**: `activities`
- **Public bucket**: ✅ Yes
- Click **Create bucket**

#### Bucket 4: **newsletters**
- **Bucket name**: `newsletters`
- **Public bucket**: ✅ Yes
- Click **Create bucket**

#### Bucket 5: **downloads**
- **Bucket name**: `downloads`
- **Public bucket**: ✅ Yes
- Click **Create bucket**

✅ **You should now see all 5 buckets listed in Storage!**

---

## 🔒 Set Bucket Policies (Security)

For each bucket, click on it and set these policies:

1. Click the bucket name (e.g., `members`)
2. Go to **Policies** tab
3. Click **New policy**
4. Choose: **For queries with RLS enabled**
5. Select operation: **SELECT** (allow public read)
6. Click **Review** → **Save policy**

This allows the public to **view** images but only authenticated users can **upload**.

---

## 📝 Update Your Backend Routes

Now update your upload routes to use Supabase Storage instead of local files.

### Example: Member Image Upload

**OLD CODE** (saves locally):
```python
# Saves to: backend/uploads/members/image.jpg
save_optimized_image_file(file, "members", member_image_path)
```

**NEW CODE** (saves to Supabase):
```python
import os
from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Upload to Supabase Storage
response = supabase.storage.from_("members").upload(
    path=f"member_{member_id}_{filename}",
    file=file.file.read(),
    file_options={"content-type": file.content_type}
)

# Get public URL
image_url = supabase.storage.from_("members").get_public_url(
    f"member_{member_id}_{filename}"
)
```

---

## 🔧 Update File Upload Routes

### Updated `backend/routes/members.py` (members.py - file upload section)

Replace the image upload part with:

```python
from fastapi import File, UploadFile
import os
from datetime import datetime
from pathlib import Path
from supabase import create_client
from supabase_db import admin_db

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

@router.post("/{member_id}/upload-image")
async def upload_member_image(member_id: int, file: UploadFile = File(...)):
    """Upload member profile image to Supabase Storage"""
    
    try:
        # Validate file type
        allowed_types = ["image/jpeg", "image/png", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
            )
        
        # Validate file size (5MB max)
        content = await file.read()
        if len(content) > 5 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="File too large. Max 5MB.")
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_ext = Path(file.filename).suffix
        remote_path = f"member_{member_id}_{timestamp}{file_ext}"
        
        # Upload to Supabase Storage
        file.file.seek(0)  # Reset file pointer
        supabase.storage.from_("members").upload(
            path=remote_path,
            file=content,
            file_options={"content-type": file.content_type}
        )
        
        # Get public URL
        image_url = supabase.storage.from_("members").get_public_url(remote_path)
        
        # Update member record in database
        admin_db.update("members", {"image_url": image_url}, {"id": member_id})
        
        return {
            "success": True,
            "image_url": image_url,
            "message": "Image uploaded successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
```

---

## 📸 Update Gallery Upload

**In `backend/routes/gallery.py`:**

```python
@router.post("")
async def create_gallery(
    title: str = Form(...),
    description: str = Form(...),
    file: UploadFile = File(...)
):
    """Create gallery item with image upload to Supabase"""
    
    try:
        # Read and validate file
        content = await file.read()
        
        if len(content) > 10 * 1024 * 1024:  # 10MB max for gallery
            raise HTTPException(status_code=413, detail="File too large")
        
        # Upload to Supabase Storage
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_ext = Path(file.filename).suffix
        remote_path = f"img_{timestamp}{file_ext}"
        
        supabase.storage.from_("gallery").upload(
            path=remote_path,
            file=content,
            file_options={"content-type": file.content_type}
        )
        
        # Get public URL
        image_url = supabase.storage.from_("gallery").get_public_url(remote_path)
        
        # Save to database
        gallery_item = admin_db.insert("gallery", {
            "title": title,
            "description": description,
            "image_url": image_url
        })
        
        return gallery_item
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 🎬 Update Activities Upload (with PDF)

**In `backend/routes/activities.py`:**

```python
@router.post("")
async def create_activity(
    title: str = Form(...),
    description: str = Form(...),
    event_date: str = Form(...),
    image: UploadFile = File(None),
    pdf: UploadFile = File(None)
):
    """Create activity with image and PDF upload to Supabase"""
    
    try:
        image_url = ""
        pdf_url = ""
        
        # Upload image if provided
        if image:
            image_content = await image.read()
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            img_path = f"activity_img_{timestamp}{Path(image.filename).suffix}"
            
            supabase.storage.from_("activities").upload(
                path=img_path,
                file=image_content,
                file_options={"content-type": image.content_type}
            )
            
            image_url = supabase.storage.from_("activities").get_public_url(img_path)
        
        # Upload PDF if provided
        if pdf:
            pdf_content = await pdf.read()
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            pdf_path = f"activity_pdf_{timestamp}{Path(pdf.filename).suffix}"
            
            supabase.storage.from_("activities").upload(
                path=pdf_path,
                file=pdf_content,
                file_options={"content-type": "application/pdf"}
            )
            
            pdf_url = supabase.storage.from_("activities").get_public_url(pdf_path)
        
        # Save to database
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
```

---

## 📋 Update Newsletters Upload

**In `backend/routes/newsletters.py`:**

```python
@router.post("")
async def create_newsletter(
    title: str = Form(...),
    summary: str = Form(...),
    file: UploadFile = File(...)
):
    """Upload newsletter PDF to Supabase"""
    
    try:
        content = await file.read()
        
        if len(content) > 50 * 1024 * 1024:  # 50MB max for PDFs
            raise HTTPException(status_code=413, detail="File too large")
        
        # Upload to Supabase Storage
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        pdf_path = f"newsletter_{timestamp}{Path(file.filename).suffix}"
        
        supabase.storage.from_("newsletters").upload(
            path=pdf_path,
            file=content,
            file_options={"content-type": "application/pdf"}
        )
        
        # Get public URL
        pdf_url = supabase.storage.from_("newsletters").get_public_url(pdf_path)
        
        # Save to database
        newsletter = admin_db.insert("newsletters", {
            "title": title,
            "summary": summary,
            "pdf_url": pdf_url
        })
        
        return newsletter
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 📥 Update Downloads Upload

**In `backend/routes/downloads.py`:**

```python
@router.post("")
async def create_download(
    title: str = Form(...),
    description: str = Form(...),
    file: UploadFile = File(...)
):
    """Upload downloadable file to Supabase"""
    
    try:
        content = await file.read()
        
        if len(content) > 100 * 1024 * 1024:  # 100MB max
            raise HTTPException(status_code=413, detail="File too large")
        
        # Upload to Supabase Storage
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_path = f"download_{timestamp}{Path(file.filename).suffix}"
        
        supabase.storage.from_("downloads").upload(
            path=file_path,
            file=content,
            file_options={"content-type": file.content_type}
        )
        
        # Get public URL
        download_url = supabase.storage.from_("downloads").get_public_url(file_path)
        
        # Save to database
        download = admin_db.insert("downloads", {
            "title": title,
            "description": description,
            "pdf_url": download_url
        })
        
        return download
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## ✅ Summary: File Storage URLs

After upload, your files are stored at:

| Bucket | URL Format |
|--------|-----------|
| members | `https://vbdmnbrcmmpapizwkkxb.supabase.co/storage/v1/object/public/members/filename.jpg` |
| gallery | `https://vbdmnbrcmmpapizwkkxb.supabase.co/storage/v1/object/public/gallery/filename.jpg` |
| activities | `https://vbdmnbrcmmpapizwkkxb.supabase.co/storage/v1/object/public/activities/filename.pdf` |
| newsletters | `https://vbdmnbrcmmpapizwkkxb.supabase.co/storage/v1/object/public/newsletters/filename.pdf` |
| downloads | `https://vbdmnbrcmmpapizwkkxb.supabase.co/storage/v1/object/public/downloads/filename.pdf` |

These URLs are:
- ✅ **Public** - anyone can view them
- ✅ **Permanent** - won't break
- ✅ **Fast** - served via Supabase CDN
- ✅ **Secure** - no access to your backend

---

## 🔄 What Happens When You Upload

1. **User uploads image** → Frontend sends to backend API
2. **Backend receives file** → Validates (type, size)
3. **Upload to Supabase Storage** → File saved in public bucket
4. **Get public URL** → Supabase generates CDN URL
5. **Save URL to database** → Store link in `image_url` column
6. **Return to frontend** → Display image to users

---

## 📝 Next Steps

1. ✅ Create all 5 buckets in Supabase Storage
2. ✅ Install `supabase` package: `pip install supabase`
3. ✅ Update your file upload routes (use examples above)
4. ✅ Test uploading a file
5. ✅ Verify file appears in Supabase Storage dashboard
6. ✅ Verify image displays on website

---

Need help updating a specific route? Let me know which one! 🚀
