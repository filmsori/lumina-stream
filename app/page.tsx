'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Home() {
  const [movies, setMovies] = useState<any[]>([]);
  const [shows, setShows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: moviesData } = await supabase.from('movies').select('*');
        setMovies(moviesData || []);

        let { data: showsData } = await supabase.from('shows').select('*');
        if (!showsData || showsData.length === 0) {
          const res = await supabase.from('series').select('*');
          showsData = res.data;
        }
        setShows(showsData || []);
      } catch (err) {
        console.error('Adatbetöltési hiba:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium tracking-wider">FILMSORI</p>
        </div>
      </div>
    );
  }

  const heroItem = movies[0] || shows[0];
  const rawHeroImage = heroItem ? (heroItem.backdrop_path || heroItem.poster_path || heroItem.image_url || '') : '';
  
  let heroImageUrl = '';
  if (rawHeroImage) {
    if (rawHeroImage.startsWith('http')) {
      heroImageUrl = rawHeroImage;
    } else {
      const cleanPath = rawHeroImage.startsWith('/') ? rawHeroImage : `/${rawHeroImage}`;
      heroImageUrl = `https://image.tmdb.org/t/p/original${cleanPath}`;
    }
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white selection:bg-red-600 selection:text-white pb-24">
      
      <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-b from-black/80 via-black/40 to-transparent px-6 md:px-12 py-4 flex items-center justify-between backdrop-blur-[2px]">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-red-600 font-black text-2xl tracking-wider hover:opacity-90 transition">
            FILMSORI
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
            <Link href="/" className="text-white font-bold">Kezdőlap</Link>
            <Link href="/filmek" className="hover:text-white transition">Filmek</Link>
            <Link href="/sorozatok" className="hover:text-white transition">Sorozatok</Link>
          </div>
        </div>
      </nav>

      {heroItem && (
        <div className="relative w-full h-[65vh] md:h-[75vh] flex items-end pb-16 px-6 md:px-12 overflow-hidden">
          {heroImageUrl && (
            <div className="absolute inset-0 z-0">
              <img 
                src={heroImageUrl} 
                alt={heroItem.title || heroItem.name || 'Banner'} 
                className="w-full h-full object-cover object-center brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-transparent"></div>
            </div>
          )}

          <div className="relative z-10 max-w-2xl space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white drop-shadow-md">
              {heroItem.title || heroItem.name}
            </h1>
            <p className="text-gray-300 text-sm md:text-base line-clamp-3 drop-shadow">
              {heroItem.overview || heroItem.description || 'Fedezd fel ezt a lenyűgöző tartalmat a Filmsorin.'}
            </p>
            <div className="flex items-center gap-4 pt-2">
              <Link 
                href={`/filmek/${heroItem.id}`}
                className="bg-white hover:bg-white/90 text-black font-bold px-6 py-3 rounded-md flex items-center gap-2 transition shadow-lg"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                Lejátszás
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-10 -mt-10 relative z-20">
        {movies.length > 0 && (
          <div className="px-6 md:px-12">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-100 flex items-center justify-between">
              <span>Népszerű Filmek</span>
              <Link href="/filmek" className="text-xs text-red-500 hover:underline">Összes megtekintése</Link>
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
              {movies.map((movie) => (
                <MediaCard key={movie.id} item={movie} type="filmek" />
              ))}
            </div>
          </div>
        )}

        {shows.length > 0 && (
          <div className="px-6 md:px-12">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-100 flex items-center justify-between">
              <span>Népszerű Sorozatok</span>
              <Link href="/sorozatok" className="text-xs text-red-500 hover:underline">Összes megtekintése</Link>
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
              {shows.map((show) => (
                <MediaCard key={show.id} item={show} type="sorozatok" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MediaCard({ item, type }: { item: any; type: 'filmek' | 'sorozatok' }) {
  const rawImage = item?.poster_path || item?.image_url || item?.poster || item?.thumbnail || item?.backdrop_path || '';
  
  let imageUrl = '';
  if (typeof rawImage === 'string' && rawImage.trim() !== '') {
    if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
      imageUrl = rawImage;
    } else {
      const cleanPath = rawImage.startsWith('/') ? rawImage : `/${rawImage}`;
      imageUrl = `https://image.tmdb.org/t/p/w500${cleanPath}`;
    }
  }

  const title = item?.title || item?.name || 'Ismeretlen cím';
  const detailUrl = item?.id ? `/${type}/${item.id}` : '#';

  return (
    <Link 
      href={detailUrl} 
      className="group relative bg-[#181818] rounded-md overflow-hidden flex-shrink-0 w-[200px] md:w-[240px] aspect-[16/9] block transition-transform duration-300 hover:scale-105 hover:z-30 shadow-lg border border-white/5 cursor-pointer"
    >
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-400 text-xs text-center p-2">
          {title}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
        <span className="text-white text-xs font-bold truncate">{title}</span>
      </div>
    </Link>
  );
}