// utils/cropImage.ts
export async function getCroppedImg(
  imageSrc: string,
  crop: any,
  rotation = 0
): Promise<string> {
  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get 2D context from canvas.");
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));
  canvas.width = canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);
  ctx.drawImage(
    image,
    (safeArea - image.width) / 2,
    (safeArea - image.height) / 2
  );

  const data = ctx.getImageData(crop.x, crop.y, crop.width, crop.height);

  canvas.width = crop.width;
  canvas.height = crop.height;
  ctx.putImageData(data, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const blobUrl = URL.createObjectURL(blob!);
      resolve(blobUrl);
    }, "image/jpeg");
  });
}
