from anvil import Region
import json
import sys
import sqlite3
from typing import List, Dict, Tuple
from datetime import datetime, timezone

# Constants
X_REGION = int(sys.argv[1])
Z_REGION = int(sys.argv[2])
FILE_NAME = f"src/mc-regions/r.{X_REGION}.{Z_REGION}.mca"
CHUNK_SIZE = 16
REGION_SIZE = 32
MAX_HEIGHT = 180
CHEST_BLOCK_ID = 54
SHULKER_BOX_MIN_ID = 219
SHULKER_BOX_MAX_ID = 234
AIR_BLOCK_ID = 0
PROGRESS_UPDATE_INTERVAL = 20
RADIUS = 4

# Load the region file
if len(sys.argv) != 3:
  raise ValueError("Please provide X_REGION and Z_REGION as arguments")

REGION = Region.from_file(FILE_NAME)

X_OFFSET = int(X_REGION) * REGION_SIZE * CHUNK_SIZE
Z_OFFSET = int(Z_REGION) * REGION_SIZE * CHUNK_SIZE

found_blocks = {}

# Iterate through all chunks in the region
TOTAL_CHUNKS = REGION_SIZE * REGION_SIZE  # Total number of chunks in the region
processed_chunks = 0

found_chests = []
found_shulker_boxes = []
failed_chunks = []
found_chests_sphere = []
found_shulker_boxes_sphere = []

# Global variables to keep track of the current chunk coordinates
current_x_chunk = 0
current_z_chunk = 0

def get_item_id_by_coordinates(world_x, world_y, world_z):
  target_chunk_x = world_x // CHUNK_SIZE
  target_chunk_z = world_z // CHUNK_SIZE

  chunk = REGION.get_chunk(target_chunk_x, target_chunk_z)
  if chunk is None:
    return None
  local_x = world_x % CHUNK_SIZE
  local_z = world_z % CHUNK_SIZE
  block = chunk.get_block(local_x, world_y, local_z)

  return block.id if block else None

def get_world_coordinates(x, y, z, custom_x_chunk=None, custom_z_chunk=None):
  global current_x_chunk, current_z_chunk
  x_chunk = custom_x_chunk if custom_x_chunk is not None else current_x_chunk
  z_chunk = custom_z_chunk if custom_z_chunk is not None else current_z_chunk
  x_world = (x_chunk * CHUNK_SIZE) + x + X_OFFSET
  y_world = y
  z_world = (z_chunk * CHUNK_SIZE) + z + Z_OFFSET
  return (x_world, y_world, z_world)

def get_blocks_in_sphere(center: Tuple[int, int, int], radius: int) -> List[Dict]:
  cx, cy, cz = center
  r_squared = radius * radius
  blocks = []

  # print(f"Getting blocks in sphere with center {center} and radius {radius}")

  for dx in range(-radius, radius + 1):
    for dy in range(-radius, radius + 1):
      for dz in range(-radius, radius + 1):
        if dx*dx + dy*dy + dz*dz <= r_squared:
          world_x = cx + dx
          world_y = cy + dy
          world_z = cz + dz
          item_id = get_item_id_by_coordinates(world_x, world_y, world_z)
          
          blocks.append({
            "local": (dx, dy, dz),
            "world": (world_x, world_y, world_z),
            "item_id": item_id
          })

  return blocks

def block_is_near_found_chest(x, y, z, radius = RADIUS):
  for chest in found_chests:
    distance = ((chest[0] - x) ** 2 + (chest[1] - y) ** 2 + (chest[2] - z) ** 2) ** 0.5;
    if distance <= radius:
      return True
  return False

def block_is_near_found_shulker_box(x, y, z, radius = RADIUS):
  for box in found_shulker_boxes:
    distance = ((box[0] - x) ** 2 + (box[1] - y) ** 2 + (box[2] - z) ** 2) ** 0.5;
    if distance <= radius:
      return True
  return False

def check_is_uncovered_double_chest(chunk, x, y, z):
  is_left_block = chunk.get_block(x - 1, y, z).id == CHEST_BLOCK_ID
  is_right_block = chunk.get_block(x + 1, y, z).id == CHEST_BLOCK_ID
  is_front_block = chunk.get_block(x, y, z - 1).id == CHEST_BLOCK_ID
  is_back_block = chunk.get_block(x, y, z + 1).id == CHEST_BLOCK_ID
  if not is_left_block and not is_right_block and not is_front_block and not is_back_block:
    return False
  # print(f"Found double chest at {get_world_coordinates(x, y, z)}")
  is_safe = chunk.get_block(x, y + 1, z).id == AIR_BLOCK_ID
  if is_left_block and chunk.get_block(x - 1, y + 1, z).id == AIR_BLOCK_ID and is_safe:
    return True
  if is_right_block and chunk.get_block(x + 1, y + 1, z).id == AIR_BLOCK_ID and is_safe:
    return True
  if is_front_block and chunk.get_block(x, y + 1, z - 1).id == AIR_BLOCK_ID and is_safe:
    return True
  if is_back_block and chunk.get_block(x, y + 1, z + 1).id == AIR_BLOCK_ID and is_safe:
    return True
  return False


def check_is_uncovered_shulker_box(chunk, x, y, z):
  is_uncovered = chunk.get_block(x, y + 1, z).id == AIR_BLOCK_ID
  return is_uncovered


def process_chunk(chunk_x, chunk_z):
  global current_x_chunk, current_z_chunk, found_blocks, found_chests, skip
  current_x_chunk = chunk_x
  current_z_chunk = chunk_z

  try:
    chunk = REGION.get_chunk(chunk_x, chunk_z)
    for x in range(CHUNK_SIZE):
      for z in range(CHUNK_SIZE):
        for y in range(MAX_HEIGHT):
          block = chunk.get_block(x, y, z)
          if block.id in found_blocks:
            found_blocks[block.id] += 1
          else:
            found_blocks[block.id] = 1
          if (block.id == CHEST_BLOCK_ID and check_is_uncovered_double_chest(chunk, x, y, z)):
            world_coordinates = get_world_coordinates(x, y, z, chunk_x, chunk_z)
            if (not block_is_near_found_chest(world_coordinates[0], world_coordinates[1], world_coordinates[2])):
              found_chests.append(world_coordinates)
              block_sphere = get_blocks_in_sphere(world_coordinates, RADIUS)
              found_chests_sphere.append(block_sphere)
          if (SHULKER_BOX_MIN_ID <= block.id <= SHULKER_BOX_MAX_ID and check_is_uncovered_shulker_box(chunk, x, y, z)):
            world_coordinates = get_world_coordinates(x, y, z, chunk_x, chunk_z)
            if (not block_is_near_found_shulker_box(world_coordinates[0], world_coordinates[1], world_coordinates[2])):
              found_shulker_boxes.append(world_coordinates)
              block_sphere = get_blocks_in_sphere(world_coordinates, RADIUS)
              found_shulker_boxes_sphere.append(block_sphere)

  except Exception as e:
    failed_chunks.append((chunk_x, chunk_z))


processed = 0

for chunk_x in range(REGION_SIZE):
  for chunk_z in range(REGION_SIZE):
    process_chunk(chunk_x, chunk_z)

# Insert found entities into the database
conn = sqlite3.connect("src/prisma/db/database.db")
db = conn.cursor()

region_name = FILE_NAME.split("/").pop()
now = datetime.now(timezone.utc).isoformat(" ", "seconds")
db.execute("SELECT id FROM McRegion WHERE name = ?", (region_name,))
row = db.fetchone()
if row:
    region_id = row[0]
    # Always update updatedAt for region
    db.execute(
        "UPDATE McRegion SET updatedAt = ? WHERE id = ?",
        (now, region_id)
    )
else:
    # Insert new region if not found, set createdAt and updatedAt
    db.execute(
        "INSERT INTO McRegion (name,eq createdAt, updatedAt) VALUES (?, ?, ?)",
        (region_name, now, now)
    )
    region_id = db.lastrowid
    conn.commit()

def upsert_entity(entity_type, coords, region_id, data3d=None):
    now = datetime.now(timezone.utc).isoformat(" ", "seconds")
    # Upsert: try update, if not exists then insert
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

for idx, coords in enumerate(found_chests):
    sphere = found_chests_sphere[idx] if idx < len(found_chests_sphere) else None
    upsert_entity("chest", coords, region_id, sphere)
for idx, coords in enumerate(found_shulker_boxes):
    sphere = found_shulker_boxes_sphere[idx] if idx < len(found_shulker_boxes_sphere) else None
    upsert_entity("shulker_box", coords, region_id, sphere)

conn.commit()
conn.close()
