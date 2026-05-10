#!/usr/bin/env python3
import sys
sys.path.insert(0, 'backend')

from dotenv import load_dotenv
load_dotenv('backend/.env')

from backend.supabase_db import admin_db

print("Testing order_by...")
try:
    result = admin_db.order_by('members', 'created_at', ascending=False)
    print(f"Result length: {len(result)}")
    if result:
        print(f"First member: {result[0]['name']}")
        print("✓ Database works fine")
    else:
        print("✗ No members found")
except Exception as e:
    print(f"✗ Error: {str(e)}")
