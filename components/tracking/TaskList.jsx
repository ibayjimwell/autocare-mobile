import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CheckCircle2,
  Circle,
  Clock3,
  ClipboardList,
  FileText,
  Package,
  Settings,
  Wrench,
} from 'lucide-react-native';

import OverallProgressBar from './OverallProgressBar';
import TaskProgressBar from './TaskProgressBar';
import { formatDuration } from '../../utils/format';

const STATUS = {
  PENDING: {
    label: 'Waiting',
    color: '#71717A',
    background: '#F4F4F5',
    border: '#E4E4E7',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: '#C1272D',
    background: '#FFF1F2',
    border: '#FBC5C8',
  },
  DONE: {
    label: 'Completed',
    color: '#059669',
    background: '#ECFDF5',
    border: '#A7F3D0',
  },
};

/**
 * Animated native-driver rotation only while a task is IN_PROGRESS.
 * A child component owns the hooks; nothing is called inside .map().
 */
function TaskStatusIcon({ status }) {
  const progress = useRef(new Animated.Value(0)).current;
  const active = status === 'IN_PROGRESS';

  useEffect(() => {
    if (!active) {
      progress.stopAnimation();
      progress.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 2400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => {
      loop.stop();
      progress.setValue(0);
    };
  }, [active, progress]);

  if (status === 'DONE') {
    return <CheckCircle2 size={22} color="#059669" strokeWidth={2.1} />;
  }
  if (active) {
    return (
      <Animated.View
        style={{
          transform: [{
            rotate: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            }),
          }],
        }}
      >
        <Settings size={23} color="#C1272D" strokeWidth={2} />
      </Animated.View>
    );
  }
  return <Circle size={22} color="#71717A" strokeWidth={2} />;
}

function TaskItem({ task, order, isWaitingForApproval, excludedFindingIds, onToggleExclude }) {
  const status = STATUS[task?.status] || STATUS.PENDING;
  const findings = Array.isArray(task?.findings) ? task.findings : [];
  const visibleFindings = isWaitingForApproval
    ? findings.filter((finding) => !excludedFindingIds.includes(finding.id))
    : findings;
  const duration = Number(task?.durationMinutes) || 0;
  const productsPrice = (price) => {
    const numeric = Number(price);
    return Number.isFinite(numeric)
      ? numeric.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '0.00';
  };

  return (
    <View className="mb-3 overflow-hidden rounded-2xl border border-border bg-card">
      <View className="px-4 pt-4">
        <View className="flex-row items-start">
          <View
            className="mr-3 h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: status.background, borderWidth: 1, borderColor: status.border }}
          >
            <TaskStatusIcon status={task?.status} />
          </View>

          <View className="min-w-0 flex-1">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Task {String(order).padStart(2, '0')}
            </Text>
            <Text className="mt-1 text-base font-bold leading-6 text-foreground">
              {task?.title || 'Untitled task'}
            </Text>
            <View className="mt-2 flex-row flex-wrap items-center" style={{ gap: 7 }}>
              <View
                className="rounded-full border px-2.5 py-1"
                style={{ backgroundColor: status.background, borderColor: status.border }}
              >
                <Text className="text-[11px] font-semibold" style={{ color: status.color }}>
                  {status.label}
                </Text>
              </View>
              {duration > 0 && (
                <View className="flex-row items-center rounded-full bg-secondary px-2.5 py-1">
                  <Clock3 size={12} color="#71717A" />
                  <Text className="ml-1 text-[11px] font-medium text-muted-foreground">
                    {formatDuration(duration)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {task?.status === 'DONE' && (
            <CheckCircle2 size={19} color="#059669" />
          )}
        </View>
      </View>

      <TaskProgressBar task={task} />

      {visibleFindings.length > 0 && (
        <View className="mx-4 mb-4 mt-3 border-t border-border pt-3">
          <View className="mb-2 flex-row items-center">
            <FileText size={14} color="#C1272D" />
            <Text className="ml-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Diagnostic findings ({visibleFindings.length})
            </Text>
          </View>
          {visibleFindings.map((finding, findingIndex) => (
            <View
              key={finding?.id || `finding-${findingIndex}`}
              className="mb-2 rounded-xl border border-border bg-background p-3.5"
            >
              <Text className="text-sm font-medium leading-5 text-foreground">
                {finding?.description || 'Diagnostic finding'}
              </Text>
              {Array.isArray(finding?.products) && finding.products.length > 0 && (
                <View className="mt-3 border-t border-border pt-2">
                  <View className="mb-2 flex-row items-center">
                    <Package size={13} color="#71717A" />
                    <Text className="ml-1.5 text-[11px] font-semibold text-muted-foreground">Related parts</Text>
                  </View>
                  {finding.products.map((product, index) => (
                    <View key={product?.id || index} className="mb-2 flex-row items-start justify-between">
                      <Text className="flex-1 pr-3 text-xs leading-5 text-muted-foreground">
                        {product?.quantity ?? 1}x {product?.name || 'Part'}
                      </Text>
                      <Text className="text-xs font-bold text-foreground">
                        ₱{productsPrice(product?.priceAtTime)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              {isWaitingForApproval && typeof onToggleExclude === 'function' && (
                <TouchableOpacity
                  onPress={() => onToggleExclude(finding.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Skip finding: ${finding?.description || 'Finding'}`}
                  activeOpacity={0.8}
                  className="mt-2 min-h-[44px] items-center justify-center rounded-lg border border-primary bg-card px-4"
                >
                  <Text className="text-sm font-bold text-primary">Skip finding</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}

      {isWaitingForApproval && findings.length > visibleFindings.length && (
        <View className="mx-4 mb-4 rounded-xl bg-secondary px-3 py-3">
          <Text className="mb-1 text-xs text-muted-foreground">
            {findings.length - visibleFindings.length} finding(s) excluded
          </Text>
          {findings.filter((finding) => excludedFindingIds.includes(finding.id)).map((finding) => (
            <TouchableOpacity
              key={finding.id}
              onPress={() => onToggleExclude?.(finding.id)}
              accessibilityRole="button"
              className="min-h-[44px] flex-row items-center justify-between"
            >
              <Text className="flex-1 pr-2 text-xs text-foreground" numberOfLines={2}>
                {finding.description || 'Finding'}
              </Text>
              <Text className="text-xs font-bold text-primary">Include</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function TaskList({
  tasks = [],
  excludedFindingIds = [],
  onToggleExclude,
  isWaitingForApproval = false,
}) {
  const allTasks = Array.isArray(tasks) ? tasks : [];
  const excluded = Array.isArray(excludedFindingIds) ? excludedFindingIds : [];
  const counts = useMemo(() => ({
    completed: allTasks.filter((task) => task?.status === 'DONE').length,
    active: allTasks.filter((task) => task?.status === 'IN_PROGRESS').length,
  }), [allTasks]);

  if (allTasks.length === 0) {
    return (
      <View className="mb-6 items-center rounded-2xl border border-border bg-card px-5 py-10">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
          <ClipboardList size={26} color="#71717A" />
        </View>
        <Text className="mt-4 text-base font-bold text-foreground">No tasks yet</Text>
        <Text className="mt-1 text-center text-sm text-muted-foreground">
          Tasks will appear here as your service progresses.
        </Text>
      </View>
    );
  }

  return (
    <View className="mb-7">
      <View className="mb-3 flex-row items-center justify-between px-1">
        <View className="flex-1 pr-3">
          <Text className="text-xl font-bold tracking-tight text-foreground">
            {isWaitingForApproval ? 'Inspection Checklist' : 'Service Tasks'}
          </Text>
          <Text className="mt-1 text-xs text-muted-foreground">
            {counts.completed} of {allTasks.length} completed
            {counts.active ? ` · ${counts.active} in progress` : ''}
          </Text>
        </View>
        <View className="h-10 min-w-10 items-center justify-center rounded-xl bg-secondary px-3">
          <Wrench size={17} color="#C1272D" />
        </View>
      </View>

      <View className="mb-3 rounded-2xl border border-border bg-card px-4 pt-4">
        <OverallProgressBar tasks={allTasks} />
      </View>

      {allTasks.map((task, index) => (
        <TaskItem
          key={task?.id || `task-${index}`}
          task={task}
          order={index + 1}
          isWaitingForApproval={isWaitingForApproval}
          excludedFindingIds={excluded}
          onToggleExclude={onToggleExclude}
        />
      ))}
    </View>
  );
}
