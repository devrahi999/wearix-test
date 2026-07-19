import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WearixBD',
    short_name: 'WearixBD',
    description: 'Online fashion store in Bangladesh',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      { src: '/icon', sizes: '32x32', type: 'image/png' }
    ],
  };
}
