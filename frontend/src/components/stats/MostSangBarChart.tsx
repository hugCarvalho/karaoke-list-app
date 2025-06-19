import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Song } from '../../config/interfaces';

interface SongPlayData {
  title: string;
  plays: number;
}
const topCount = 10;

interface CustomYAxisTickProps {
  x: number;
  y: number;
  payload: {
    value: string; // This will be the song title
    offset: number;
    // ... other tick properties
  };
}
// --- Configuration for multi-line ticks ---
const MAX_CHARS_PER_LINE = 11;
const LINE_HEIGHT_OFFSET = 12; // Adjust this to control vertical spacing between lines (e.g., fontSize + some padding)

const CustomYAxisTick = ({ x, y, payload }: CustomYAxisTickProps) => {
  const songTitle = payload.value;
  let currentLine = '';
  const lines: string[] = [];
  const words = songTitle.split(' ');

  // Logic to split the title into multiple lines
  words.forEach((word) => {
    // If adding the current word makes the line too long and the line isn't empty,
    // push the current line and start a new one with the current word.
    if ((currentLine + (currentLine === '' ? '' : ' ') + word).length > MAX_CHARS_PER_LINE && currentLine !== '') {
      lines.push(currentLine);
      currentLine = word; // Start the new line with the current word
    } else {
      // Otherwise, add the word to the current line
      currentLine += (currentLine === '' ? '' : ' ') + word;
    }
  });

  // Push the very last line if it has content
  if (currentLine !== '') {
    lines.push(currentLine);
  }

  // Calculate the vertical offset for the entire multi-line text block
  // This helps center the block vertically around the Y-axis tick mark
  const offsetY = -(lines.length - 1.5) * LINE_HEIGHT_OFFSET / 2;

  return (
    <text
      x={x}
      y={y + offsetY} // Apply the calculated offset to the main text element's Y position
      dx={0} // Adjust horizontal position (negative moves left)
      fill="#F0F0F0"
      fontSize={13}
      fontWeight="bold"
      textAnchor="end" // Aligns text to the right, useful when dx is negative
    >
      {lines.map((line, index) => (
        <tspan
          key={index}
          x={x} // Set x attribute on tspan for each line to align them
          dy={index === 0 ? 0 : LINE_HEIGHT_OFFSET} // dy is relative to previous line's end
        >
          {line}
        </tspan>
      ))}
    </text>
  );
};


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
        <YAxis
          type="category"
          dataKey="title"
          tick={CustomYAxisTick}
        />
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
