import { createClient } from '@supabase/supabase-js';
import TvChannelsClient, { type Channel } from './_components/TvChannelsClient';
import { emptyWeekSchedule, type WeekSchedule } from '../../_components/ScheduleGrid';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ChannelRow {
  id: string;
  slug: string;
  name: string;
  type: 'tv' | 'radio';
  stream_url: string | null;
  enabled: boolean;
  tv_channel_schedule: Array<{
    day_of_week: number;
    half_hour_slots: boolean[];
  }> | null;
}

function buildSchedule(rows: ChannelRow['tv_channel_schedule']): WeekSchedule {
  const schedule = emptyWeekSchedule();
  if (!rows) return schedule;
  for (const row of rows) {
    if (row.day_of_week >= 0 && row.day_of_week < 7 && Array.isArray(row.half_hour_slots)) {
      schedule[row.day_of_week] = row.half_hour_slots.slice(0, 48);
      while (schedule[row.day_of_week].length < 48) schedule[row.day_of_week].push(false);
    }
  }
  return schedule;
}

async function fetchChannels(kind: 'tv' | 'radio'): Promise<Channel[]> {
  try {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await db
      .from('tv_channels')
      .select('id, slug, name, type, stream_url, enabled, tv_channel_schedule (day_of_week, half_hour_slots)')
      .eq('type', kind)
      .order('name');

    if (error || !data) return [];

    return (data as ChannelRow[]).map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      type: row.type,
      stream_url: row.stream_url ?? '',
      enabled: row.enabled,
      schedule: buildSchedule(row.tv_channel_schedule),
    }));
  } catch {
    return [];
  }
}

export default async function TvPage() {
  const channels = await fetchChannels('tv');
  return <TvChannelsClient initialChannels={channels} kind="tv" />;
}
