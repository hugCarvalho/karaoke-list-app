export const formatToGermanDate = (eventDate: string | null) => {
  if (!eventDate) return '';
  const date = new Date(eventDate);
  const formatter = new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return formatter.format(date);
}
