import sys
sys.path.insert(0, 'd:/director/backend')
from supabase_db import admin_db

tables = ['members', 'gallery', 'activities', 'newsletters', 'facilities', 'downloads', 'conferences', 'contact_messages']
for t in tables:
    try:
        result = admin_db.select_paginated(t, limit=2)
        total = result['total']
        print('OK ' + t + ': ' + str(total) + ' records')
    except Exception as e:
        print('ERROR ' + t + ': ' + str(e))
