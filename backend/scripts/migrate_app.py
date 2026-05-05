import sqlite3

try:
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    cursor.execute("ALTER TABLE activities ADD COLUMN pdf_url VARCHAR(255) DEFAULT ''")
    cursor.execute("ALTER TABLE activities ADD COLUMN colab_url VARCHAR(255) DEFAULT ''")
    conn.commit()
    print("Migration complete.")
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
