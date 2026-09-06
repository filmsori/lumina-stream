// app/sorozatok/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function SeriesPage() {
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSeries() {
      const { data, error } = await supabase.from('series').select('*');
      if (!error && data) {
        setSeriesList(data);
      }
      setLoading(false);
    }
    fetchSeries();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Betöltés...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-red-600">Sorozatok</h1>

        {seriesList.length === 0 ? (
          <p className="text-neutral-400">Még nincsenek feltöltött sorozatok.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {seriesList.map((series) => (
              <Link
                key={series.id}
                href={`/sorozatok/${series.id}`}
                className="group bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-red-600 transition duration-300 flex flex-col"
              >
                <div className="aspect-[2/3] relative w-full overflow-hidden bg-neutral-800">
                  {series.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${series.poster_path}`}
                      alt={series.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-neutral-500 text-sm">Nincs kép</div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-grow justify-between">
                  <h2 className="font-semibold text-lg line-clamp-1 group-hover:text-red-500 transition">
                    {series.title}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    {series.first_air_date ? series.first_air_date.split('-')[0] : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}