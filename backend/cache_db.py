import sqlite3, json, time, os
from datetime import datetime, timezone
from typing import Optional, Any, Tuple

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
    cur.execute("""
        CREATE TABLE IF NOT EXISTS api_daily_calls (
            day_utc TEXT PRIMARY KEY,
            call_count INTEGER NOT NULL DEFAULT 0
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS api_circuit_breaker (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            cooldown_until REAL NOT NULL DEFAULT 0,
            reason TEXT
        )
    """)
    cur.execute("INSERT OR IGNORE INTO api_circuit_breaker (id, cooldown_until, reason) VALUES (1, 0, '')")
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

def get_stale_cache(key: str) -> Optional[Any]:
    """Retrieve cached data even if expired (used for quota safety & circuit-breaker fallbacks)."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT data FROM api_cache WHERE key = ?", (key,))
        row = cur.fetchone()
        conn.close()
        if not row:
            return None
        return json.loads(row[0])
    except Exception as e:
        print(f"[cache] Error reading stale {key}: {e}")
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

def get_daily_api_calls(day_utc: Optional[str] = None) -> int:
    if not day_utc:
        day_utc = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT call_count FROM api_daily_calls WHERE day_utc = ?", (day_utc,))
        row = cur.fetchone()
        conn.close()
        return row[0] if row else 0
    except Exception as e:
        print(f"[cache] Error reading daily calls: {e}")
        return 0

def increment_daily_api_calls(day_utc: Optional[str] = None) -> int:
    if not day_utc:
        day_utc = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO api_daily_calls (day_utc, call_count)
            VALUES (?, 1)
            ON CONFLICT(day_utc) DO UPDATE SET call_count = call_count + 1
        """, (day_utc,))
        conn.commit()
        cur.execute("SELECT call_count FROM api_daily_calls WHERE day_utc = ?", (day_utc,))
        row = cur.fetchone()
        conn.close()
        return row[0] if row else 1
    except Exception as e:
        print(f"[cache] Error incrementing daily calls: {e}")
        return 0

def reset_daily_api_calls(day_utc: Optional[str] = None):
    if not day_utc:
        day_utc = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("DELETE FROM api_daily_calls WHERE day_utc = ?", (day_utc,))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[cache] Error resetting daily calls: {e}")

def try_acquire_api_call_quota(daily_cap: int, day_utc: Optional[str] = None) -> bool:
    """
    Atomically check if call_count < daily_cap and increment by 1.
    Uses BEGIN IMMEDIATE transaction to guarantee atomic execution under concurrency.
    Returns True if quota was acquired, False if cap reached.
    """
    if not day_utc:
        day_utc = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    conn = sqlite3.connect(DB_PATH, timeout=20.0)
    try:
        cur = conn.cursor()
        cur.execute("BEGIN IMMEDIATE")
        cur.execute("""
            INSERT OR IGNORE INTO api_daily_calls (day_utc, call_count)
            VALUES (?, 0)
        """, (day_utc,))
        cur.execute("""
            UPDATE api_daily_calls
            SET call_count = call_count + 1
            WHERE day_utc = ? AND call_count < ?
        """, (day_utc, daily_cap))
        acquired = cur.rowcount > 0
        conn.commit()
        return acquired
    except Exception as e:
        try:
            conn.rollback()
        except Exception:
            pass
        print(f"[cache] Error in try_acquire_api_call_quota: {e}")
        return False
    finally:
        conn.close()

def get_circuit_breaker_status() -> Tuple[bool, float, str]:
    """Returns (is_active, cooldown_until, reason)."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT cooldown_until, reason FROM api_circuit_breaker WHERE id = 1")
        row = cur.fetchone()
        conn.close()
        if row:
            cooldown_until = float(row[0])
            reason = str(row[1] or "")
            is_active = time.time() < cooldown_until
            return is_active, cooldown_until, reason
        return False, 0.0, ""
    except Exception as e:
        print(f"[cache] Error getting circuit breaker: {e}")
        return False, 0.0, ""

def trip_circuit_breaker(reason: str, duration_seconds: int = 900):
    """Trip circuit breaker to halt outbound calls for duration_seconds (default 15m = 900s)."""
    try:
        cooldown_until = time.time() + duration_seconds
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("""
            INSERT OR REPLACE INTO api_circuit_breaker (id, cooldown_until, reason)
            VALUES (1, ?, ?)
        """, (cooldown_until, reason))
        conn.commit()
        conn.close()
        print(f"[quota_safety] Circuit breaker tripped for {duration_seconds}s. Reason: {reason}")
    except Exception as e:
        print(f"[cache] Error tripping circuit breaker: {e}")

def reset_circuit_breaker():
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("UPDATE api_circuit_breaker SET cooldown_until = 0, reason = '' WHERE id = 1")
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[cache] Error resetting circuit breaker: {e}")
