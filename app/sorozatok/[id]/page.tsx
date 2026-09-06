// app/sorozatok/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SeriesDetailPage() {
  const { id } = useParams();
  const [series, setSeries] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSeriesDetails() {
      // 1. Sorozat adatainak lekérése
      const { data: seriesData, error: seriesError } = await supabase
        .from('series')
        .select('*')
        .eq('id', id)
        .single();

      if (seriesError || !seriesData) {
        setLoading(false);
        return;
      }
      setSeries(seriesData);

      // 2. Epizód források lekérése
      const { data: sourcesData, error: sourcesError } = await supabase
        .from('series_sources')
        .select('*')
        .eq('series_id', id)
        .order('season_number', { ascending: true })
        .order('episode_number', { ascending: true });

      if (!sourcesError && sourcesData) {
        setSources(sourcesData);
        // Alapértelmezésben az első évad első epizódja vagy az első elérhető rész legyen kiválasztva
        if (sourcesData.length > 0) {
          setSelectedSeason(sourcesData[0].season_number);
          setSelectedEpisode(sourcesData[0]);
        }
      }

      setLoading(false);
    }

    if (id) {
      fetchSeriesDetails();
    }
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Betöltés...</div>;
  }

  if (!series) {
    return <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">A sorozat nem található.</div>;
  }

  // Meglévő évadok listájának kinyerése duplikáció nélkül
  const seasons = Array.from(new Set(sources.map((s) => s.season_number)));

  // Az aktuálisan kiválasztott évad epizódjai
  const currentEpisodes = sources.filter((s) => s.season_number === selectedSeason);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Háttérborító látványelem */}
      <div className="relative w-full h-[40vh] lg:h-[50vh] overflow-hidden">
        {series.backdrop_path && (
          <img
            src={`https://image.tmdb.org/t/p/original${series.backdrop_path}`}
            alt={series.title}
            className="w-full h-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
        
        <div className="absolute bottom-8 left-8 right-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-6 items-end">
          <div className="hidden md:block w-40 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-neutral-800 flex-shrink-0">
            <img
              src={`https://image.tmdb.org/t/p/w500${series.poster_path}`}
              alt={series.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-2">{series.title}</h1>
            <p className="text-neutral-300 text-sm md:text-base line-clamp-3 max-w-3xl">{series.overview}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        {/* Lejátszó szekció */}
        {selectedEpisode ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-red-500">
                {selectedSeason}. Évad {selectedEpisode.episode_number}. Epizód
              </h2>
            </div>
            <div className="aspect-video w-full bg-black rounded-xl overflow-hidden border border-neutral-800 shadow-2xl">
              <iframe
                src={selectedEpisode.source_url}
                className="w-full h-full"
                allowFullScreen
                scrolling="no"
              />
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-neutral-900 rounded-xl border border-neutral-800 text-neutral-400">
            Nincs elérhető epizód ehhez a sorozathoz.
          </div>
        )}

        {/* Évad választó fülek (Tabs) */}
        {seasons.length > 0 && (
          <div className="space-y-6">
            <div className="flex gap-2 border-b border-neutral-800 pb-4 overflow-x-auto">
              {seasons.map((season) => (
                <button
                  key={season}
                  onClick={() => {
                    setSelectedSeason(season);
                    // Automatikusan az új évad első epizódját jelöljük ki
                    const firstEpInSeason = sources.find((s) => s.season_number === season);
                    if (firstEpInSeason) setSelectedEpisode(firstEpInSeason);
                  }}
                  className={`px-6 py-2.5 rounded-lg font-medium whitespace-nowrap transition ${
                    selectedSeason === season
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                      : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white border border-neutral-800'
                  }`}
                >
                  {season}. Évad
                </button>
              ))}
            </div>

            {/* Epizódok választó rácsa */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {currentEpisodes.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => setSelectedEpisode(ep)}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between h-24 ${
                    selectedEpisode?.id === ep.id
                      ? 'bg-red-600/10 border-red-600 text-white shadow-md'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-850'
                  }`}
                >
                  <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Epizód</span>
                  <span className="text-lg font-bold">{ep.episode_number}. Rész</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}