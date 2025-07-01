from anvil import Region
import sys
import db

# Settings
CHECK_IS_UNCOVERED_DOUBLE_CHEST = True
NON_BLOCKING_BLOCKS = [54, 0]

# General constants
REGION_SIZE = 32
CHUNK_SIZE = 16
SECTION_SIZE = 16

# Region constants
X_REGION = int(sys.argv[1])
Z_REGION = int(sys.argv[2])
REGION_NAME = f"r.{X_REGION}.{Z_REGION}.mca"
FILE_NAME = f"src/mc-regions/{REGION_NAME}"

REGION = Region.from_file(FILE_NAME)

X_REGION_OFFSET = X_REGION * REGION_SIZE * CHUNK_SIZE
Z_REGION_OFFSET = Z_REGION * REGION_SIZE * CHUNK_SIZE

def section_has_chest(section):
  sectionBlocks = set(section["Blocks"])
  if 54 in sectionBlocks:
    return True

def get_chest_sections(chunk):
  found_chest_sections = []
  sections = chunk.data.get("Sections", [])
  for section_index, section in enumerate(sections):
    if section_has_chest(section):
      found_chest_sections.append(section_index)
  return found_chest_sections

def get_chunk_chest_coordinates(chunk, section_index, x_chunk, z_chunk):
  blocks = chunk.data["Sections"][section_index]["Blocks"]
  coordinates = []
  for index, block in enumerate(blocks):
    if block == 54:
      x = (x_chunk * CHUNK_SIZE) + index % CHUNK_SIZE
      z = (z_chunk * CHUNK_SIZE) + (index // CHUNK_SIZE) % CHUNK_SIZE
      y = index // (CHUNK_SIZE * CHUNK_SIZE) + SECTION_SIZE * section_index

      if (not CHECK_IS_UNCOVERED_DOUBLE_CHEST):
        coordinates.append((x, y, z))
        return coordinates

      # Check for uncovered double chest
      is_uncovered_double_chest = False
      neighbors = [
        (-1, 0),  # Left
        (1, 0),   # Right
        (0, -1),  # Front
        (0, 1)    # Back
      ]

      for dx, dz in neighbors:
        neighbor_index = index + dx + dz * CHUNK_SIZE
        if 0 <= neighbor_index < len(blocks) and blocks[neighbor_index] == 54:
          if (
            y + 1 < 256 and
            blocks[index + CHUNK_SIZE * CHUNK_SIZE] in NON_BLOCKING_BLOCKS and
            blocks[neighbor_index + CHUNK_SIZE * CHUNK_SIZE] in NON_BLOCKING_BLOCKS
          ):
            is_uncovered_double_chest = True
            break

      if is_uncovered_double_chest:
        coordinates.append((x, y, z))
        return coordinates

  return coordinates

def get_chunk_chests(chunk_x, chunk_z):
  global REGION
  total_chests = []
  try:
    chunk = REGION.get_chunk(chunk_x, chunk_z)
    found_chest_sections = get_chest_sections(chunk)
    if len(found_chest_sections) == 0:
      return
    for section_index in found_chest_sections:
      chest_coordinates = get_chunk_chest_coordinates(chunk, section_index, chunk_x, chunk_z)
      if len(chest_coordinates) == 0:
        continue
      total_chests.extend([(coord, chunk_x, chunk_z, section_index) for coord in chest_coordinates])
    return total_chests
  except Exception as e:
    if str(e).startswith("Could not find chunk"):
      return
    print(e)
    return
  
def filter_single_chests(chests):
  filtered_chests = []
  for chest in chests:
    if chests.count(chest) == 1:
      filtered_chests.append(chest)
  return filtered_chests
  

def process_region():
  total_chunk_chests= []
  for x in range(REGION_SIZE):
    for z in range(REGION_SIZE):
      chunk_chests = get_chunk_chests(x, z)
      if chunk_chests is None or len(chunk_chests) == 0:
        continue
      total_chunk_chests.append(chunk_chests)
  return total_chunk_chests

local_chest_chunks = process_region()
global_chest_chunks = []

for chest in local_chest_chunks:
  for coord, chunk_x, chunk_z, section_index in chest:
    global_x = X_REGION_OFFSET + coord[0]
    global_z = Z_REGION_OFFSET + coord[2]
    global_y = coord[1]

    section_data = REGION.get_chunk(chunk_x, chunk_z).data["Sections"][section_index]["Blocks"]
    global_chest_chunks.append((global_x, global_y, global_z, section_data))

db.insert_chest_data(global_chest_chunks, REGION_NAME)
