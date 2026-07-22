// components/tracking/TaskList.jsx
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OverallProgressBar from './OverallProgressBar';
import TaskProgressBar from './TaskProgressBar';
import { useTheme } from '../../context/ThemeContext';

export default function TaskList({ tasks, excludedFindingIds, onToggleExclude, isWaitingForApproval }) {
  const { theme } = useTheme();

  if (tasks.length === 0) {
    return (
      <View className="items-center py-10 rounded-[32px] border-2 border-dashed border-border mb-8">
        <Text className="text-sm font-bold" style={{ color: theme.textSecondary + '80' }}>No tasks yet</Text>
      </View>
    );
  }

  return (
    <View className="mb-8">
      <View className="flex-row justify-between items-center mb-5">
        <Text className="text-xl font-heading font-black" style={{ color: theme.text }}>
          {isWaitingForApproval ? 'Inspection Checklist' : 'Work Tasks'}
        </Text>
        <View className="px-3 py-1 rounded-lg" style={{ backgroundColor: theme.primary + '10' }}>
          <Text className="text-[10px] font-black uppercase" style={{ color: theme.primary }}>{tasks.length} Items</Text>
        </View>
      </View>

      {/* Overall Progress Bar */}
      <View className="mb-6">
        <OverallProgressBar tasks={tasks} />
      </View>

      {tasks.map(task => {
        const findingsToShow = isWaitingForApproval
          ? task.findings?.filter(f => !excludedFindingIds.includes(f.id)) || []
          : task.findings || [];

        const durationText = task.durationMinutes ? `${task.durationMinutes} min` : null;

        return (
          <View key={task.id} className="mb-4 rounded-[24px] border overflow-hidden" style={{ borderColor: theme.border, backgroundColor: theme.background }}>
            <View className="p-5 flex-row justify-between items-center">
              <View className="flex-1 mr-3">
                <Text className="font-black text-sm uppercase tracking-wide" style={{ color: theme.text }}>{task.title}</Text>
                <View className="flex-row items-center mt-1">
                  <View
                    className={`w-2 h-2 rounded-full mr-2 ${
                      task.status === 'IN_PROGRESS' ? 'bg-amber-500' : task.status === 'DONE' ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                  <Text className="text-[10px] font-black uppercase" style={{ color: theme.textSecondary }}>
                    {task.status.replace('_', ' ')}
                  </Text>
                  {durationText && (
                    <Text className="text-[10px] font-bold ml-2" style={{ color: theme.textSecondary }}>
                      • {durationText}
                    </Text>
                  )}
                </View>
              </View>
              {task.status === 'DONE' && <Ionicons name="checkmark-circle" size={24} color="#22c55e" />}
            </View>

            {/* Per‑task live progress bar (only for active tasks with duration) */}
            <TaskProgressBar task={task} />

            {findingsToShow.length > 0 && (
              <View className="px-5 pb-5 pt-2" style={{ backgroundColor: theme.muted + '30' }}>
                {findingsToShow.map(finding => (
                  <View key={finding.id} className="p-4 mb-3 rounded-2xl border" style={{ borderColor: theme.border, backgroundColor: theme.card }}>
                    <View className="flex-row justify-between">
                      <View className="flex-1 pr-4">
                        <Text className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: theme.primary }}>Diagnostic Finding</Text>
                        <Text className="text-xs font-bold leading-5" style={{ color: theme.text }}>{finding.description}</Text>
                        {finding.products?.length > 0 && (
                          <View className="mt-4 pt-3 border-t" style={{ borderTopColor: theme.border }}>
                            {finding.products.map((p, i) => (
                              <View key={i} className="flex-row justify-between mb-1">
                                <Text className="text-[11px] font-medium" style={{ color: theme.textSecondary }}>• {p.quantity}x {p.name}</Text>
                                <Text className="text-[11px] font-black" style={{ color: theme.text }}>₱{parseFloat(p.priceAtTime).toFixed(2)}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                      {isWaitingForApproval && (
                        <TouchableOpacity
                          onPress={() => onToggleExclude(finding.id)}
                          className="h-10 px-4 rounded-xl items-center justify-center border shadow-sm"
                          style={{
                            backgroundColor: excludedFindingIds.includes(finding.id) ? '#22c55e' : '#fff',
                            borderColor: excludedFindingIds.includes(finding.id) ? '#22c55e' : '#EF4444',
                          }}
                        >
                          <Text className="text-[10px] font-black uppercase" style={{ color: excludedFindingIds.includes(finding.id) ? '#fff' : '#EF4444' }}>
                            {excludedFindingIds.includes(finding.id) ? 'Include' : 'Skip Item'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}