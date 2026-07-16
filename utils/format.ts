export function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatPrice(price?: number | string) {
  if (price === null || price === undefined) return '';
  return `₱${Number(price).toLocaleString()}`;
}

export function formatDuration(minutes?: number) {
  if (!minutes) return '';
  if (minutes >= 60) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs} hour${hrs > 1 ? 's' : ''}`;
  }
  return `${minutes} mins`;
}

export function formatTime(timeStr: string | undefined) {
  return timeStr?.slice(0, 5) || '';
}

export function formatTime12h(time24: string | undefined) {
  if (!time24) return '';
  const [hour, minute] = time24.split(':');
  let h = parseInt(hour, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${minute} ${ampm}`;
}

export function dateToTimeString(date: Date) {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:00`;
}