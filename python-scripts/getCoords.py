chestData = [(0, 13, 2, 41, 12), (0, 13, 5, 41, 7), (5, 7, 7, 52, 3), (5, 7, 8, 52, 1), (6, 9, 3, 41, 12), (6, 10, 3, 41, 0), (8, 6, 2, 32, 5), (8, 6, 3, 32, 10), (21, 18, 2, 52, 14), (21, 18, 4, 52, 11), (21, 18, 5, 52, 11)]

x_offset = 0;
z_offset = 0;

worldCoordinates = [
  ((x_chunk * 16) + x + x_offset, y, (y_chunk * 16) + z + z_offset)
  for x_chunk, y_chunk, x, y, z in chestData
]

print(worldCoordinates)

