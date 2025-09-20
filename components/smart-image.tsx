'use client';
import Image, {ImageProps} from 'next/image';
import {useState} from 'react';

type Props = Omit<ImageProps,'src'|'alt'> & { src?: string|null; alt: string };
export default function SmartImage({src, alt, ...rest}: Props) {
  const [broken, setBroken] = useState(false);
  const finalSrc = !src || broken ? '/placeholder.svg' : src;
  return (
    <Image
      {...rest}
      src={finalSrc}
      alt={alt}
      onError={()=>setBroken(true)}
    />
  );
}