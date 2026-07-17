from PIL import Image

def remove_white(path):
    img = Image.open(path).convert("RGBA")
    data = img.getdata()
    new_data = []
    for item in data:
        # Strict white threshold to prevent removing bright parts of the leaf
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
    img.putdata(new_data)
    img.save(path)

remove_white('frontend/public/leaf1.png')
remove_white('frontend/public/leaf2.png')
remove_white('frontend/public/leaf3.png')
