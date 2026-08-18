import React from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function PushNotificationsListener() {
  usePushNotifications();
  return null;
}