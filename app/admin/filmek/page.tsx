'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function FilmekPage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      const { data, error } = await supabase
        .from('movies')
        .select('*');

      if (error) {
        console.error('Hiba a filmek betöltésekor:', error.message);
      } else {
        setMovies(data || []);
      }
      setLoading(false);
    };

    fetchMovies();
  }, []);

  if (loading) {
    return <div className="p-8 text-white text-center">Filmek betöltése...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6">Filmek</h1>
      {movies.length === 0 ? (
        <p className="text-gray-400">Még nincsenek feltöltött filmek.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <Link key={movie.id} href={`/film/${movie.id}`} className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition">
              {movie.poster_path ? (
                <img 
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                  alt={movie.title} 
                  className="w-full h-72 object-cover"
                />
              ) : (
                <div className="w-full h-72 bg-gray-700 flex items-center justify-center text-gray-400">Nincs kép</div>
              )}
              <div className="p-4">
                <h2 className="font-semibold truncate">{movie.title}</h2>
                <p className="text-sm text-gray-400">{movie.release_year}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}