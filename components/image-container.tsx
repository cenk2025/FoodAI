// components/image-container.tsx
import SmartImage from '@/components/smart-image';

export default function ImageContainer({ 
  src, 
  alt,
  className = '',
  ...props
}: { 
  src?: string | null; 
  alt: string;
  className?: string;
  [key: string]: any;
}) {
  return (
    <div className={`relative aspect-[4/3] overflow-hidden rounded-3xl ${className}`}>
      <SmartImage
        src={src}
        alt={alt}
        fill
        className="object-cover"
        {...props}
      />
    </div>
  );
}