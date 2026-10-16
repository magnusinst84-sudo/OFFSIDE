import sqlite3, json, time, os
from typing import Optional, Any

DB_PATH = os.path.join(os.path.dirname(__file__), "offside_cache.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS api_cache (
            key TEXT PRIMARY KEY,
            data TEXT NOT NULL,
            expires_at REAL NOT NULL
        )
    """)
    conn.commit()
    conn.close()

# Initialize immediately
init_db()

def get_cache(key: str) -> Optional[Any]:
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT data, expires_at FROM api_cache WHERE key = ?", (key,))
        row = cur.fetchone()
        conn.close()
        if not row:
            return None
        data_str, expires_at = row
        if time.time() > expires_at:
            # Expired
            return None
        return json.loads(data_str)
    except Exception as e:
        print(f"[cache] Error reading {key}: {e}")
        return None

def set_cache(key: str, data: Any, ttl_seconds: int = 300):
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        expires_at = time.time() + ttl_seconds
        cur.execute("""
            INSERT OR REPLACE INTO api_cache (key, data, expires_at)
            VALUES (?, ?, ?)
        """, (key, json.dumps(data), expires_at))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[cache] Error setting {key}: {e}")

def clear_cache():
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("DELETE FROM api_cache")
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[cache] Error clearing cache: {e}")
