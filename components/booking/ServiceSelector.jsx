import React, { useMemo, useState } from 'react';

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
  CheckSquare2,
  Square,
} from 'lucide-react-native';

const SERVICE_TYPE_LABELS = {
  PMS: 'PMS',
  REPAIR: 'Repair',
  DIAGNOSTIC: 'Diagnostic',
};

function formatServiceDuration(minutes) {
  const totalMinutes = Number(minutes) || 0;

  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function formatPrice(value) {
  return `₱${(Number(value) || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function ServiceSelector({
  services = [],
  selectedServices,
  selectedService,
  onSelect,
}) {
  // Accept the original single-service prop for older consumers.
  const selected = Array.isArray(selectedServices)
    ? selectedServices
    : selectedService
      ? [selectedService]
      : [];

  const [typeFilter, setTypeFilter] = useState('ALL');
  const [subcategoryFilter, setSubcategoryFilter] = useState('ALL');

  const types = useMemo(() => [
    'ALL',
    ...Array.from(new Set(services.map((service) => service?.type).filter(Boolean))),
  ], [services]);

  const repairCategories = useMemo(() => [
    ...new Set(
      services
        .filter((service) => service?.type === 'REPAIR')
        .map((service) => service.subcategory)
        .filter(Boolean),
    ),
  ], [services]);

  const visibleServices = useMemo(() => services.filter((service) => {
    if (typeFilter !== 'ALL' && service?.type !== typeFilter) return false;
    if (
      typeFilter === 'REPAIR' &&
      subcategoryFilter !== 'ALL' &&
      service?.subcategory !== subcategoryFilter
    ) return false;
    return true;
  }), [services, typeFilter, subcategoryFilter]);

  const selectedIds = useMemo(
    () => new Set(selected.map((service) => String(service?.id))),
    [selected],
  );

  const selectedTotal = selected.reduce(
    (sum, service) => sum + (Number(service?.basePrice) || 0),
    0,
  );

  const selectedDuration = selected.reduce(
    (sum, service) => sum + (Number(service?.durationMinutes ?? service?.estimatedDuration) || 0),
    0,
  );

  return (
    <View className="mb-6">
      <View className="mb-3 flex-row items-center px-1">
        <View className="mr-2 h-7 w-7 items-center justify-center rounded-full bg-primary/10">
          <Wrench size={14} color="#C1272D" />
        </View>

        <Text className="flex-1 text-lg font-semibold text-foreground">
          Select Services
        </Text>

        <View className="rounded-full bg-primary/10 px-3 py-1.5">
          <Text className="text-xs font-bold text-primary">
            {selected.length} selected
          </Text>
        </View>
      </View>

      <Text className="mb-3 px-1 text-xs leading-5 text-muted-foreground">
        Choose one or more services. Tap a checked service again to remove it.
      </Text>

      {/* Service type tabs. Switching tabs never clears the selection. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="pb-3"
      >
        {types.map((type) => {
          const isActive = type === typeFilter;
          return (
            <TouchableOpacity
              key={type}
              activeOpacity={0.75}
              onPress={() => {
                setTypeFilter(type);
                setSubcategoryFilter('ALL');
              }}
              className={`mr-2 min-h-[44px] items-center justify-center rounded-full border px-5 ${
                isActive ? 'border-primary bg-primary' : 'border-border bg-card'
              }`}
            >
              <Text className={`text-sm font-semibold ${
                isActive ? 'text-white' : 'text-foreground'
              }`}>
                {type === 'ALL' ? 'All Services' : SERVICE_TYPE_LABELS[type] || type}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {typeFilter === 'REPAIR' && repairCategories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-3"
        >
          {['ALL', ...repairCategories].map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSubcategoryFilter(category)}
              className={`mr-2 min-h-[40px] justify-center rounded-full border px-3 py-2 ${
                subcategoryFilter === category
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card'
              }`}
            >
              <Text className="text-xs font-semibold text-foreground">
                {category === 'ALL' ? 'All Repairs' : category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Selected services remain visible even after switching categories. */}
      {selected.length > 0 && (
        <View className="mb-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <CheckSquare2 size={16} color="#C1272D" />
              <Text className="ml-2 text-sm font-semibold text-foreground">
                Your Selected Services
              </Text>
            </View>
            <Text className="text-sm font-bold text-primary">
              {formatPrice(selectedTotal)}
            </Text>
          </View>

          {selected.map((service) => (
            <TouchableOpacity
              key={String(service.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: true }}
              activeOpacity={0.7}
              onPress={() => onSelect(service)}
              className="mt-2 flex-row items-center rounded-lg bg-card px-3 py-2"
            >
              <Check size={16} color="#C1272D" />
              <Text className="ml-2 flex-1 text-sm font-medium text-foreground">
                {service.name}
              </Text>
              <Text className="text-xs font-semibold text-primary">
                Remove
              </Text>
            </TouchableOpacity>
          ))}

          <View className="mt-3 flex-row items-center justify-between border-t border-primary/10 pt-2">
            <Text className="text-xs text-muted-foreground">
              Estimated combined work duration
            </Text>
            <Text className="text-xs font-semibold text-foreground">
              {formatServiceDuration(selectedDuration)}
            </Text>
          </View>
        </View>
      )}

      <View className="overflow-hidden rounded-xl bg-card">
        {visibleServices.length === 0 ? (
          <Text className="px-4 py-5 text-center text-sm text-muted-foreground">
            No services found in this category.
          </Text>
        ) : visibleServices.map((service, index) => {
          const isSelected = selectedIds.has(String(service.id));
          const disabled = service.active === false;
          const isLast = index === visibleServices.length - 1;

          return (
            <View key={String(service.id)}>
              <TouchableOpacity
                accessibilityRole="checkbox"
                accessibilityLabel={service.name}
                accessibilityState={{ checked: isSelected, disabled }}
                activeOpacity={disabled ? 1 : 0.6}
                disabled={disabled}
                onPress={() => onSelect(service)}
                className={`min-h-[64px] flex-row items-center px-4 py-4 ${
                  isSelected ? 'bg-primary/5' : ''
                } ${disabled ? 'opacity-50' : ''}`}
              >
                <View className="mr-3">
                  {isSelected ? (
                    <CheckSquare2 size={22} color="#C1272D" />
                  ) : (
                    <Square size={22} color="#8E8E93" />
                  )}
                </View>

                <View className="mr-3 min-w-0 flex-1">
                  <Text className="text-base font-medium text-foreground">
                    {service.name}
                  </Text>

                  <View className="mt-1 flex-row items-center">
                    <Clock3 size={12} color="#8E8E93" />
                    <Text className="ml-1 text-sm text-muted-foreground">
                      {formatServiceDuration(service.durationMinutes ?? service.estimatedDuration)}
                    </Text>
                  </View>

                  <Text className="mt-1 text-xs text-muted-foreground">
                    {service.isLaborInclude ? 'Labor included' : 'Labor not included'}
                  </Text>

                  {!!service.type && (
                    <Text className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {SERVICE_TYPE_LABELS[service.type] || service.type}
                      {service.subcategory ? ` • ${service.subcategory}` : ''}
                    </Text>
                  )}

                  {disabled && (
                    <Text className="mt-1 text-xs text-primary">Unavailable</Text>
                  )}
                </View>

                <Text className="text-sm font-semibold text-primary">
                  {formatPrice(service.basePrice)}
                </Text>
              </TouchableOpacity>
              {!isLast && <View className="ml-4 h-px bg-border" />}
            </View>
          );
        })}
      </View>
    </View>
  );
}
