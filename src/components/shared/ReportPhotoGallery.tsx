type ReportPhoto = {
  id: string;
  caption?: string | null;
  url: string | null;
};

type ReportPhotoGalleryProps = {
  title: string;
  photos?: ReportPhoto[];
  imageUrl?: string | null;
  maxItems?: number;
};

export function ReportPhotoGallery({ title, photos = [], imageUrl, maxItems }: ReportPhotoGalleryProps) {
  const availablePhotos = photos.filter((photo) => Boolean(photo.url));
  const images = availablePhotos.length > 0
    ? availablePhotos
    : imageUrl
      ? [{ id: "primary", caption: null, url: imageUrl }]
      : [];
  const visibleImages = maxItems ? images.slice(0, maxItems) : images;

  if (visibleImages.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label={`${title} photos`}>
      {visibleImages.map((photo, index) => (
        <figure key={photo.id} className="overflow-hidden rounded-xl bg-slate-950">
          <img
            src={photo.url || undefined}
            alt={photo.caption || `${title} photo ${index + 1}`}
            className="aspect-[4/3] w-full object-cover"
          />
          {photo.caption && <figcaption className="px-2 py-1.5 text-[10px] text-slate-300">{photo.caption}</figcaption>}
        </figure>
      ))}
    </div>
  );
}