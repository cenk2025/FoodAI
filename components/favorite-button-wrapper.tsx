'use client';

import dynamic from 'next/dynamic';

const FavoriteButton = dynamic(() => import('@/components/favorite-button'), { ssr: false });

export default function FavoriteButtonWrapper({ offerId }: { offerId: string }) {
  return <FavoriteButton offerId={offerId} />;
}