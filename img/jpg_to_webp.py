import os
from PIL import Image

def convert_to_webp(source_image_path, output_image_path, max_width=1920, quality=75):
    """
    source_image_path: 原始图片路径
    output_image_path: 转换后的保存路径
    max_width: 图片最大宽度（等比例缩小）
    quality: WebP 质量（0-100）
    """
    # 打开图片
    img = Image.open(source_image_path)

    # 1. 自动旋转（修正手机拍摄角度）
    try:
        from PIL import ImageOps
        img = ImageOps.exif_transpose(img)
    except:
        pass

    # 2. 调整尺寸 (等比例缩小)
    if img.width > max_width:
        height = int(max_width * img.height / img.width)
        img = img.resize((max_width, height), Image.Resampling.LANCZOS)

    # 3. 转换并保存
    img.save(output_image_path, "WEBP", quality=quality)
    print(f"已完成: {source_image_path} -> {output_image_path}")

def batch_convert_to_webp(source_dir, output_dir, max_width=1920, quality=75):
    """
    source_dir: 原始图片目录
    output_dir: 转换后的保存目录
    max_width: 图片最大宽度（等比例缩小）
    quality: WebP 质量（0-100）
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    for filename in os.listdir(source_dir):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            # 打开图片
            img_path = os.path.join(source_dir, filename)
            img = Image.open(img_path)

            # 1. 自动旋转（修正手机拍摄角度）
            try:
                img = Image.open(img_path)
                from PIL import ImageOps
                img = ImageOps.exif_transpose(img)
            except:
                pass

            # 2. 调整尺寸 (等比例缩小)
            if img.width > max_width:
                height = int(max_width * img.height / img.width)
                img = img.resize((max_width, height), Image.Resampling.LANCZOS)

            # 3. 转换并保存
            name_without_ext = os.path.splitext(filename)[0]
            save_path = os.path.join(output_dir, f"{name_without_ext}.webp")
            
            img.save(save_path, "WEBP", quality=quality)
            print(f"已完成: {filename} -> {name_without_ext}.webp")

# 使用示例
if __name__ == "__main__":
    if argv := os.sys.argv:
        if len(argv) == 3:
            source_directory = argv[1]
            output_directory = argv[2]
            batch_convert_to_webp(source_directory, output_directory)
        elif len(argv) == 2:
            source_picture = argv[1]
            output_picture = os.path.splitext(source_picture)[0] + ".webp"
            convert_to_webp(source_picture, output_picture)
        else:
            print("用法: python jpg_to_webp.py <source_dir> <output_dir>")
            print("或: python jpg_to_webp.py <source_image>")