from anvil import Region
import json
import time

# Constants
FILE_NAME = "r.-12.-5.mca"
CHUNK_SIZE = 16
REGION_SIZE = 32
MAX_HEIGHT = 180
CHEST_BLOCK_ID = 54
SHULKER_BOX_MIN_ID = 219
SHULKER_BOX_MAX_ID = 234
AIR_BLOCK_ID = 0
PROGRESS_UPDATE_INTERVAL = 20

# Load the region file
X_REGION = int(FILE_NAME.split(".")[1])
Z_REGION = int(FILE_NAME.split(".")[2])
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

with open("items.json", "r") as file:
  ITEM_MAP = json.load(file)

# Global variables to keep track of the current chunk coordinates
current_x_chunk = 0
current_z_chunk = 0


def get_world_coordinates(x, y, z, custom_x_chunk=None, custom_z_chunk=None):
  global current_x_chunk, current_z_chunk
  x_chunk = custom_x_chunk if custom_x_chunk is not None else current_x_chunk
  z_chunk = custom_z_chunk if custom_z_chunk is not None else current_z_chunk
  x_world = (x_chunk * CHUNK_SIZE) + x + X_OFFSET
  y_world = y
  z_world = (z_chunk * CHUNK_SIZE) + z + Z_OFFSET
  return (x_world, y_world, z_world)


def check_is_uncovered_double_chest(chunk, x, y, z):
  is_left_block = chunk.get_block(x - 1, y, z).id == CHEST_BLOCK_ID
  is_right_block = chunk.get_block(x + 1, y, z).id == CHEST_BLOCK_ID
  is_front_block = chunk.get_block(x, y, z - 1).id == CHEST_BLOCK_ID
  is_back_block = chunk.get_block(x, y, z + 1).id == CHEST_BLOCK_ID
  if not is_left_block and not is_right_block and not is_front_block and not is_back_block:
    return False
  print(f"Found double chest at {get_world_coordinates(x, y, z)}")
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
  if is_uncovered:
    print(f"Found uncovered shulker box at {get_world_coordinates(x, y, z)}")
  else:
    print(f"Found covered shulker box at {get_world_coordinates(x, y, z)}")
  return is_uncovered


def process_chunk(chunk_x, chunk_z):
  global current_x_chunk, current_z_chunk, found_blocks, found_chests
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
            print("Double chest is uncovered")
            found_chests.append((chunk_x, chunk_z, x, y, z))
          if (SHULKER_BOX_MIN_ID <= block.id <= SHULKER_BOX_MAX_ID and check_is_uncovered_shulker_box(chunk, x, y, z)):
            print("Shulker box is uncovered")
            found_shulker_boxes.append((chunk_x, chunk_z, x, y, z))

  except Exception as e:
    failed_chunks.append((chunk_x, chunk_z))


processed = 0

time_before = time.time()

for chunk_x in range(REGION_SIZE):
  for chunk_z in range(REGION_SIZE):
    process_chunk(chunk_x, chunk_z)
    processed += 1
    if processed % (TOTAL_CHUNKS // PROGRESS_UPDATE_INTERVAL) == 0:
      print(f"Processed {processed}/{TOTAL_CHUNKS} chunks ({(processed / TOTAL_CHUNKS) * 100:.2f}%)")

time_after = time.time()

print(f"Failed to process {len(failed_chunks)} chunks")

# Remove duplicates from found_chests and found_shulker_boxes
found_chests = list(set(found_chests))
found_shulker_boxes = list(set(found_shulker_boxes))

for chest in found_chests:
  print(f"Chest found at coordinates {get_world_coordinates(chest[2], chest[3], chest[4], chest[0], chest[1])}")
if len(found_chests) == 0:
  print("No chests found")

for box in found_shulker_boxes:
  print(f"Shulker box found at coordinates {get_world_coordinates(box[2], box[3], box[4], box[0], box[1])}")
if len(found_shulker_boxes) == 0:
  print("No shulker boxes found")

print(f"Processing completed in {time_after - time_before:.2f} seconds")
