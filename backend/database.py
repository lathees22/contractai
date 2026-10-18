import sqlite3
import json
import os
from typing import List, Dict, Any, Optional

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "contractai.db")

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Contracts table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS contracts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        filename TEXT,
        file_type TEXT NOT NULL,
        raw_text TEXT NOT NULL,
        summary TEXT DEFAULT '',
        risk_score INTEGER DEFAULT 0,
        risk_level TEXT DEFAULT 'Low',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 2. Sections table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contract_id INTEGER NOT NULL,
        section_number TEXT,
        section_title TEXT,
        content TEXT NOT NULL,
        FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE CASCADE
    )
    """)

    # 3. Clauses table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS clauses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contract_id INTEGER NOT NULL,
        clause_type TEXT NOT NULL,
        original_text TEXT NOT NULL,
        plain_summary TEXT NOT NULL,
        section_reference TEXT,
        confidence REAL DEFAULT 0.95,
        FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE CASCADE
    )
    """)

    # 4. Risks table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS risks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contract_id INTEGER NOT NULL,
        risk_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        explanation TEXT NOT NULL,
        safer_rewrite TEXT NOT NULL,
        clause_reference TEXT,
        section_reference TEXT,
        FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE CASCADE
    )
    """)

    # 5. Obligations table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS obligations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contract_id INTEGER NOT NULL,
        party TEXT NOT NULL,
        action TEXT NOT NULL,
        deadline TEXT NOT NULL,
        status TEXT DEFAULT 'Pending',
        due_date TEXT,
        FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE CASCADE
    )
    """)

    # 6. Chat messages table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contract_id INTEGER NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        cited_clauses TEXT DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE CASCADE
    )
    """)

    # 7. System settings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )
    """)

    # Default settings
    cursor.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('ai_mode', 'rule_based')")
    cursor.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('anthropic_api_key', '')")
    cursor.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('anthropic_model', 'claude-3-5-sonnet-20241022')")

    conn.commit()
    conn.close()

# Ensure database tables exist upon import
init_db()

# Helper queries
def save_contract_analysis(contract_data: Dict[str, Any], sections: List[Dict], clauses: List[Dict], risks: List[Dict], obligations: List[Dict]) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO contracts (title, filename, file_type, raw_text, summary, risk_score, risk_level)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        contract_data.get("title", "Untitled Contract"),
        contract_data.get("filename"),
        contract_data.get("file_type", "text"),
        contract_data.get("raw_text", ""),
        contract_data.get("summary", ""),
        contract_data.get("risk_score", 0),
        contract_data.get("risk_level", "Low")
    ))
    contract_id = cursor.lastrowid

    # Insert sections
    for sec in sections:
        cursor.execute("""
            INSERT INTO sections (contract_id, section_number, section_title, content)
            VALUES (?, ?, ?, ?)
        """, (contract_id, sec.get("section_number", ""), sec.get("section_title", ""), sec.get("content", "")))

    # Insert clauses
    for cl in clauses:
        cursor.execute("""
            INSERT INTO clauses (contract_id, clause_type, original_text, plain_summary, section_reference, confidence)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            contract_id,
            cl.get("clause_type", "General"),
            cl.get("original_text", ""),
            cl.get("plain_summary", ""),
            cl.get("section_reference", ""),
            cl.get("confidence", 0.95)
        ))

    # Insert risks
    for rk in risks:
        cursor.execute("""
            INSERT INTO risks (contract_id, risk_type, severity, explanation, safer_rewrite, clause_reference, section_reference)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            contract_id,
            rk.get("risk_type", "Warning"),
            rk.get("severity", "Medium"),
            rk.get("explanation", ""),
            rk.get("safer_rewrite", ""),
            rk.get("clause_reference", ""),
            rk.get("section_reference", "")
        ))

    # Insert obligations
    for ob in obligations:
        cursor.execute("""
            INSERT INTO obligations (contract_id, party, action, deadline, status, due_date)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            contract_id,
            ob.get("party", "Party"),
            ob.get("action", ""),
            ob.get("deadline", "Upon request"),
            ob.get("status", "Pending"),
            ob.get("due_date", None)
        ))

    conn.commit()
    conn.close()
    return contract_id

def list_all_contracts() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT c.id, c.title, c.filename, c.file_type, c.created_at, c.risk_score, c.risk_level,
               (SELECT COUNT(*) FROM clauses WHERE contract_id = c.id) as total_clauses,
               (SELECT COUNT(*) FROM risks WHERE contract_id = c.id) as total_risks,
               (SELECT COUNT(*) FROM obligations WHERE contract_id = c.id) as total_obligations
        FROM contracts c
        ORDER BY c.id DESC
    """)
    rows = cursor.fetchall()
    contracts = [dict(row) for row in rows]
    conn.close()
    return contracts

def get_contract_detail(contract_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM contracts WHERE id = ?", (contract_id,))
    c_row = cursor.fetchone()
    if not c_row:
        conn.close()
        return None
        
    contract = dict(c_row)
    
    cursor.execute("SELECT * FROM sections WHERE contract_id = ? ORDER BY id ASC", (contract_id,))
    contract["sections"] = [dict(r) for r in cursor.fetchall()]
    
    cursor.execute("SELECT * FROM clauses WHERE contract_id = ? ORDER BY id ASC", (contract_id,))
    contract["clauses"] = [dict(r) for r in cursor.fetchall()]
    
    cursor.execute("SELECT * FROM risks WHERE contract_id = ? ORDER BY CASE severity WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END, id ASC", (contract_id,))
    contract["risks"] = [dict(r) for r in cursor.fetchall()]
    
    cursor.execute("SELECT * FROM obligations WHERE contract_id = ? ORDER BY id ASC", (contract_id,))
    contract["obligations"] = [dict(r) for r in cursor.fetchall()]
    
    conn.close()
    return contract

def update_obligation_status(obligation_id: int, status: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE obligations SET status = ? WHERE id = ?", (status, obligation_id))
    affected = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return affected

def delete_contract_by_id(contract_id: int) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM contracts WHERE id = ?", (contract_id,))
    cursor.execute("DELETE FROM sections WHERE contract_id = ?", (contract_id,))
    cursor.execute("DELETE FROM clauses WHERE contract_id = ?", (contract_id,))
    cursor.execute("DELETE FROM risks WHERE contract_id = ?", (contract_id,))
    cursor.execute("DELETE FROM obligations WHERE contract_id = ?", (contract_id,))
    cursor.execute("DELETE FROM chat_messages WHERE contract_id = ?", (contract_id,))
    conn.commit()
    conn.close()
    return True

def save_chat_message(contract_id: int, role: str, content: str, cited_clauses: List[Dict]) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO chat_messages (contract_id, role, content, cited_clauses)
        VALUES (?, ?, ?, ?)
    """, (contract_id, role, content, json.dumps(cited_clauses)))
    msg_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return msg_id

def get_chat_history(contract_id: int) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM chat_messages WHERE contract_id = ? ORDER BY id ASC", (contract_id,))
    rows = cursor.fetchall()
    history = []
    for r in rows:
        d = dict(r)
        try:
            d["cited_clauses"] = json.loads(d["cited_clauses"])
        except Exception:
            d["cited_clauses"] = []
        history.append(d)
    conn.close()
    return history

def get_setting(key: str, default: str = "") -> str:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT value FROM settings WHERE key = ?", (key,))
    row = cursor.fetchone()
    conn.close()
    return row["value"] if row else default

def set_setting(key: str, value: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", (key, value))
    conn.commit()
    conn.close()
