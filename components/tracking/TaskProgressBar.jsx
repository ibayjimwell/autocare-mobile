import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Clock3 } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { getTaskTimeView } from '../../utils/taskTiming';

function formatRemaining(minutes) {
  if (minutes <= 0) return 'Estimated time reached — awaiting staff decision';
  const count = Math.ceil(minutes);
  const hours = Math.floor(count / 60);
  const remaining = count % 60;
  if (!hours) return `${remaining}m estimated remaining`;
  return `${hours}h${remaining ? ` ${remaining}m` : ''} estimated remaining`;
}

/** Existing Mobile task progress bar, synchronized to Web's saved estimate. */
export default function TaskProgressBar({ task }) {
  const { theme } = useTheme();
  const [nowMs, setNowMs] = useState(() => Date.now());
  const status = task?.status;

  useEffect(() => {
    if (status !== 'IN_PROGRESS') return;
    setNowMs(Date.now());
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [status, task?.startedAt]);

  const time = getTaskTimeView(task, nowMs);
  if (status !== 'IN_PROGRESS' || !time.effectiveMinutes || !time.elapsedMinutes && !task?.startedAt) return null;

  const percent = time.progressPercent;
  const remaining = Math.max(0, time.effectiveMinutes - (time.elapsedMinutes ?? 0));

  return (
    <View className="mx-4 mt-4 border-t border-border pb-4 pt-3">
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Clock3 size={13} color={theme.primary} />
          <Text className="ml-1.5 text-xs font-medium text-muted-foreground">
            Estimated time progress
          </Text>
        </View>
        <Text className="text-xs font-bold text-foreground">{percent}%</Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-secondary">
        <View
          className="h-full rounded-full"
          style={{ width: `${percent}%`, backgroundColor: theme.primary }}
        />
      </View>
      <Text className="mt-2 text-right text-xs text-muted-foreground">
        {formatRemaining(remaining)}
        {time.extensionMinutes > 0 ? ` · +${time.extensionMinutes}m extended` : ''}
      </Text>
    </View>
  );
}
