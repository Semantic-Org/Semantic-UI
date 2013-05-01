value = ((value & 255) << 16) | (value & 65280) | ((value & 16711680) >>> 16)
