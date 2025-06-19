import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Song } from '../../config/interfaces';

interface SongPlayData {
  title: string;
  plays: number;
}
const topCount = 10;

const MostSangBarChart = ({ data }: { data: Song[] }) => {

  const mostSangData: SongPlayData[] = useMemo(() => {
    if (!data) return [];
    const songPlays: { [title: string]: number } = {};
    data.forEach((song) => {
      songPlays[song.title] = (songPlays[song.title] || 0) + song.plays;
    });
    return Object.entries(songPlays)
      .sort(([, a], [, b]) => b - a)
      .slice(0, topCount)
      .map(([title, plays]) => ({ title, plays }));
  }, [data, topCount]);

  return (
    <ResponsiveContainer width="100%" maxHeight={500}>
      <BarChart
        data={mostSangData}
        margin={{ top: 10, right: 0, left: 20, bottom: 5 }}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" label={{ value: 'Plays', position: 'bottom' }} />
        <YAxis type="category" dataKey="title" />
        <Tooltip
          contentStyle={{ borderRadius: 15 }}
          labelStyle={{ color: "black", fontWeight: "bold" }}
          itemStyle={{ paddingTop: '0px', paddingBottom: '2px', margin: 0, borderRadius: 10 }}
          wrapperStyle={{ padding: '12px' }}
        />
        <Bar dataKey="plays" fill="#ff7300" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MostSangBarChart;
