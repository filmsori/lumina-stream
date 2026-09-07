'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function FilmReszletekPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    if (!id) return;

    const fetchMovie = async () => {
      console.log("Keresett ID:", id);
      
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Hiba a film lekérésekor:', error.message);
      } else {
        setMovie(data);
      }
      setLoading(false);
    };

    fetchMovie();
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

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] text-white flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-gray-300">A film nem található.</h1>
        <Link href="/filmek" className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium">
          Vissza a filmekhez
        </Link>
      </div>
    );
  }

  const rawImage = movie.backdrop_path || movie.poster_path || movie.image_url || '';
  let imageUrl = '';
  if (rawImage) {
    imageUrl = rawImage.startsWith('http') ? rawImage : `https://image.tmdb.org/t/p/original${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white relative pb-20">
      
      {/* Vissza gomb */}
      <div className="absolute top-6 left-6 z-40">
        <button 
          onClick={() => router.back()}
          className="bg-black/60 hover:bg-black/90 text-white px-4 py-2 rounded-lg backdrop-blur-md transition flex items-center gap-2 border border-white/10 text-sm font-medium"
        >
          ← Vissza
        </button>
      </div>

      {/* Fejléc / Banner */}
      <div className="relative w-full h-[60vh] md:h-[70vh] flex items-end">
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt={movie.title || 'Film'} 
            className="absolute inset-0 w-full h-full object-cover brightness-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] via-[#0b0b0b]/40 to-transparent"></div>

        <div className="relative z-10 px-6 md:px-12 pb-10 max-w-4xl space-y-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">{movie.title || movie.name}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded text-xs">HD</span>
            <span>{movie.release_year || movie.year || '2026'}</span>
            <span>{movie.genre || 'Film'}</span>
          </div>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed line-clamp-4">
            {movie.description || movie.overview || 'Élvezd ezt a lenyűgöző filmet prémium minőségben a Filmsorin.'}
          </p>
        </div>
      </div>

      {/* Videó lejátszó szekció */}
      <div className="max-w-6xl mx-auto px-6 mt-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-100 flex items-center gap-2">
          <span className="w-2 h-6 bg-red-600 rounded-full inline-block"></span>
          Lejátszás
        </h2>
        
        <div className="aspect-video w-full bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl relative">
          {movie.video_url || movie.stream_url || movie.videa_url ? (
            <iframe 
              src={movie.video_url || movie.stream_url || movie.videa_url} 
              className="w-full h-full border-0"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-2">
              <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Ehhez a filmhez még nincs beállítva videó forrás.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}