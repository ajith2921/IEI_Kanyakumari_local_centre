import os
import sys

from supabase_db import admin_db

def seed_dummy_conference():
    print("Fetching active conference...")
    active_conf = admin_db.select_one("conferences", {"status": "active"})
    
    if not active_conf:
        print("No active conference found. Creating a dummy base conference...")
        active_conf = admin_db.insert("conferences", {
            "title": "International Conference on Next-Gen Computing",
            "short_title": "ICNGC 2026",
            "date": "2026-11-15",
            "end_date": "2026-11-17",
            "last_date_register": "2026-10-31",
            "venue": "IEI Kanyakumari Local Centre, Nagercoil",
            "cta_text": "Register Now",
            "registration_link": "http://localhost:5173/conference-portal/registration",
            "status": "active",
            "image_url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200",
            "show_new_badge": True
        })
    else:
        print(f"Using existing active conference: {active_conf['title']}")

    cid = active_conf["id"]
    
    print("Seeding Important Dates...")
    admin_db.insert("conference_dates", {"conference_id": cid, "label": "Call for Papers Opens", "date_value": "1st June 2026", "sort_order": 1})
    admin_db.insert("conference_dates", {"conference_id": cid, "label": "Abstract Submission Deadline", "date_value": "15th August 2026", "is_extended": True, "sort_order": 2})
    admin_db.insert("conference_dates", {"conference_id": cid, "label": "Acceptance Notification", "date_value": "10th September 2026", "sort_order": 3})
    
    print("Seeding Speakers...")
    admin_db.insert("conference_speakers", {
        "conference_id": cid, 
        "name": "Dr. Sarah Mitchell", 
        "designation": "Professor of AI", 
        "organization": "Stanford University", 
        "country": "USA", 
        "bio": "Dr. Mitchell is a leading researcher in generative AI and neural architectures.",
        "speaker_type": "keynote",
        "image_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400"
    })
    
    print("Seeding Committees...")
    admin_db.insert("conference_committees", {"conference_id": cid, "member_name": "Er. John Doe", "role": "General Chair", "organization": "IEI Kanyakumari"})
    admin_db.insert("conference_committees", {"conference_id": cid, "member_name": "Dr. Jane Smith", "role": "Technical Chair", "organization": "Anna University"})
    
    print("Seeding Schedule...")
    admin_db.insert("conference_schedule", {
        "conference_id": cid,
        "day_label": "Day 1 (Nov 15)",
        "start_time": "09:00 AM",
        "end_time": "10:30 AM",
        "session_title": "Inauguration & Keynote Address",
        "speaker_name": "Dr. Sarah Mitchell",
        "session_type": "keynote",
        "venue_room": "Main Auditorium"
    })
    
    print("Seeding Sponsors...")
    admin_db.insert("conference_sponsors", {"conference_id": cid, "name": "TechCorp Global", "category": "Platinum Sponsor", "website_url": "https://example.com"})
    
    print("Seeding Tracks...")
    admin_db.insert("conference_tracks", {"conference_id": cid, "track_name": "Track 1: Artificial Intelligence & Machine Learning", "description": "Deep learning, NLP, Computer Vision."})
    admin_db.insert("conference_tracks", {"conference_id": cid, "track_name": "Track 2: Cyber Security & Blockchain", "description": "Network security, cryptography, decentralized systems."})
    
    print("Seeding FAQ...")
    admin_db.insert("conference_faq", {
        "conference_id": cid, 
        "question": "Can I publish my paper if I don't attend?", 
        "answer": "No, at least one author must register and present the paper at the conference for it to be included in the proceedings."
    })
    
    print("Dummy conference seeded successfully!")

if __name__ == "__main__":
    seed_dummy_conference()
