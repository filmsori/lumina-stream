'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function SorozatReszletekPage() {
  const params = useParams();
  const router = useRouter();
  
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [show, setShow] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchShow = async () => {
      // Megpróbáljuk lekérni a 'shows' táblából, ha nincs, a 'series' táblából
      let { data, error } = await supabase
        .from('shows')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!data) {
        const res = await supabase
          .from('series')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        data = res.data;
      }

      setShow(data);
      setLoading(false);
    };

    fetchShow();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium tracking-wider">FILMSORI</p>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] text-white flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-gray-300">A sorozat nem található az adatbázisban.</h1>
        <Link href="/" className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium">
          Vissza a főoldalra
        </Link>
      </div>
    );
  }

  const rawImage = show.backdrop_path || show.poster_path || show.image_url || '';
  let imageUrl = '';
  if (rawImage) {
    imageUrl = rawImage.startsWith('http') ? rawImage : `https://image.tmdb.org/t/p/original${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white relative pb-20">
      
      <div className="absolute top-6 left-6 z-40">
        <button 
          onClick={() => router.back()}
          className="bg-black/60 hover:bg-black/90 text-white px-4 py-2 rounded-lg backdrop-blur-md transition flex items-center gap-2 border border-white/10 text-sm font-medium cursor-pointer"
        >
          ← Vissza
        </button>
      </div>

      <div className="relative w-full h-[60vh] md:h-[70vh] flex items-end">
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt={show.title || show.name || 'Sorozat'} 
            className="absolute inset-0 w-full h-full object-cover brightness-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] via-[#0b0b0b]/40 to-transparent"></div>

        <div className="relative z-10 px-6 md:px-12 pb-10 max-w-4xl space-y-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">{show.title || show.name}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded text-xs">SOROZAT</span>
            <span>{show.release_year || show.year || '2026'}</span>
          </div>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed line-clamp-4">
            {show.description || show.overview || 'Élvezd ezt a lenyűgöző sorozatot prémium minőségben a Filmsorin.'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-6 pb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-100 flex items-center gap-2">
          <span className="w-2 h-6 bg-red-600 rounded-full inline-block"></span>
          Lejátszás
        </h2>
        
        <div className="aspect-video w-full bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl relative">
          {(show.video_url || show.stream_url || show.videa_url || show.url) ? (
            <iframe 
              src={show.video_url || show.stream_url || show.videa_url || show.url} 
              className="w-full h-full border-0 absolute inset-0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            ></iframe>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-2">
              <p>Ehhez a sorozathoz még nincs beállítva videó forrás az adatbázisban.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}