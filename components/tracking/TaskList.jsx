import { View, Text, TouchableOpacity } from 'react-native';
import {
  CheckCircle2,
  Circle,
  Clock3,
  Wrench,
} from 'lucide-react-native';

import OverallProgressBar from './OverallProgressBar';
import TaskProgressBar from './TaskProgressBar';
import { useTheme } from '../../context/ThemeContext';

const getStatusPresentation = (status) => {
  switch (status) {
    case 'IN_PROGRESS':
      return {
        icon: Clock3,
        color: '#F59E0B',
        label: 'In progress',
      };

    case 'DONE':
      return {
        icon: CheckCircle2,
        color: '#10B981',
        label: 'Done',
      };

    default:
      return {
        icon: Circle,
        color: '#8E8E93',
        label: 'Waiting',
      };
  }
};

export default function TaskList({
  tasks,
  excludedFindingIds,
  onToggleExclude,
  isWaitingForApproval,
}) {
  const { theme } = useTheme();

  if (tasks.length === 0) {
    return (
      <View className="bg-card rounded-xl border border-border mb-6 px-4 py-10 items-center">
        <View className="w-12 h-12 rounded-full bg-secondary items-center justify-center">
          <Wrench size={22} color="#8E8E93" />
        </View>

        <Text className="mt-3 text-sm font-medium text-muted-foreground">
          No tasks yet
        </Text>
      </View>
    );
  }

  return (
    <View className="mb-6">
      <View className="flex-row items-end justify-between px-1 mb-3">
        <View className="flex-1 pr-3">
          <Text className="text-2xl font-bold tracking-tight text-foreground">
            {isWaitingForApproval
              ? 'Inspection Checklist'
              : 'Work Tasks'}
          </Text>

          <Text className="text-sm text-muted-foreground mt-1">
            {tasks.length} service {tasks.length === 1 ? 'item' : 'items'}
          </Text>
        </View>

        <View className="min-h-[44px] px-3 rounded-xl bg-secondary items-center justify-center">
          <Text className="text-xs font-semibold text-secondary-foreground">
            {tasks.length}
          </Text>
        </View>
      </View>

      <View className="bg-card rounded-xl border border-border overflow-hidden">
        <View className="px-4 pt-4">
          <OverallProgressBar tasks={tasks} />
        </View>

        {tasks.map((task, taskIndex) => {
          const findingsToShow = isWaitingForApproval
            ? task.findings?.filter(
                f => !excludedFindingIds.includes(f.id)
              ) || []
            : task.findings || [];

          const durationText = task.durationMinutes
            ? `${task.durationMinutes} min`
            : null;

          const statusPresentation =
            getStatusPresentation(task.status);

          const StatusIcon = statusPresentation.icon;

          return (
            <View
              key={task.id}
              className={`ml-4 ${taskIndex !== 0 ? 'border-t border-border' : ''}`}
            >
              <View className="px-4 py-4 flex-row items-start">
                <View className="w-11 h-11 rounded-full bg-secondary items-center justify-center mr-3">
                  <StatusIcon
                    size={20}
                    color={statusPresentation.color}
                    strokeWidth={2}
                  />
                </View>

                <View className="flex-1 pr-3">
                  <Text className="text-base font-semibold text-foreground">
                    {task.title}
                  </Text>

                  <View className="flex-row items-center flex-wrap mt-1">
                    <Text
                      className="text-xs font-medium"
                      style={{
                        color: statusPresentation.color,
                      }}
                    >
                      {statusPresentation.label}
                    </Text>

                    {durationText && (
                      <Text className="text-xs text-muted-foreground ml-2">
                        · {durationText}
                      </Text>
                    )}
                  </View>
                </View>

                {task.status === 'DONE' && (
                  <CheckCircle2
                    size={21}
                    color="#10B981"
                    strokeWidth={2}
                  />
                )}
              </View>

              <TaskProgressBar task={task} />

              {findingsToShow.length > 0 && (
                <View className="px-4 pb-4">
                  {findingsToShow.map(finding => (
                    <View
                      key={finding.id}
                      className="bg-background rounded-xl border border-border p-4 mb-3"
                    >
                      <View className="flex-row items-start">
                        <View className="flex-1 pr-3">
                          <Text className="text-xs font-semibold uppercase tracking-wide text-primary">
                            Diagnostic finding
                          </Text>

                          <Text className="text-sm font-medium leading-5 text-foreground mt-1">
                            {finding.description}
                          </Text>

                          {finding.products?.length > 0 && (
                            <View className="mt-4 pt-3 border-t border-border">
                              {finding.products.map((p, i) => (
                                <View
                                  key={i}
                                  className="flex-row items-center justify-between mb-2"
                                >
                                  <Text className="flex-1 text-xs text-muted-foreground pr-2">
                                    {p.quantity}x {p.name}
                                  </Text>

                                  <Text className="text-xs font-semibold text-foreground">
                                    ₱{parseFloat(
                                      p.priceAtTime
                                    ).toFixed(2)}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>

                        {isWaitingForApproval && (
                          <TouchableOpacity
                            onPress={() =>
                              onToggleExclude(finding.id)
                            }
                            activeOpacity={0.8}
                            className="min-h-[44px] px-3 rounded-lg items-center justify-center border"
                            style={{
                              backgroundColor:
                                excludedFindingIds.includes(finding.id)
                                  ? '#10B981'
                                  : '#FFFFFF',
                              borderColor:
                                excludedFindingIds.includes(finding.id)
                                  ? '#10B981'
                                  : '#C1272D',
                            }}
                          >
                            <Text
                              className="text-xs font-semibold"
                              style={{
                                color:
                                  excludedFindingIds.includes(finding.id)
                                    ? '#FFFFFF'
                                    : '#C1272D',
                              }}
                            >
                              {excludedFindingIds.includes(finding.id)
                                ? 'Include'
                                : 'Skip'}
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
    </View>
  );
}