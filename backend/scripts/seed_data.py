#!/usr/bin/env python
"""
Seed script to populate database with sample data
Run this from the backend directory: python -m scripts.seed_data
"""
import sys
from pathlib import Path
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from database import SessionLocal
from models import (
    Member, GalleryItem, Newsletter, Activity, 
    Facility, Download, ContactMessage, Conference
)

def seed_members(db):
    """Add member data"""
    members_data = [
        {
            "name": "Dr. M. Marsaline Beno",
            "designation": "Professor",
            "organization": "NIT Trichy",
            "position": "Chairman",
            "membership_type": "Life Member",
            "email": "marsaline@nit.edu",
            "mobile": "+91-9843012345",
            "bio": "Electrical Engineering expert with 25+ years of experience",
            "address": "NIT Trichy, Trichy - 620015",
            "membership_id": "IEI/KK/2024/001"
        },
        {
            "name": "Dr. J. Prakash Arul Jose",
            "designation": "Associate Professor",
            "organization": "NIT Trichy",
            "position": "Honorary Secretary",
            "membership_type": "Annual Member",
            "email": "prakash@nit.edu",
            "mobile": "+91-9876543210",
            "bio": "Civil Engineering specialist in sustainable construction",
            "address": "NIT Trichy, Trichy - 620015",
            "membership_id": "IEI/KK/2024/002"
        },
        {
            "name": "Er. S. Natarajan",
            "designation": "Consulting Engineer",
            "organization": "Infrastructure Design Ltd",
            "position": "Vice Chairman",
            "membership_type": "Life Member",
            "email": "snatarajan@infra.com",
            "mobile": "+91-9123456789",
            "bio": "Expert in structural design and construction management",
            "address": "Kanyakumari, TN - 629001",
            "membership_id": "IEI/KK/2024/003"
        },
        {
            "name": "Dr. A. Megalingam",
            "designation": "Principal Engineer",
            "organization": "Tech Solutions Pvt Ltd",
            "position": "Treasurer",
            "membership_type": "Annual Member",
            "email": "megalingam@techsol.com",
            "mobile": "+91-8765432101",
            "bio": "Mechanical Engineering expert with focus on automation",
            "address": "Nagercoil, TN - 629001",
            "membership_id": "IEI/KK/2024/004"
        },
        {
            "name": "Er. V. Muthum Perumal",
            "designation": "Electrical Engineer",
            "organization": "Power Dynamics Inc",
            "position": "Executive Member",
            "membership_type": "Annual Member",
            "email": "mperumal@powerdyn.com",
            "mobile": "+91-9988776655",
            "bio": "Electrical systems and power distribution specialist",
            "address": "Kanyakumari, TN - 629001",
            "membership_id": "IEI/KK/2024/005"
        }
    ]
    
    for data in members_data:
        member = Member(**data)
        db.add(member)
    
    db.commit()
    print(f"Added {len(members_data)} members")

def seed_gallery(db):
    """Add gallery items"""
    gallery_data = [
        {
            "title": "Annual Conference 2024",
            "description": "Highlights from the IEI Kanyakumari Annual Conference",
            "image_url": "/uploads/gallery/conference_2024.jpg"
        },
        {
            "title": "Technical Workshop - IoT & Automation",
            "description": "Participants learning about IoT applications in industries",
            "image_url": "/uploads/gallery/iot_workshop_2024.jpg"
        },
        {
            "title": "Member Networking Session",
            "description": "Engineers interacting and networking at the center",
            "image_url": "/uploads/gallery/networking_2024.jpg"
        },
        {
            "title": "Infrastructure Site Visit",
            "description": "Members visiting a major infrastructure project",
            "image_url": "/uploads/gallery/site_visit_2024.jpg"
        },
        {
            "title": "Student Mentorship Program",
            "description": "Senior engineers mentoring engineering students",
            "image_url": "/uploads/gallery/mentorship_2024.jpg"
        }
    ]
    
    for data in gallery_data:
        gallery_item = GalleryItem(**data)
        db.add(gallery_item)
    
    db.commit()
    print(f"Added {len(gallery_data)} gallery items")

def seed_newsletters(db):
    """Add newsletter data"""
    newsletters_data = [
        {
            "title": "IEI Times - March 2024",
            "summary": "Latest updates on member activities, upcoming events, and technical articles",
            "pdf_url": "/uploads/newsletters/iei_times_march_2024.pdf",
            "published_at": datetime.now() - timedelta(days=60)
        },
        {
            "title": "IEI Times - February 2024",
            "summary": "Winter technical workshop highlights and conference announcements",
            "pdf_url": "/uploads/newsletters/iei_times_feb_2024.pdf",
            "published_at": datetime.now() - timedelta(days=90)
        },
        {
            "title": "IEI Times - January 2024",
            "summary": "New year initiatives and technical division updates",
            "pdf_url": "/uploads/newsletters/iei_times_jan_2024.pdf",
            "published_at": datetime.now() - timedelta(days=120)
        },
        {
            "title": "Special Edition: Infrastructure Development",
            "summary": "Focus on infrastructure projects and engineering excellence",
            "pdf_url": "/uploads/newsletters/infrastructure_2024.pdf",
            "published_at": datetime.now() - timedelta(days=30)
        }
    ]
    
    for data in newsletters_data:
        newsletter = Newsletter(**data)
        db.add(newsletter)
    
    db.commit()
    print(f"Added {len(newsletters_data)} newsletters")

def seed_activities(db):
    """Add activity data"""
    activities_data = [
        {
            "title": "Technical Seminar: Sustainable Construction",
            "description": "A seminar on sustainable and green construction practices in modern engineering",
            "event_date": "2024-03-15",
            "image_url": "/uploads/activities/sustainable_construction.jpg",
            "pdf_url": "/uploads/activities/seminar_notes_march.pdf",
            "colab_url": "https://example.com/sustainable-construction"
        },
        {
            "title": "Workshop: IoT in Industrial Applications",
            "description": "Hands-on workshop on implementing IoT solutions in manufacturing and industries",
            "event_date": "2024-02-28",
            "image_url": "/uploads/activities/iot_workshop.jpg",
            "pdf_url": "/uploads/activities/iot_guide.pdf",
            "colab_url": "https://example.com/iot-workshop"
        },
        {
            "title": "Site Visit: Integrated Bridge Project",
            "description": "Technical tour of an ongoing major bridge construction project",
            "event_date": "2024-02-10",
            "image_url": "/uploads/activities/bridge_project.jpg",
            "pdf_url": "/uploads/activities/project_report.pdf",
            "colab_url": "https://example.com/bridge-project"
        },
        {
            "title": "Networking Breakfast - 2024",
            "description": "Informal networking session for members to share experiences and knowledge",
            "event_date": "2024-01-25",
            "image_url": "/uploads/activities/networking.jpg",
            "pdf_url": "",
            "colab_url": ""
        },
        {
            "title": "Annual General Body Meeting",
            "description": "AGM of IEI Kanyakumari Center with elections and strategic planning",
            "event_date": "2024-01-15",
            "image_url": "/uploads/activities/agm_2024.jpg",
            "pdf_url": "/uploads/activities/agm_minutes.pdf",
            "colab_url": ""
        }
    ]
    
    for data in activities_data:
        activity = Activity(**data)
        db.add(activity)
    
    db.commit()
    print(f"Added {len(activities_data)} activities")

def seed_facilities(db):
    """Add facility data"""
    facilities_data = [
        {
            "name": "Conference Hall",
            "description": "Well-equipped auditorium with AV facilities, seating capacity 200+",
            "image_url": "/uploads/facilities/conference_hall.jpg"
        },
        {
            "name": "Library & Resource Center",
            "description": "Comprehensive collection of engineering journals, books, and technical publications",
            "image_url": "/uploads/facilities/library.jpg"
        },
        {
            "name": "Meeting Rooms",
            "description": "Multiple air-conditioned meeting rooms for committee and group discussions",
            "image_url": "/uploads/facilities/meeting_rooms.jpg"
        },
        {
            "name": "Computing Lab",
            "description": "Equipped with modern computers and software for technical training",
            "image_url": "/uploads/facilities/computing_lab.jpg"
        },
        {
            "name": "Cafeteria",
            "description": "In-house cafeteria serving refreshments and meals",
            "image_url": "/uploads/facilities/cafeteria.jpg"
        }
    ]
    
    for data in facilities_data:
        facility = Facility(**data)
        db.add(facility)
    
    db.commit()
    print(f"Added {len(facilities_data)} facilities")

def seed_downloads(db):
    """Add downloadable resources"""
    downloads_data = [
        {
            "title": "Member Handbook 2024",
            "description": "Complete guide for IEI members including rules, benefits, and procedures",
            "pdf_url": "/uploads/downloads/member_handbook_2024.pdf"
        },
        {
            "title": "Technical Standards & Guidelines",
            "description": "Latest engineering standards and best practices for construction",
            "pdf_url": "/uploads/downloads/technical_standards.pdf"
        },
        {
            "title": "Code of Ethics for Engineers",
            "description": "Professional ethics and conduct guidelines for practicing engineers",
            "pdf_url": "/uploads/downloads/ethics_code.pdf"
        },
        {
            "title": "Continuing Professional Development (CPD) Requirements",
            "description": "Guidelines on CPD points and requirements for members",
            "pdf_url": "/uploads/downloads/cpd_requirements.pdf"
        },
        {
            "title": "Past Conference Proceedings 2023",
            "description": "Technical papers and presentations from 2023 conference",
            "pdf_url": "/uploads/downloads/conference_2023.pdf"
        }
    ]
    
    for data in downloads_data:
        download = Download(**data)
        db.add(download)
    
    db.commit()
    print(f"Added {len(downloads_data)} downloads")

def seed_contacts(db):
    """Add sample contact messages"""
    contacts_data = [
        {
            "name": "Rajesh Kumar",
            "email": "rajesh.kumar@email.com",
            "phone": "+91-9876543210",
            "message": "Interested in membership. Please send me details about annual membership."
        },
        {
            "name": "Priya Singh",
            "email": "priya.singh@company.com",
            "phone": "+91-8765432109",
            "message": "Would like to participate in the upcoming technical workshop on IoT."
        },
        {
            "name": "Arun Patel",
            "email": "arun.patel@firm.com",
            "phone": "+91-7654321098",
            "message": "Inquiry about hosting a technical seminar at your center."
        },
        {
            "name": "Divya Nair",
            "email": "divya.nair@org.com",
            "phone": "+91-6543210987",
            "message": "Looking for CPD certified training programs."
        }
    ]
    
    for data in contacts_data:
        contact = ContactMessage(**data)
        db.add(contact)
    
    db.commit()
    print(f"Added {len(contacts_data)} contact messages")

def main():
    """Run all seed functions"""
    db = SessionLocal()
    
    try:
        print("\n=== Starting Database Seeding ===\n")
        
        seed_members(db)
        seed_gallery(db)
        seed_newsletters(db)
        seed_activities(db)
        seed_facilities(db)
        seed_downloads(db)
        seed_contacts(db)
        
        print("\n=== Database Seeding Completed Successfully ===\n")
        
    except Exception as e:
        db.rollback()
        print(f"\nError during seeding: {str(e)}\n")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
