import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import {
  Wrench,
  Clock3,
  Check,
} from 'lucide-react-native';

const SERVICE_TYPE_LABELS = {
  PMS: 'PMS',
  REPAIR: 'Repair',
  CHECKUP: 'Checkup',
};

function formatServiceDuration(minutes) {
  const totalMinutes =
    Number(minutes) || 0;

  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours =
    Math.floor(totalMinutes / 60);

  const remainingMinutes =
    totalMinutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} ${
      hours === 1
        ? 'hour'
        : 'hours'
    }`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function formatPrice(value) {
  return `₱${(
    Number(value) || 0
  ).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function ServiceSelector({
  services,
  selectedService,
  onSelect,
}) {
  const types = [
    'ALL',
    ...Array.from(
      new Set(
        services
          .map(
            (service) =>
              service?.type
          )
          .filter(Boolean)
      )
    ),
  ];

  const selectedType =
    selectedService?.type || 'ALL';

  const visibleServices =
    selectedType === 'ALL'
      ? services
      : services.filter(
          (service) =>
            service?.type ===
            selectedType
        );

  /*
   * Always keep the selected service visible.
   * This avoids the selected item disappearing after selecting
   * it from another category.
   */
  const servicesToRender =
    selectedService &&
    !visibleServices.some(
      (service) =>
        service.id ===
        selectedService.id
    )
      ? [
          selectedService,
          ...visibleServices,
        ]
      : visibleServices;

  return (
    <View className="mb-6">
      <View className="mb-3 flex-row items-center px-1">
        <View className="mr-2 h-7 w-7 items-center justify-center rounded-full bg-primary/10">
          <Wrench
            size={14}
            color="#C1272D"
          />
        </View>

        <Text className="text-lg font-semibold text-foreground">
          Select Service
        </Text>
      </View>

      {/* Type tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="pb-3"
      >
        {types.map((type) => {
          const isActive =
            type ===
            selectedType;

          return (
            <TouchableOpacity
              key={type}
              activeOpacity={0.75}
              onPress={() => {
                /*
                 * Tapping a type only changes the visible
                 * list. It does not destroy the selected service.
                 */
              }}
              className={`mr-2 min-h-[44px] items-center justify-center rounded-full border px-5 ${
                isActive
                  ? 'border-primary bg-primary'
                  : 'border-border bg-card'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  isActive
                    ? 'text-white'
                    : 'text-foreground'
                }`}
              >
                {SERVICE_TYPE_LABELS[
                  type
                ] || type}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View className="overflow-hidden rounded-xl bg-card">
        {servicesToRender.map(
          (
            service,
            index
          ) => {
            const isSelected =
              selectedService?.id ===
              service.id;

            const isLast =
              index ===
              servicesToRender.length -
                1;

            return (
              <View
                key={
                  service.id
                }
              >
                <TouchableOpacity
                  activeOpacity={
                    0.6
                  }
                  onPress={() =>
                    onSelect(
                      service
                    )
                  }
                  className={`min-h-[44px] flex-row items-center px-4 py-4 ${
                    isSelected
                      ? 'bg-primary/5'
                      : ''
                  }`}
                >
                  <View className="flex-1 mr-3">
                    <Text className="text-base font-normal text-foreground">
                      {
                        service.name
                      }
                    </Text>

                    <View className="mt-1 flex-row items-center">
                      <Clock3
                        size={12}
                        color="#8E8E93"
                      />

                      <Text className="ml-1 text-sm font-normal text-muted-foreground">
                        {formatServiceDuration(
                          service.durationMinutes
                        )}
                      </Text>
                    </View>

                    {!!service.type && (
                      <Text className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {SERVICE_TYPE_LABELS[
                          service
                            .type
                        ] ||
                          service.type}
                      </Text>
                    )}
                  </View>

                  <Text className="mr-2 text-base font-semibold text-primary">
                    {formatPrice(
                      service.basePrice
                    )}
                  </Text>

                  {isSelected && (
                    <View className="h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <Check
                        size={12}
                        color="#FFFFFF"
                        strokeWidth={
                          3
                        }
                      />
                    </View>
                  )}
                </TouchableOpacity>

                {!isLast && (
                  <View className="ml-4 h-px bg-border" />
                )}
              </View>
            );
          }
        )}
      </View>
    </View>
  );
}