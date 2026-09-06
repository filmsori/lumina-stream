'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function FilmReszletekPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchMovie = async () => {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Hiba a film lekérdezésekor:', error.message);
      } else {
        setMovie(data);
      }
      setLoading(false);
    };

    fetchMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
        <div className="animate-pulse text-xl text-gray-400">Film betöltése...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-gray-400">A keresett film nem található.</p>
        <Link href="/filmek" className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium">
          Vissza a filmekhez
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Háttér banner */}
      <div className="relative w-full h-[60vh] md:h-[75vh]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/50 to-black/80 z-10" />
        {movie.poster_path ? (
          <img 
            src={`https://image.tmdb.org/t/p/original${movie.poster_path}`} 
            alt={movie.title} 
            className="w-full h-full object-cover object-center filter brightness-75"
          />
        ) : (
          <div className="w-full h-full bg-gray-900" />
        )}

        <div className="absolute top-6 left-6 z-30">
          <button 
            onClick={() => router.back()}
            className="bg-black/60 hover:bg-black text-white px-4 py-2 rounded-lg backdrop-blur-md transition flex items-center gap-2 border border-white/10"
          >
            ← Vissza
          </button>
        </div>

        <div className="absolute bottom-12 left-6 md:left-12 z-20 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">{movie.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-300 mb-6">
            <span className="bg-red-600 text-white px-2.5 py-1 rounded font-bold">HD</span>
            <span>{movie.release_year || '2026'}</span>
          </div>
          <p className="text-gray-300 text-base md:text-lg mb-8 leading-relaxed drop-shadow">
            {movie.description || 'Élvezd ezt a lenyűgöző filmet prémium minőségben, reklámok nélkül a Lumina Stream kínálatában.'}
          </p>
          <button 
            onClick={() => alert('Lejátszás elindítása...')}
            className="bg-white hover:bg-gray-200 text-black font-bold px-8 py-3.5 rounded-lg flex items-center gap-3 transition transform hover:scale-105 shadow-2xl"
          >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            Lejátszás
          </button>
        </div>
      </div>
    </div>
  );
}
