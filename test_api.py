#!/usr/bin/env python3
import sys
sys.path.insert(0, 'd:/director/backend')
from supabase_db import admin_db

try:
    members = admin_db.select('members', columns='*')
    print(f"Total members: {len(members)}")
    
    if members:
        # Look for chairman
        chairman = next((m for m in members if 'Chairman' in m.get('position', '')), None)
        
        if chairman:
            print("\n✓ Chairman record found:")
            print(f"  Name: {chairman.get('name')}")
            print(f"  Position: {chairman.get('position')}")
            print(f"  Email: {chairman.get('email')}")
            print(f"  Email Secondary: {chairman.get('email_secondary')}")
        else:
            print("\n✓ First member record:")
            m = members[0]
            print(f"  Name: {m.get('name')}")
            print(f"  Position: {m.get('position')}")
            print(f"  Email: {m.get('email')}")
            print(f"  Email Secondary: {m.get('email_secondary')}")
            
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
