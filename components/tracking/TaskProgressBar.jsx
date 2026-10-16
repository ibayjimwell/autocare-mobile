import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Clock3 } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

function timeRemaining(ms) {
  if (ms <= 0) return '0m';
  const minutes = Math.ceil(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest}m`;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export default function TaskProgressBar({ task }) {
  const { theme } = useTheme();
  const [elapsed, setElapsed] = useState(0);
  const duration = Math.max(0, Number(task?.durationMinutes) || 0);
  const startTime = task?.startedAt ? new Date(task.startedAt).getTime() : NaN;
  const active = task?.status === 'IN_PROGRESS' && duration > 0 && Number.isFinite(startTime);

  useEffect(() => {
    if (!active) {
      setElapsed(0);
      return;
    }
    const maximum = duration * 60 * 1000;
    const update = () => {
      const diff = Math.max(0, Math.min(maximum, Date.now() - startTime));
      setElapsed(diff);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [active, duration, startTime]);

  if (!active) return null;

  const durationMs = duration * 60 * 1000;
  const percent = Math.min(100, Math.max(0, Math.round((elapsed / durationMs) * 100)));
  const remaining = timeRemaining(durationMs - elapsed);

  return (
    <View className="mx-4 mt-4 border-t border-border pb-4 pt-3">
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Clock3 size={13} color={theme.primary} />
          <Text className="ml-1.5 text-xs font-medium text-muted-foreground">Time progress</Text>
        </View>
        <Text className="text-xs font-bold text-foreground">{percent}%</Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-secondary">
        <View
          className="h-full rounded-full"
          style={{ width: `${percent}%`, backgroundColor: theme.primary }}
        />
      </View>
      <Text className="mt-2 text-right text-xs text-muted-foreground">{remaining} estimated remaining</Text>
    </View>
  );
}
