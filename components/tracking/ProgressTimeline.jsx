
import React from 'react';
import {
  ScrollView,
  View,
  Text,
} from 'react-native';

import {
  Clock3,
  CalendarCheck2,
  ScanSearch,
  FilePenLine,
  Wrench,
  BadgeCheck,
} from 'lucide-react-native';

import { stages } from '../../utils/constants';

const stageIconMap = {
  'clock-outline': Clock3,
  'calendar-check': CalendarCheck2,
  'magnify-scan': ScanSearch,
  'file-document-edit-outline': FilePenLine,
  'wrench-clock': Wrench,
  'check-decagram': BadgeCheck,
};

const ACTIVE_COLOR = '#C1272D';
const INACTIVE_COLOR = '#C6C6C8';
const ICON_SIZE = 21;
const STEP_WIDTH = 108;
const CONNECTOR_WIDTH = 24;

function StageIcon({ stage, active, current }) {
  const Icon = stageIconMap[stage.icon] || Clock3;

  return (
    <Icon
      size={ICON_SIZE}
      color={active ? '#FFFFFF' : '#8E8E93'}
      strokeWidth={current ? 2.4 : 2}
    />
  );
}

export default function ProgressTimeline({ currentStage }) {
  const safeCurrentStage = Math.max(
    0,
    Math.min(
      stages.length - 1,
      Number.isFinite(Number(currentStage))
        ? Math.trunc(Number(currentStage))
        : 0
    )
  );

  const current = stages[safeCurrentStage];

  return (
    <View className="mb-6">
      {/* SECTION HEADER */}
      <View className="mb-3 flex-row items-center justify-between px-1">
        <Text className="text-2xl font-bold tracking-tight text-foreground">
          Progress
        </Text>

        <Text className="text-xs font-semibold tabular-nums text-muted-foreground">
          {safeCurrentStage + 1} of {stages.length} stages
        </Text>
      </View>

      {/* HORIZONTAL TIMELINE */}
      <View className="overflow-hidden rounded-xl border border-border bg-card py-4">
        <ScrollView
          horizontal
          nestedScrollEnabled
          directionalLockEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: 'flex-start',
            paddingHorizontal: 16,
          }}
          accessibilityLabel="Appointment progress stages"
        >
          <View className="flex-row items-start">
            {stages.map((stage, index) => {
              const isActive = index <= safeCurrentStage;
              const isCurrent = index === safeCurrentStage;
              const isLast = index === stages.length - 1;

              return (
                <React.Fragment key={`${stage.name}-${index}`}>
                  {/* STAGE NODE */}
                  <View
                    style={{ width: STEP_WIDTH }}
                    className="items-center"
                    accessibilityLabel={`${stage.name}${isCurrent ? ', current stage' : isActive ? ', completed stage' : ', upcoming stage'}`}
                  >
                    <View
                      className="h-11 w-11 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: isActive
                          ? ACTIVE_COLOR
                          : '#E5E5EA',
                        borderWidth: isCurrent ? 3 : 0,
                        borderColor: isCurrent
                          ? 'rgba(193, 39, 45, 0.20)'
                          : 'transparent',
                      }}
                    >
                      <StageIcon
                        stage={stage}
                        active={isActive}
                        current={isCurrent}
                      />
                    </View>

                    <Text
                      numberOfLines={2}
                      className="mt-2 min-h-[32px] w-full px-1 text-center text-xs font-semibold leading-4"
                      style={{
                        color: isActive
                          ? '#000000'
                          : '#8E8E93',
                      }}
                    >
                      {stage.name}
                    </Text>

                    {isCurrent ? (
                      <View className="mt-1 rounded-full bg-primary/10 px-2.5 py-1">
                        <Text className="text-[10px] font-semibold text-primary">
                          Current
                        </Text>
                      </View>
                    ) : isActive ? (
                      <Text className="mt-1 text-[10px] font-medium text-muted-foreground">
                        Completed
                      </Text>
                    ) : (
                      <Text className="mt-1 text-[10px] font-medium text-muted-foreground">
                        Upcoming
                      </Text>
                    )}
                  </View>

                  {/* HORIZONTAL CONNECTOR */}
                  {!isLast && (
                    <View
                      style={{
                        width: CONNECTOR_WIDTH,
                        height: 3,
                        marginTop: 21,
                        backgroundColor:
                          index < safeCurrentStage
                            ? ACTIVE_COLOR
                            : INACTIVE_COLOR,
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </ScrollView>

        {/* CURRENT STAGE DESCRIPTION */}
        {current ? (
          <View className="mx-4 mt-4 rounded-lg border border-border bg-background px-3 py-3">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Current stage
            </Text>

            <Text className="mt-1 text-sm font-semibold text-foreground">
              {current.name}
            </Text>

            <Text className="mt-1 text-xs leading-5 text-muted-foreground">
              {current.description}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

