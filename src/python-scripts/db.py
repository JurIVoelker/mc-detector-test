import sqlite3
from datetime import datetime, timezone
import json

def insert_chest_data(chest_data, region_name):
  conn = sqlite3.connect("src/prisma/db/database.db")
  db = conn.cursor()

  region_id = upsert_region(db, region_name)
  for item in chest_data:
    x, y, z, data3d = item
    data3d = list(data3d)
    upsert_entity(db, "chest", (x, y, z), region_id, data3d)
  
  conn.commit()
  conn.close()

def upsert_region(db, region_name):
  now = datetime.now(timezone.utc).isoformat(" ", "seconds")
  
  db.execute("SELECT id FROM McRegion WHERE name = ?", (region_name,))
  row = db.fetchone()
  if row:
    region_id = row[0]
    db.execute(
      "UPDATE McRegion SET updatedAt = ? WHERE id = ?",
      (now, region_id)
    )
  else:
    db.execute(
      "INSERT INTO McRegion (name, createdAt, updatedAt) VALUES (?, ?, ?)",
      (region_name, now, now)
    )
    region_id = db.lastrowid
  return region_id

def upsert_entity(db, entity_type, coords, region_id, data3d=None):
  now = datetime.now(timezone.utc).isoformat(" ", "seconds")

  db.execute(
    """
    SELECT id FROM FoundEntities WHERE type = ? AND data = ? AND regionId = ?
    """,
    (entity_type, f"{coords[0]} {coords[1]} {coords[2]}", region_id)
  )
  entity_row = db.fetchone()
  if entity_row:
    db.execute(
        """
        UPDATE FoundEntities SET updatedAt = ?, data3d = ? WHERE id = ?
        """,
        (now, json.dumps(data3d) if data3d is not None else None, entity_row[0])
      )
  else:
    db.execute(
        """
        INSERT INTO FoundEntities (type, data, regionId, isSaved, data3d, createdAt, updatedAt)
        VALUES (?, ?, ?, 0, ?, ?, ?)
        """,
        (entity_type, f"{coords[0]} {coords[1]} {coords[2]}", region_id, json.dumps(data3d) if data3d is not None else None, now, now)
    )