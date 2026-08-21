import { View, Text } from 'react-native';
import {
  Clock3,
  CalendarCheck2,
  ScanSearch,
  FilePenLine,
  Wrench,
  BadgeCheck,
} from 'lucide-react-native';

import { stages } from '../../utils/constants';

/**
 * Dedicated Lucide icon for every tracking stage.
 * The keys correspond directly to utils/constants.js.
 */
const stageIconMap = {
  'clock-outline': Clock3,
  'calendar-check': CalendarCheck2,
  'magnify-scan': ScanSearch,
  'file-document-edit-outline': FilePenLine,
  'wrench-clock': Wrench,
  'check-decagram': BadgeCheck,
};

function StageIcon({ stage, active, current }) {
  const Icon = stageIconMap[stage.icon] || Clock3;

  return (
    <Icon
      size={21}
      color={active ? '#FFFFFF' : '#8E8E93'}
      strokeWidth={current ? 2.4 : 2}
    />
  );
}

export default function ProgressTimeline({ currentStage }) {
  return (
    <View className="mb-8">
      <Text className="text-2xl font-bold tracking-tight text-foreground px-1 mb-3">
        Progress
      </Text>

      <View className="bg-card rounded-xl border border-border overflow-hidden">
        {stages.map((stage, index) => {
          const isActive = index <= currentStage;
          const isCurrent = index === currentStage;
          const isLast = index === stages.length - 1;

          return (
            <View
              key={index}
              className={`ml-4 px-4 py-4 flex-row ${
                !isLast ? 'border-b border-border' : ''
              }`}
            >
              {/* Timeline indicator */}
              <View className="items-center mr-3">
                <View
                  className="w-11 h-11 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: isActive
                      ? '#C1272D'
                      : '#E5E5EA',
                  }}
                >
                  <StageIcon
                    stage={stage}
                    active={isActive}
                    current={isCurrent}
                  />
                </View>

                {!isLast && (
                  <View
                    className="w-0.5 flex-1 mt-2"
                    style={{
                      backgroundColor:
                        index < currentStage
                          ? '#C1272D'
                          : '#E5E5EA',
                    }}
                  />
                )}
              </View>

              {/* Stage content */}
              <View className="flex-1 pt-1">
                <View className="flex-row items-center">
                  <Text
                    className="text-base font-semibold"
                    style={{
                      color: isActive
                        ? '#000000'
                        : '#8E8E93',
                    }}
                  >
                    {stage.name}
                  </Text>

                  {isCurrent && (
                    <View className="ml-2 px-2.5 py-1 rounded-full bg-primary/10">
                      <Text className="text-[10px] font-semibold text-primary">
                        Current
                      </Text>
                    </View>
                  )}
                </View>

                <Text className="text-sm leading-5 text-muted-foreground mt-1">
                  {stage.description}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}