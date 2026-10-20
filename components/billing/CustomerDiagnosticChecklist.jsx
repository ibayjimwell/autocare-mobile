
import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';

import {
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';

import api from '../../services/api';

/*
 * Local vehicle image.
 *
 * File location:
 * assets/autocare-vehicle-dent-template.png
 *
 * React Native bundles this image with the application.
 * No internet connection is required to display it.
 */
const VEHICLE_DENT_IMAGE = require(
  '../../assets/autocare-vehicle-dent-template.png'
);

/*
 * Original vehicle diagram dimensions.
 *
 * The overlay coordinates saved by AutoCare System
 * use a 500 x 175 coordinate space.
 *
 * The actual PNG image is 1817 x 866.
 */
const IMAGE_WIDTH = 1817;
const IMAGE_HEIGHT = 866;

const DENT_COORDINATE_WIDTH = 500;
const DENT_COORDINATE_HEIGHT = 175;

function clamp(value, minimum, maximum) {
  return Math.max(
    minimum,
    Math.min(maximum, value)
  );
}

function getDentPosition(mark) {
  const x = Number(mark?.x);
  const y = Number(mark?.y);

  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y)
  ) {
    return null;
  }

  const left = clamp(
    (x / DENT_COORDINATE_WIDTH) * 100,
    0,
    100
  );

  const top = clamp(
    (y / DENT_COORDINATE_HEIGHT) * 100,
    0,
    100
  );

  return {
    left: `${left}%`,
    top: `${top}%`,
  };
}

/**
 * Customer Diagnostic Checklist
 *
 * Read-only component.
 *
 * Customer identity is verified by the server
 * using the authenticated customer's JWT.
 */
export default function CustomerDiagnosticChecklist({
  appointmentId,
}) {
  const [expanded, setExpanded] = useState(false);

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (!appointmentId) {
      setData(null);

      return () => {
        mounted = false;
      };
    }

    const load = async () => {
      setLoading(true);

      try {
        const res = await api.request(
          `/customers/diagnostic-checklist?appointmentId=${encodeURIComponent(
            appointmentId
          )}`,
          'GET',
          null,
          true
        );

        if (mounted) {
          setData(res?.data || null);
        }
      } catch (error) {
        if (mounted) {
          setData(null);

          console.warn(
            '[Customer diagnostic checklist]',
            error?.message
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [appointmentId]);

  if (!appointmentId) {
    return null;
  }

  const sections = Array.isArray(data?.sections)
    ? data.sections
    : [];

  const entries = Array.isArray(data?.entries)
    ? data.entries
    : [];

  const statusMap = new Map(
    entries.map((item) => [
      item.itemKey,
      item.status,
    ])
  );

  const checklist = data?.checklist;

  const dentsMarks = Array.isArray(checklist?.dentsMarks)
    ? checklist.dentsMarks
    : [];

  return (
    <View className="border-t border-border bg-card px-4 py-3">
      {/* =====================================================
          CHECKLIST HEADER
      ===================================================== */}

      <TouchableOpacity
        onPress={() =>
          setExpanded((value) => !value)
        }
        activeOpacity={0.8}
        className="min-h-[48px] flex-row items-center"
        accessibilityRole="button"
        accessibilityLabel="Toggle diagnostic checklist"
        accessibilityState={{
          expanded,
        }}
      >
        <ClipboardCheck
          size={20}
          color="#C1272D"
        />

        <View className="ml-3 flex-1">
          <Text className="text-sm font-semibold text-foreground">
            Diagnostic Checklist
          </Text>

          <Text className="text-xs text-muted-foreground">
            View recorded inspection results (read only)
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="small"
            color="#C1272D"
          />
        ) : expanded ? (
          <ChevronUp
            size={18}
            color="#8E8E93"
          />
        ) : (
          <ChevronDown
            size={18}
            color="#8E8E93"
          />
        )}
      </TouchableOpacity>

      {/* =====================================================
          EXPANDED CHECKLIST
      ===================================================== */}

      {expanded && (
        !checklist ? (
          <Text className="py-3 text-sm text-muted-foreground">
            {loading
              ? 'Loading diagnostic checklist...'
              : 'No diagnostic checklist recorded for this appointment.'}
          </Text>
        ) : (
          <View className="pt-2">
            {/* ================================================
                ENGINE AND TRANSMISSION
            ================================================ */}

            <Text className="mb-3 text-xs text-muted-foreground">
              Engine: {checklist.engineType || '—'}
              {' · '}
              Transmission: {checklist.transmissionType || '—'}
            </Text>

            {/* ================================================
                DIAGNOSTIC COMPONENT SECTIONS
            ================================================ */}

            {sections.map((section) => (
              <View
                key={section.id}
                className="mb-3 overflow-hidden rounded-lg border border-border"
              >
                <Text className="bg-background px-3 py-2 text-xs font-bold text-foreground">
                  {section.title}
                </Text>

                {section.items.map(([key, label]) => {
                  const status =
                    statusMap.get(key) ||
                    'NOT CHECKED';

                  const color =
                    status === 'REPLACE'
                      ? '#C1272D'
                      : status === 'WARNING'
                        ? '#B7791F'
                        : status === 'GOOD'
                          ? '#15803D'
                          : '#8E8E93';

                  return (
                    <View
                      key={key}
                      className="flex-row items-center justify-between border-t border-border px-3 py-2"
                    >
                      <Text className="flex-1 pr-3 text-xs text-foreground">
                        {label}
                      </Text>

                      <Text
                        className="text-xs font-bold"
                        style={{
                          color,
                        }}
                      >
                        {status}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}

            {/* ================================================
                INSPECTION REMARKS
            ================================================ */}

            {checklist.remarks ? (
              <Text className="mb-2 text-xs text-foreground">
                Remarks: {checklist.remarks}
              </Text>
            ) : null}

            {checklist.dentsNotes ? (
              <Text className="mb-2 text-xs text-foreground">
                Dent notes: {checklist.dentsNotes}
              </Text>
            ) : null}

            {/* ================================================
                VEHICLE DENT INSPECTION
            ================================================ */}

            <View className="mt-3">
              <Text className="mb-2 text-sm font-semibold text-foreground">
                Vehicle Dent Inspection
              </Text>

              <Text className="mb-3 text-xs text-muted-foreground">
                Recorded exterior dents and body damage
                (read only).
              </Text>

              {/* =============================================
                  LOCAL VEHICLE DENT DIAGRAM

                  Image:
                  assets/autocare-vehicle-dent-template.png

                  Coordinates:
                  500 x 175

                  PNG:
                  1817 x 866
              ============================================= */}

              <View className="overflow-hidden rounded-lg border border-border bg-white">
                <ImageBackground
                  source={VEHICLE_DENT_IMAGE}
                  resizeMode="stretch"
                  className="w-full"
                  style={{
                    width: '100%',
                    aspectRatio:
                      IMAGE_WIDTH / IMAGE_HEIGHT,
                  }}
                  accessibilityLabel="Vehicle dent inspection diagram"
                >
                  {/* =========================================
                      SAVED DENT MARKERS
                  ========================================= */}

                  {dentsMarks.map((mark, index) => {
                    const position =
                      getDentPosition(mark);

                    if (!position) {
                      return null;
                    }

                    return (
                      <View
                        key={
                          mark?.id ||
                          `dent-mark-${index}`
                        }
                        pointerEvents="none"
                        style={{
                          position: 'absolute',
                          left: position.left,
                          top: position.top,
                          transform: [
                            {
                              translateX: -8,
                            },
                            {
                              translateY: -12,
                            },
                          ],
                        }}
                      >
                        <Text
                          style={{
                            color: '#C1272D',
                            fontSize: 20,
                            lineHeight: 24,
                            fontWeight: '900',
                            textAlign: 'center',
                            textShadowColor:
                              'rgba(255,255,255,0.95)',
                            textShadowOffset: {
                              width: 1,
                              height: 1,
                            },
                            textShadowRadius: 2,
                          }}
                        >
                          X
                        </Text>
                      </View>
                    );
                  })}
                </ImageBackground>
              </View>

              {/* =============================================
                  DENT MARK COUNT
              ============================================= */}

              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-xs font-medium text-muted-foreground">
                  Recorded dent marks
                </Text>

                <View className="rounded-full bg-primary/10 px-3 py-1">
                  <Text className="text-xs font-semibold text-primary">
                    {dentsMarks.length}
                  </Text>
                </View>
              </View>

              {dentsMarks.length === 0 ? (
                <Text className="mt-2 text-xs text-muted-foreground">
                  No dent marks recorded.
                </Text>
              ) : null}
            </View>
          </View>
        )
      )}
    </View>
  );
}
