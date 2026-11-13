from PIL import Image
from torchvision import transforms

NORMALIZE = transforms.Normalize(
    [0.485, 0.456, 0.406],
    [0.229, 0.224, 0.225]
)

TRANSFORM = transforms.Compose([
    transforms.ToTensor(),
    NORMALIZE
])

def preprocess_image(image_path, image_size=128):
    image = Image.open(image_path).convert("RGB")

    side = max(image.size)
    background = Image.new("RGB", (side, side))
    background.paste(
        image,
        ((side - image.width) // 2,
         (side - image.height) // 2)
    )

    image = background.resize(
        (image_size, image_size),
        Image.BILINEAR
    )

    return TRANSFORM(image)
