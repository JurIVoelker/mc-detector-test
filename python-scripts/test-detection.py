from anvil import Region

region = Region.from_file("r.0.0.mca")

def getBlockFromCoordinates(x, y, z):
  chunk_x = x // 16
  chunk_z = z // 16
  x_in_chunk = x % 16
  z_in_chunk = z % 16
  chunk = region.get_chunk(chunk_x, chunk_z)
  return chunk.get_block(x_in_chunk, y, z_in_chunk)

block = getBlockFromCoordinates(2, 41, 219)
print(block.id)