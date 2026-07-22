// components/tracking/OverallProgressBar.jsx
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function OverallProgressBar({ tasks }) {
  const { theme } = useTheme();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const totalDuration = tasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
      if (totalDuration === 0) {
        setProgress(0);
        return;
      }

      const completedMs = tasks.reduce((sum, t) => {
        if (t.status === 'DONE') return sum + (t.durationMinutes || 0) * 60 * 1000;
        if (t.status === 'IN_PROGRESS' && t.startedAt) {
          const elapsed = Math.min(
            (t.durationMinutes || 0) * 60 * 1000,
            Date.now() - new Date(t.startedAt).getTime()
          );
          return sum + elapsed;
        }
        return sum;
      }, 0);

      const totalMs = totalDuration * 60 * 1000;
      setProgress(Math.min(100, Math.round((completedMs / totalMs) * 100)));
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks]);

  return (
    <View className="mb-2">
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-xs font-bold" style={{ color: theme.textSecondary }}>
          Overall Progress
        </Text>
        <Text className="text-xs font-bold" style={{ color: theme.textSecondary }}>
          {progress}%
        </Text>
      </View>
      <View
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: theme.border }}
      >
        <View
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            backgroundColor: progress === 100 ? '#10b981' : theme.primary,
          }}
        />
      </View>
    </View>
  );
}