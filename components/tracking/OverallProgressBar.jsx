import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { formatDuration } from '../../utils/format';

function calculateProgress(tasks) {
  const durations = tasks.map((task) => Math.max(0, Number(task?.durationMinutes) || 0));
  const totalMinutes = durations.reduce((sum, minutes) => sum + minutes, 0);
  const countDone = tasks.filter((task) => task?.status === 'DONE').length;
  const countTotal = tasks.length;

  // Tasks with a duration use weighted completion. For tasks with no duration,
  // fall back to item count so the card never remains stuck at zero.
  if (totalMinutes <= 0) {
    return { percent: countTotal ? Math.round((countDone / countTotal) * 100) : 0, totalMinutes };
  }

  const completedMs = tasks.reduce((sum, task, index) => {
    const durationMs = durations[index] * 60000;
    if (task?.status === 'DONE') return sum + durationMs;
    if (task?.status !== 'IN_PROGRESS' || !task?.startedAt) return sum;
    const startedAt = new Date(task.startedAt).getTime();
    if (!Number.isFinite(startedAt)) return sum;
    const elapsedMs = Math.max(0, Math.min(durationMs, Date.now() - startedAt));
    return sum + elapsedMs;
  }, 0);
  const percent = Math.min(100, Math.round((completedMs / (totalMinutes * 60000)) * 100));
  return { percent: countTotal && countDone === countTotal ? 100 : percent, totalMinutes };
}

export default function OverallProgressBar({ tasks = [] }) {
  const { theme } = useTheme();
  const [progress, setProgress] = useState(() => calculateProgress(tasks));

  useEffect(() => {
    const update = () => setProgress(calculateProgress(tasks));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [tasks]);

  return (
    <View className="mb-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-foreground">Overall progress</Text>
        <Text className="text-sm font-bold text-foreground">{progress.percent}%</Text>
      </View>
      <View className="h-2.5 overflow-hidden rounded-full bg-secondary">
        <View
          className="h-full rounded-full"
          style={{ width: `${progress.percent}%`, backgroundColor: progress.percent === 100 ? '#059669' : theme.primary }}
        />
      </View>
      {progress.totalMinutes > 0 && (
        <Text className="mt-2 text-xs text-muted-foreground">
          Estimated task time: {formatDuration(progress.totalMinutes)}
        </Text>
      )}
    </View>
  );
}
