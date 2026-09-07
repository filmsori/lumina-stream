'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function SorozatokPage() {
  const [shows, setShows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('Összes');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchShows = async () => {
      let { data, error } = await supabase.from('shows').select('*');
      if (!data || data.length === 0) {
        const res = await supabase.from('series').select('*');
        data = res.data;
      }
      if (!data || data.length === 0) {
        const res = await supabase.from('movies').select('*');
        data = res.data;
      }

      setShows(data || []);
      setLoading(false);
    };

    fetchShows();
  }, []);

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

  const genres = ['Összes', 'Dráma', 'Vígjáték', 'Sci-Fi', 'krimi', 'Fantasy', 'Animáció'];

  const filteredShows = shows.filter((show) => {
    const title = show.title || show.name || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'Összes' || show.genre === selectedGenre || show.category === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const trendingShows = [...shows].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const recentShows = [...shows].sort((a, b) => {
    const yearA = parseInt(a.release_year || a.year || (a.release_date ? a.release_date.split('-')[0] : 0)) || 0;
    const yearB = parseInt(b.release_year || b.year || (b.release_date ? b.release_date.split('-')[0] : 0)) || 0;
    return yearB - yearA;
  });

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white selection:bg-red-600 selection:text-white pb-24">
      
      {/* Szigorúan balra rögzített navigációs sáv, ami sosem csúszik át */}
      <nav className="bg-[#0b0b0b]/95 backdrop-blur-md sticky top-0 z-50 border-b border-white/5 px-6 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="group cursor-pointer">
            <span className="text-red-600 font-black text-2xl tracking-wider group-hover:opacity-90 transition">
              FILMSORI
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
            <Link href="/" className="hover:text-white transition">Kezdőlap</Link>
            <Link href="/filmek" className="hover:text-white transition">Filmek</Link>
            <Link href="/sorozatok" className="text-white font-bold">Sorozatok</Link>
          </div>
        </div>
      </nav>

      {/* Felső vezérlő sáv (Cím, Kereső, Műfaj szűrők) */}
      <div className="max-w-[1700px] mx-auto px-6 md:px-12 pt-10 pb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Sorozatkalauz</h1>
            <p className="text-gray-400 text-sm mt-1">Fedezd fel a legnépszerűbb sorozatokat és évadokat a Filmsorin.</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <input 
              type="text"
              placeholder="Sorozat keresése..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#181818] text-sm text-white placeholder-gray-500 px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-red-600 transition shadow-inner"
            />
            <svg className="w-4 h-4 text-gray-400 absolute right-4 top-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedGenre === genre 
                  ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] scale-105' 
                  : 'bg-[#181818] text-gray-300 hover:bg-[#252525] border border-white/5'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {searchTerm || selectedGenre !== 'Összes' ? (
        <div className="max-w-[1700px] mx-auto px-6 md:px-12 mt-6">
          <h2 className="text-xl font-bold mb-6 text-gray-200">
            Találatok ({filteredShows.length})
          </h2>
          {filteredShows.length === 0 ? (
            <div className="text-center py-20 bg-[#141414] rounded-2xl border border-white/5 text-gray-400">
              Nincs a szűrésnek megfelelő sorozat.
            </div>
          ) : (
            <ShowGrid shows={filteredShows} />
          )}
        </div>
      ) : (
        <div className="space-y-12 mt-4">
          <ShowRow title="🔥 Népszerű Sorozatok" shows={trendingShows} />
          <ShowRow title="✨ Legfrissebb Évadok" shows={recentShows} />

          <div className="max-w-[1700px] mx-auto px-6 md:px-12 pt-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-100 flex items-center gap-3">
              <span className="w-2 h-6 bg-red-600 rounded-full inline-block"></span>
              Teljes Adatbázis
            </h2>
            <ShowGrid shows={shows} />
          </div>
        </div>
      )}

    </div>
  );
}

function ShowGrid({ shows }: { shows: any[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 md:gap-7">
      {shows.map((show) => (
        <ShowCard key={show.id} show={show} />
      ))}
    </div>
  );
}

function ShowRow({ title, shows }: { title: string; shows: any[] }) {
  if (shows.length === 0) return null;

  return (
    <div className="max-w-[1700px] mx-auto px-6 md:px-12">
      <h2 className="text-xl md:text-2xl font-bold mb-5 text-gray-100 tracking-wide">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 md:gap-6">
        {shows.slice(0, 6).map((show) => (
          <ShowCard key={show.id} show={show} />
        ))}
      </div>
    </div>
  );
}

function ShowCard({ show }: { show: any }) {
  const rawImage = show.poster_path || show.image_url || show.poster || show.thumbnail || '';
  
  let imageUrl = '';
  if (rawImage.startsWith('http')) {
    imageUrl = rawImage;
  } else if (rawImage.startsWith('/')) {
    imageUrl = `https://image.tmdb.org/t/p/w500${rawImage}`;
  } else if (rawImage) {
    imageUrl = `https://image.tmdb.org/t/p/w500/${rawImage}`;
  }

  const title = show.title || show.name || 'Ismeretlen cím';
  
  let year = show.release_year || show.year || '';
  if (!year && show.release_date) {
    year = show.release_date.split('-')[0];
  }

  return (
    <Link 
      href={`/filmek/${show.id}`} 
      className="group relative bg-[#141414] rounded-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] hover:z-30 border border-white/5 flex flex-col"
    >
      <div className="aspect-[2/3] w-full bg-gray-900 relative overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover object-center group-hover:scale-110 transition duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs text-center p-4">
            Nincs poszter
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition duration-300">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            Lejátszás
          </span>
        </div>
      </div>

      <div className="p-3.5 flex flex-col justify-between flex-grow bg-gradient-to-b from-[#161616] to-[#101010]">
        <h3 className="font-semibold text-sm md:text-base truncate text-gray-100 group-hover:text-red-500 transition">
          {title}
        </h3>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
          <span className="bg-white/10 px-2 py-0.5 rounded text-[11px] font-medium">{year}</span>
          <span className="text-red-500 font-semibold tracking-wider text-[10px] uppercase">HD</span>
        </div>
      </div>
    </Link>
  );
}