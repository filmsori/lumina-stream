'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';


interface Movie {
  id: number;
  tmdb_id: number;
  title: string;
  tagline: string;
  overview: string;
  rating: number;
  release_year: string;
  duration: string;
  poster_path: string;
  backdrop_path: string;
}

interface Source {
  id: number;
  movie_id: number;
  server_name: string;
  embed_url: string;
  language: string;
}

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [activeEmbed, setActiveEmbed] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    const { data: moviesData } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false });

    if (moviesData && moviesData.length > 0) {
      setMovies(moviesData);
      selectMovie(moviesData[0]);
    }
    setLoading(false);
  };

  const selectMovie = async (movie: Movie) => {
    setFeaturedMovie(movie);
    setActiveEmbed(null);

    const { data: sourcesData } = await supabase
      .from('sources')
      .select('*')
      .eq('movie_id', movie.id);

    if (sourcesData) {
      setSources(sourcesData);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex justify-center items-center font-sans">
        <p className="text-xl font-bold animate-pulse">Filmsori betöltése...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-red-600 selection:text-white">
     {/* Fejléc */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-8">
          <span className="text-2xl font-black italic tracking-wider text-red-600 uppercase">
            Filmsori
          </span>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-300 relative z-50">
            <button onClick={() => window.location.href = '/'} className="text-white hover:text-red-500 transition cursor-pointer">Főoldal</button>
            <button onClick={() => window.location.href = '/filmek'} className="hover:text-red-500 transition cursor-pointer">Filmek</button>
            <button onClick={() => window.location.href = '/sorozatok'} className="hover:text-red-500 transition cursor-pointer">Sorozatok</button>
          </nav>
        </div>
      </header>

      {/* Hero Kiemelt Film */}
      {featuredMovie && (
        <section className="relative w-full min-h-[80vh] flex items-end justify-start pt-28 pb-16 px-8 md:px-16 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 -z-10"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(10,10,10,0.95) 20%, rgba(10,10,10,0.4) 60%, rgba(10,10,10,0.8) 100%), linear-gradient(to top, rgba(10,10,10,1) 0%, transparent 50%), url(${featuredMovie.backdrop_path})`,
            }}
          />

          <div className="max-w-2xl space-y-4 z-10 w-full">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              {featuredMovie.title}
            </h1>

            {featuredMovie.tagline && (
              <p className="italic text-gray-400 text-sm md:text-base">
                "{featuredMovie.tagline}"
              </p>
            )}

            <div className="flex items-center gap-3 text-sm font-semibold">
              <span className="bg-emerald-600/90 text-white px-2 py-0.5 rounded text-xs">
                ★ {featuredMovie.rating}
              </span>
              <span className="text-gray-300">{featuredMovie.release_year}</span>
              <span className="text-gray-400 border border-neutral-700 px-2 py-0.5 rounded text-xs">
                {featuredMovie.duration}
              </span>
            </div>

            <p className="text-gray-300 text-sm md:text-base line-clamp-3 leading-relaxed">
              {featuredMovie.overview || 'Nincs elérhető leírás ehhez a filmhez.'}
            </p>

            {activeEmbed && (
              <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-neutral-800 bg-black mt-4">
                <iframe
                  src={activeEmbed}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              {sources.length > 0 ? (
                sources.map((src) => (
                  <button
                    key={src.id}
                    onClick={() => setActiveEmbed(src.embed_url)}
                    className="bg-white hover:bg-gray-200 text-black px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg transition active:scale-95"
                  >
                    <span>▶</span> Lejátszás ({src.server_name})
                  </button>
                ))
              ) : (
                <button disabled className="bg-neutral-800 text-gray-500 px-6 py-2.5 rounded-lg font-bold cursor-not-allowed">
                  Nincs elérhető lejátszó
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Filmkártyák */}
      <section className="px-8 md:px-16 py-8 space-y-6">
        <h2 className="text-xl font-bold tracking-wide text-gray-200">
          Legfrissebb Filmek
        </h2>

        {movies.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Még nincsenek feltöltött filmek. Lépj be a{' '}
            <a href="/admin" className="text-red-500 underline">
              /admin
            </a>{' '}
            oldalra az első film hozzáadásához!
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movies.map((movie) => (
              <div
                key={movie.id}
                onClick={() => selectMovie(movie)}
                className={`group relative aspect-[2/3] rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800 cursor-pointer transition-all duration-300 hover:scale-105 hover:z-20 hover:border-red-600 ${
                  featuredMovie?.id === movie.id ? 'ring-2 ring-red-600' : ''
                }`}
              >
                <img
                  src={movie.poster_path}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                  <p className="text-sm font-bold text-white leading-tight">
                    {movie.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}