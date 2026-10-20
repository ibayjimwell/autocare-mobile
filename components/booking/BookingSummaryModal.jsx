import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import {
  X,
  Wrench,
  CarFront,
  CalendarDays,
  Clock3,
  FileText,
  CheckCircle2,
} from 'lucide-react-native';

function formatServiceDuration(minutes) {
  const total = Number(minutes) || 0;

  if (total < 60) {
    return `${total} min`;
  }

  const hours = Math.floor(total / 60);
  const mins = total % 60;

  if (mins === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }

  return `${hours}h ${mins}m`;
}

function formatPrice(value) {
  return `₱${(Number(value) || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatTimeLabel(value) {
  if (!value) {
    return 'Not selected';
  }

  const [hourValue, minuteValue] = String(value).split(':').map(Number);
  const hour = Number(hourValue) || 0;
  const minute = Number(minuteValue) || 0;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute).padStart(2, '0')} ${suffix}`;
}

function formatDate(value) {
  if (!value) {
    return 'Not selected';
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not selected';
  }

  return date.toLocaleDateString('en-PH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function SummaryRow({ icon, title, value, children }) {
  return (
    <View className="flex-row items-start px-4 py-4">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
        {icon}
      </View>

      <View className="ml-3 flex-1">
        <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </Text>

        {children || (
          <Text className="mt-1 text-base font-semibold text-foreground">
            {value}
          </Text>
        )}
      </View>
    </View>
  );
}

export default function BookingSummaryModal({
  visible,
  onClose,
  onConfirm,
  submitting,
  services,
  service,
  vehicle,
  date,
  time,
  notes,
}) {
  // Backward compatible with any older single-service booking caller.
  const selectedServices = Array.isArray(services)
    ? services
    : service
      ? [service]
      : [];

  const vehicleName = `${vehicle?.make || ''} ${vehicle?.model || ''}`.trim() || 'Vehicle';
  const plate = vehicle?.plateNumber || vehicle?.plate || '';

  const totalPrice = selectedServices.reduce(
    (sum, selected) => sum + (Number(selected?.basePrice) || 0),
    0,
  );

  const totalDuration = selectedServices.reduce(
    (sum, selected) => sum + (Number(selected?.durationMinutes ?? selected?.estimatedDuration) || 0),
    0,
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={submitting ? undefined : onClose}
    >
      <View className="flex-1 justify-end bg-black/45">
        <View className="max-h-[88%] rounded-t-3xl bg-background">
          {/* Header */}
          <View className="border-b border-border px-4 pb-3 pt-3">
            <View className="mb-2 h-1 w-9 self-center rounded-full bg-foreground/10" />

            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-xl font-bold tracking-tight text-foreground">
                  Review Booking
                </Text>

                <Text className="mt-1 text-sm text-muted-foreground">
                  Double-check all selected services and appointment details before confirming.
                </Text>
              </View>

              <TouchableOpacity
                disabled={submitting}
                onPress={onClose}
                className="min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-secondary"
              >
                <X size={20} color="#8E8E93" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {/* Booking details */}
            <View className="mx-4 mt-4 overflow-hidden rounded-2xl bg-card">
              <SummaryRow
                title={`Services (${selectedServices.length})`}
                icon={<Wrench size={19} color="#C1272D" />}
              >
                <View className="mt-2">
                  {selectedServices.map((selected, index) => {
                    const details = [selected?.type, selected?.subcategory]
                      .filter(Boolean)
                      .join(' • ');

                    return (
                      <View
                        key={String(selected?.id || index)}
                        className={`py-2 ${index > 0 ? 'border-t border-border' : ''}`}
                      >
                        <View className="flex-row items-start justify-between">
                          <Text className="mr-2 flex-1 text-sm font-semibold text-foreground">
                            {index + 1}. {selected?.name || 'Service'}
                          </Text>

                          <Text className="text-sm font-semibold text-primary">
                            {formatPrice(selected?.basePrice)}
                          </Text>
                        </View>

                        {!!details && (
                          <Text className="mt-1 text-xs text-muted-foreground">
                            {details}
                          </Text>
                        )}

                        <Text className="mt-1 text-xs text-muted-foreground">
                          {formatServiceDuration(
                            selected?.durationMinutes ?? selected?.estimatedDuration,
                          )} · {selected?.isLaborInclude ? 'Labor included' : 'Labor not included'}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </SummaryRow>

              <View className="ml-[68px] h-px bg-border" />

              <SummaryRow
                title="Vehicle"
                icon={<CarFront size={19} color="#C1272D" />}
              >
                <View>
                  <Text className="mt-1 text-base font-semibold text-foreground">
                    {vehicleName}
                  </Text>
                  {!!plate && (
                    <Text className="mt-0.5 text-sm text-muted-foreground">
                      {plate}
                    </Text>
                  )}
                </View>
              </SummaryRow>

              <View className="ml-[68px] h-px bg-border" />

              <SummaryRow
                title="Date"
                value={formatDate(date)}
                icon={<CalendarDays size={19} color="#C1272D" />}
              />

              <View className="ml-[68px] h-px bg-border" />

              <SummaryRow
                title="Time"
                value={formatTimeLabel(time)}
                icon={<Clock3 size={19} color="#C1272D" />}
              />
            </View>

            {/* Combined cost and duration */}
            <View className="mx-4 mt-3 rounded-2xl bg-card p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted-foreground">
                  Total estimated duration
                </Text>
                <Text className="text-sm font-semibold text-foreground">
                  {formatServiceDuration(totalDuration)}
                </Text>
              </View>

              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-sm text-muted-foreground">
                  Services subtotal
                </Text>
                <Text className="text-lg font-bold text-primary">
                  {formatPrice(totalPrice)}
                </Text>
              </View>

              <Text className="mt-2 text-xs leading-5 text-muted-foreground">
                Additional repairs, inspection findings, parts, and labor not included in a service price may be quoted later.
              </Text>
            </View>

            {/* Notes */}
            {!!notes?.trim() && (
              <View className="mx-4 mt-3 overflow-hidden rounded-2xl bg-card">
                <SummaryRow
                  title="Notes"
                  icon={<FileText size={19} color="#C1272D" />}
                >
                  <Text className="mt-1 text-sm leading-5 text-foreground">
                    {notes}
                  </Text>
                </SummaryRow>
              </View>
            )}

            {/* Warning */}
            <View className="mx-4 mt-4 flex-row items-start rounded-2xl bg-primary/5 p-4">
              <CheckCircle2 size={19} color="#C1272D" />
              <Text className="ml-2 flex-1 text-sm leading-5 text-foreground">
                Please confirm that every selected service, the vehicle, date, and time are correct. All selected services will be submitted in one appointment.
              </Text>
            </View>
          </ScrollView>

          {/* Actions */}
          <View className="border-t border-border bg-background px-4 pb-4 pt-3">
            <TouchableOpacity
              disabled={submitting || selectedServices.length === 0}
              activeOpacity={0.85}
              onPress={onConfirm}
              className={`min-h-[52px] flex-row items-center justify-center rounded-xl bg-primary ${
                submitting || selectedServices.length === 0 ? 'opacity-60' : ''
              }`}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <CheckCircle2 size={20} color="#FFFFFF" />
                  <Text className="ml-2 text-base font-semibold text-white">
                    Confirm & Book
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              disabled={submitting}
              onPress={onClose}
              className="mt-2 min-h-[44px] items-center justify-center"
            >
              <Text className="text-sm font-semibold text-muted-foreground">
                Go Back and Edit
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
