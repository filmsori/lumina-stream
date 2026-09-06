// app/admin/page.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  const [contentType, setContentType] = useState<'movie' | 'series'>('movie');
  const [tmdbId, setTmdbId] = useState('');
  const [seasonNumber, setSeasonNumber] = useState('1');
  const [episodeNumber, setEpisodeNumber] = useState('1');
  const [sourceUrl, setSourceUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Itt állítsd be a saját titkos jelszavadat!
  const ADMIN_PASSWORD = 'Piroska-7788!';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Hibás jelszó!');
    }
  };

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

    try {
      if (contentType === 'movie') {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}&language=hu-HU`);
        if (!res.ok) throw new Error('Nem található film ezen a TMDB ID-n.');
        const data = await res.json();

        const { data: movieData, error: movieError } = await supabase
          .from('movies')
          .upsert({
            tmdb_id: data.id,
            title: data.title,
            overview: data.overview,
            poster_path: data.poster_path,
            backdrop_path: data.backdrop_path,
            vote_average: data.vote_average,
            release_date: data.release_date,
          }, { onConflict: 'tmdb_id' })
          .select()
          .single();

        if (movieError) throw movieError;

        const { error: sourceError } = await supabase
          .from('sources')
          .insert({
            movie_id: movieData.id,
            source_url: sourceUrl,
            language: 'magyar',
          });

        if (sourceError) throw sourceError;
        setMessage('A film és a lejátszási forrás sikeresen mentve!');

      } else {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${apiKey}&language=hu-HU`);
        if (!res.ok) throw new Error('Nem található sorozat ezen a TMDB ID-n.');
        const data = await res.json();

        const { data: seriesData, error: seriesError } = await supabase
          .from('series')
          .upsert({
            tmdb_id: data.id,
            title: data.name,
            overview: data.overview,
            poster_path: data.poster_path,
            backdrop_path: data.backdrop_path,
            vote_average: data.vote_average,
            first_air_date: data.first_air_date,
          }, { onConflict: 'tmdb_id' })
          .select()
          .single();

        if (seriesError) throw seriesError;

        const { error: sourceError } = await supabase
          .from('series_sources')
          .insert({
            series_id: seriesData.id,
            season_number: parseInt(seasonNumber),
            episode_number: parseInt(episodeNumber),
            source_url: sourceUrl,
            language: 'magyar',
          });

        if (sourceError) throw sourceError;
        setMessage('A sorozat epizód és a forrás sikeresen mentve!');
      }

      setTmdbId('');
      setSourceUrl('');
    } catch (err: any) {
      setMessage(`Hiba történt: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Ha még nincs bejelentkezve, csak a jelszóbekérő jelenik meg
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-neutral-900 p-8 rounded-xl border border-neutral-800 w-full max-w-md space-y-4">
          <h1 className="text-xl font-bold text-red-600 mb-2">Admin Belépés</h1>
          <p className="text-sm text-neutral-400 mb-4">Add meg a jelszót az admin felület eléréséhez.</p>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Admin jelszó"
            required
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-600"
          />
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Belépés
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-xl mx-auto bg-neutral-900 p-6 rounded-xl border border-neutral-800">
        <h1 className="text-2xl font-bold mb-6 text-red-600">Admin - Tartalom Feltöltés</h1>

        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => setContentType('movie')}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${contentType === 'movie' ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}
          >
            Film hozzáadása
          </button>
          <button
            type="button"
            onClick={() => setContentType('series')}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${contentType === 'series' ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}
          >
            Sorozat epizód hozzáadása
          </button>
        </div>

        <form onSubmit={handleAddContent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">TMDB ID</label>
            <input
              type="number"
              value={tmdbId}
              onChange={(e) => setTmdbId(e.target.value)}
              required
              placeholder="pl. 1396 (Breaking Bad) vagy film ID"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-600"
            />
          </div>

          {contentType === 'series' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Évad száma</label>
                <input
                  type="number"
                  value={seasonNumber}
                  onChange={(e) => setSeasonNumber(e.target.value)}
                  required
                  min="1"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Epizód száma</label>
                <input
                  type="number"
                  value={episodeNumber}
                  onChange={(e) => setEpisodeNumber(e.target.value)}
                  required
                  min="1"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Videó Forrás URL (pl. Videa embed)</label>
            <input
              type="text"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              required
              placeholder="https://videa.hu/player?v=..."
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Feltöltés folyamatban...' : 'Mentés az adatbázisba'}
          </button>
        </form>

        {message && (
          <p className={`mt-4 p-3 rounded-lg text-sm ${message.includes('Hiba') ? 'bg-red-950 text-red-300' : 'bg-green-950 text-green-300'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}