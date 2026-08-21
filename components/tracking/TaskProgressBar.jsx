import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function TaskProgressBar({ task }) {
  const { theme } = useTheme();
  const [elapsed, setElapsed] = useState(0);

  const duration = task.durationMinutes;
  const isActive =
    task.status === 'IN_PROGRESS' &&
    task.startedAt &&
    duration;

  useEffect(() => {
    if (!isActive) {
      setElapsed(0);
      return;
    }

    const startTime = new Date(task.startedAt).getTime();
    const durationMs = duration * 60 * 1000;

    const update = () => {
      const now = Date.now();
      const diff = Math.min(durationMs, now - startTime);
      setElapsed(diff);
    };

    update();
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [task.status, task.startedAt, duration, isActive]);

  if (!isActive) return null;

  const percent = Math.min(
    100,
    Math.round((elapsed / (duration * 60 * 1000)) * 100)
  );

  const remainingMs = duration * 60 * 1000 - elapsed;
  const remaining = formatMilliseconds(remainingMs);

  return (
    <View className="px-4 pb-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-xs font-medium text-muted-foreground">
          {percent}%
        </Text>

        <Text className="text-xs font-medium text-muted-foreground">
          {remaining} left
        </Text>
      </View>

      <View
        className="h-2 rounded-full overflow-hidden bg-secondary"
      >
        <View
          className="h-full rounded-full"
          style={{
            width: `${percent}%`,
            backgroundColor: theme.primary,
          }}
        />
      </View>
    </View>
  );
}

function formatMilliseconds(ms) {
  if (ms <= 0) return '0m';

  const totalMinutes = Math.round(ms / 60000);
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hrs === 0) return `${mins}m`;

  return `${hrs}h ${mins > 0 ? `${mins}m` : ''}`.trim();
}