import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  Inbox,
} from 'lucide-react-native';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '../../context/ThemeContext';

export default function NotificationModal({
  visible,
  onClose,
}) {
  const { theme } = useTheme();

  const {
    notifications,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications();

  const handleClearAll = () => {
    Alert.alert(
      'Clear All',
      'Are you sure you want to clear all notifications?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearAll,
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView
        className="
          flex-1
          bg-black/55
        "
      >
        <View
          className="
            flex-1
            justify-end
          "
        >
          {/* ============================================================
              BACKDROP PRESS AREA
          ============================================================ */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={onClose}
            className="
              absolute
              inset-0
            "
          />

          {/* ============================================================
              NOTIFICATION PANEL
          ============================================================ */}
          <View
            className="
              max-h-[92%]
              w-full
              rounded-t-[32px]
              border-t
              border-white/20
              bg-slate-950/75
              px-4
              pb-4
              pt-3
            "
          >
            {/* ========================================================
                TOP HANDLE
            ======================================================== */}
            <View className="items-center py-2">
              <View
                className="
                  h-1.5
                  w-12
                  rounded-full
                  bg-white/30
                "
              />
            </View>

            {/* ========================================================
                HEADER
            ======================================================== */}
            <View
              className="
                flex-row
                items-center
                justify-between
                px-1
                pb-3
              "
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/20
                    bg-white/15
                  "
                >
                  <Bell
                    size={19}
                    color="#FFFFFF"
                    strokeWidth={2}
                  />
                </View>

                <View>
                  <Text
                    className="
                      text-xl
                      font-bold
                      tracking-tight
                      text-white
                    "
                  >
                    Notifications
                  </Text>

                  <Text
                    className="
                      mt-0.5
                      text-xs
                      font-medium
                      text-white/60
                    "
                  >
                    {notifications.length === 0
                      ? 'You are all caught up'
                      : `${notifications.length} ${
                          notifications.length === 1
                            ? 'notification'
                            : 'notifications'
                        }`}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close notifications"
                className="
                  h-11
                  w-11
                  min-h-[44px]
                  min-w-[44px]
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/20
                  bg-white/15
                "
              >
                <X
                  size={21}
                  color="#FFFFFF"
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </View>

            {/* ========================================================
                ACTIONS
            ======================================================== */}
            {notifications.length > 0 && (
              <View
                className="
                  mb-2
                  flex-row
                  items-center
                  justify-end
                  gap-2
                  border-b
                  border-white/10
                  pb-3
                  pt-1
                "
              >
                <TouchableOpacity
                  onPress={markAllAsRead}
                  accessibilityRole="button"
                  accessibilityLabel="Mark all notifications as read"
                  className="
                    min-h-[44px]
                    flex-row
                    items-center
                    rounded-xl
                    border
                    border-white/15
                    bg-white/10
                    px-3.5
                  "
                >
                  <CheckCheck
                    size={16}
                    color="#FFFFFF"
                    strokeWidth={2}
                  />

                  <Text
                    className="
                      ml-1.5
                      text-xs
                      font-semibold
                      text-white
                    "
                  >
                    Mark all read
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleClearAll}
                  accessibilityRole="button"
                  accessibilityLabel="Clear all notifications"
                  className="
                    min-h-[44px]
                    flex-row
                    items-center
                    rounded-xl
                    border
                    border-red-400/20
                    bg-red-500/10
                    px-3.5
                  "
                >
                  <Trash2
                    size={16}
                    color="#FF6B6B"
                    strokeWidth={2}
                  />

                  <Text
                    className="
                      ml-1.5
                      text-xs
                      font-semibold
                      text-red-300
                    "
                  >
                    Clear all
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ========================================================
                NOTIFICATIONS
            ======================================================== */}
            <ScrollView
              className="flex-1"
              contentContainerStyle={{
                paddingTop: 8,
                paddingBottom: 8,
              }}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              {notifications.length === 0 ? (
                <View
                  className="
                    min-h-[320px]
                    items-center
                    justify-center
                    px-6
                  "
                >
                  <View
                    className="
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-white/15
                      bg-white/10
                    "
                  >
                    <Inbox
                      size={28}
                      color="#FFFFFF"
                      strokeWidth={1.8}
                    />
                  </View>

                  <Text
                    className="
                      mt-4
                      text-base
                      font-semibold
                      text-white
                    "
                  >
                    No notifications
                  </Text>

                  <Text
                    className="
                      mt-1
                      max-w-[280px]
                      text-center
                      text-sm
                      leading-5
                      text-white/60
                    "
                  >
                    New notifications will appear here when there is activity in your AutoCare system.
                  </Text>
                </View>
              ) : (
                <View className="gap-3">
                  {notifications.map((notif) => (
                    <TouchableOpacity
                      key={notif.id}
                      activeOpacity={0.88}
                      onPress={() =>
                        markAsRead(notif.id)
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`Notification: ${notif.title}`}
                      className={`
                        relative
                        overflow-hidden
                        rounded-2xl
                        border
                        px-4
                        py-4
                        ${
                          notif.read
                            ? 'border-white/15 bg-white/10'
                            : 'border-white/30 bg-white/20'
                        }
                      `}
                    >
                      {/* ==================================================
                          UNREAD INDICATOR
                      ================================================== */}
                      {!notif.read && (
                        <View
                          className="
                            absolute
                            left-0
                            top-0
                            bottom-0
                            w-1
                            bg-primary
                          "
                        />
                      )}

                      <View
                        className="
                          flex-row
                          items-start
                        "
                      >
                        {/* ==================================================
                            ICON
                        ================================================== */}
                        <View
                          className={`
                            mr-3
                            h-12
                            w-12
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            border
                            ${
                              notif.read
                                ? 'border-white/15 bg-white/10'
                                : 'border-white/25 bg-white/20'
                            }
                          `}
                        >
                          <Bell
                            size={20}
                            color="#FFFFFF"
                            strokeWidth={
                              notif.read ? 1.8 : 2
                            }
                          />
                        </View>

                        {/* ==================================================
                            CONTENT
                        ================================================== */}
                        <View className="min-w-0 flex-1">
                          <View
                            className="
                              flex-row
                              items-start
                              justify-between
                            "
                          >
                            <Text
                              numberOfLines={2}
                              className={`
                                flex-1
                                pr-2
                                text-base
                                leading-5
                                text-white
                                ${
                                  notif.read
                                    ? 'font-semibold'
                                    : 'font-bold'
                                }
                              `}
                            >
                              {notif.title}
                            </Text>

                            <Text
                              numberOfLines={1}
                              className="
                                ml-2
                                text-xs
                                font-medium
                                text-white/55
                              "
                            >
                              {formatDistanceToNow(
                                new Date(
                                  notif.timestamp
                                ),
                                {
                                  addSuffix: true,
                                }
                              )}
                            </Text>
                          </View>

                          <Text
                            className="
                              mt-1.5
                              text-sm
                              leading-5
                              text-white/80
                            "
                          >
                            {notif.body}
                          </Text>

                          {!notif.read && (
                            <View className="mt-2 flex-row items-center">
                              <View
                                className="
                                  h-2
                                  w-2
                                  rounded-full
                                  bg-primary
                                "
                              />

                              <Text
                                className="
                                  ml-1.5
                                  text-[11px]
                                  font-semibold
                                  text-white/65
                                "
                              >
                                Unread
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* ========================================================
                FOOTER
            ======================================================== */}
            <View
              className="
                border-t
                border-white/10
                pt-3
              "
            >
              <TouchableOpacity
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close notifications"
                className="
                  min-h-[44px]
                  items-center
                  justify-center
                  rounded-xl
                  bg-white/10
                "
              >
                <Text
                  className="
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}