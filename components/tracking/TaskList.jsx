// components/tracking/TaskList.jsx
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TaskList({ tasks, excludedFindingIds, onToggleExclude, isWaitingForApproval }) {
  if (tasks.length === 0) {
    return (
      <View className="items-center py-10 rounded-[32px] border-2 border-dashed border-border mb-8">
        <Text className="text-sm font-bold text-muted-foreground/50">No tasks yet</Text>
      </View>
    );
  }

  return (
    <View className="mb-8">
      <View className="flex-row justify-between items-center mb-5">
        <Text className="text-xl font-heading font-black text-foreground">
          {isWaitingForApproval ? 'Inspection Checklist' : 'Work Tasks'}
        </Text>
        <View className="px-3 py-1 rounded-lg bg-primary/10">
          <Text className="text-[10px] font-black uppercase text-primary">{tasks.length} Items</Text>
        </View>
      </View>

      {tasks.map(task => {
        // Show all tasks – including DONE ones
        const findingsToShow = isWaitingForApproval
          ? task.findings?.filter(f => !excludedFindingIds.includes(f.id)) || []
          : task.findings || [];

        return (
          <View key={task.id} className="mb-4 rounded-[24px] border border-border bg-card overflow-hidden">
            <View className="p-5 flex-row justify-between items-center">
              <View className="flex-1 mr-3">
                <Text className="font-black text-sm uppercase tracking-wide text-foreground">{task.title}</Text>
                <View className="flex-row items-center mt-1">
                  <View
                    className={`w-2 h-2 rounded-full mr-2 ${
                      task.status === 'IN_PROGRESS' ? 'bg-amber-500' : task.status === 'DONE' ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                  <Text className="text-[10px] font-black uppercase text-foreground/60">
                    {task.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>
              {task.status === 'DONE' && <Ionicons name="checkmark-circle" size={24} color="#22c55e" />}
            </View>

            {findingsToShow.length > 0 && (
              <View className="px-5 pb-5 pt-2 bg-muted/30">
                {findingsToShow.map(finding => (
                  <View key={finding.id} className="p-4 mb-3 rounded-2xl border border-border bg-card">
                    <View className="flex-row justify-between">
                      <View className="flex-1 pr-4">
                        <Text className="text-[10px] font-black uppercase tracking-widest mb-1 text-primary">Diagnostic Finding</Text>
                        <Text className="text-xs font-bold leading-5 text-foreground">{finding.description}</Text>
                        {finding.products?.length > 0 && (
                          <View className="mt-4 pt-3 border-t border-border">
                            {finding.products.map((p, i) => (
                              <View key={i} className="flex-row justify-between mb-1">
                                <Text className="text-[11px] font-medium text-foreground/60">• {p.quantity}x {p.name}</Text>
                                <Text className="text-[11px] font-black text-foreground">₱{parseFloat(p.priceAtTime).toFixed(2)}</Text>
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