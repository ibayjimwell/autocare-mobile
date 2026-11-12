import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Image, KeyboardAvoidingView, Modal, Platform,
  ScrollView, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Camera, CarFront, ImagePlus, Trash2, X } from 'lucide-react-native';

const MAX_PHOTO_BYTES = 3 * 1024 * 1024;

export default function VehicleFormModal({ visible, onClose, onSave, editingVehicle }) {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({ make: '', model: '', plateNumber: '', year: '' });
  const [photoAsset, setPhotoAsset] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setForm({
      make: editingVehicle?.make || '', model: editingVehicle?.model || '',
      plateNumber: editingVehicle?.plateNumber || '',
      year: editingVehicle?.year ? String(editingVehicle.year) : '',
    });
    setPhotoAsset(null);
    setRemovePhoto(false);
  }, [editingVehicle, visible]);

  const photoUri = photoAsset?.uri || (!removePhoto ? editingVehicle?.imageUrl : null);

  async function pickPhoto() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], allowsEditing: true, aspect: [16, 10], quality: 0.75,
      });
      if (result.canceled || !result.assets?.length) return;
      const selected = result.assets[0];
      if (selected.fileSize && selected.fileSize > MAX_PHOTO_BYTES) {
        Alert.alert('Photo too large', 'Choose an image smaller than 3 MB.');
        return;
      }
      setPhotoAsset(selected);
      setRemovePhoto(false);
    } catch (error) {
      Alert.alert('Photo unavailable', error?.message || 'Unable to open photo library.');
    }
  }

  async function handleSave() {
    if (submitting) return;
    if (!form.make.trim() || !form.model.trim() || !form.plateNumber.trim()) {
      Alert.alert('Required fields', 'Make, model and plate number are required.');
      return;
    }
    const year = form.year.trim() ? Number(form.year) : null;
    if (year !== null && (!Number.isInteger(year) || year < 1900 || year > new Date().getFullYear() + 1)) {
      Alert.alert('Invalid year', 'Enter a valid model year.');
      return;
    }
    setSubmitting(true);
    try {
      const success = await onSave({
        make: form.make.trim(), model: form.model.trim(),
        plateNumber: form.plateNumber.trim().toUpperCase(), year,
        photoAsset, removePhoto,
      });
      if (success) onClose();
    } catch (error) {
      Alert.alert('Unable to save', error?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-background">
        <SafeAreaView className="flex-1" edges={['top']}>
          <View className="flex-row items-center justify-between px-4 pb-3 pt-4">
            <View>
              <Text className="text-2xl font-bold tracking-tight text-foreground">{editingVehicle ? 'Edit Vehicle' : 'New Vehicle'}</Text>
              <Text className="mt-1 text-sm text-muted-foreground">Add a photo to personalize your garage.</Text>
            </View>
            <TouchableOpacity onPress={onClose} disabled={submitting} accessibilityLabel="Close vehicle form" className="h-11 w-11 items-center justify-center rounded-full bg-secondary">
              <X size={20} color="#171717" />
            </TouchableOpacity>
          </View>
          <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
            <View className="mx-4 mb-5 overflow-hidden rounded-2xl bg-[#17171A]">
              {photoUri ? (
                <Image source={{ uri: photoUri }} className="h-[190px] w-full" resizeMode="cover" accessibilityLabel="Vehicle photo preview" />
              ) : (
                <View className="h-[190px] items-center justify-center">
                  <View className="mb-2 h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10">
                    <CarFront size={30} color="#FFFFFF" />
                  </View>
                  <Text className="text-base font-semibold text-white">{`${form.make} ${form.model}`.trim() || 'Vehicle photo'}</Text>
                  <Text className="mt-1 text-sm text-white/50">Optional · JPG, PNG, WebP</Text>
                </View>
              )}
              <View className="flex-row gap-2 p-3">
                <TouchableOpacity onPress={pickPhoto} disabled={submitting} activeOpacity={0.8}
                  className="min-h-[44px] flex-1 flex-row items-center justify-center rounded-xl bg-white px-3">
                  <ImagePlus size={18} color="#C1272D" />
                  <Text className="ml-2 font-semibold text-[#17171A]">{photoUri ? 'Change Photo' : 'Add Photo'}</Text>
                </TouchableOpacity>
                {!!photoUri && (
                  <TouchableOpacity onPress={() => { setPhotoAsset(null); setRemovePhoto(true); }}
                    disabled={submitting} accessibilityLabel="Remove vehicle photo" className="h-11 w-11 items-center justify-center rounded-xl border border-white/25 bg-white/10">
                    <Trash2 size={19} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View className="mx-4 overflow-hidden rounded-xl border border-border bg-card">
              {[
                ['Make', 'make', 'e.g. Toyota'],
                ['Model', 'model', 'e.g. Vios'],
                ['Plate', 'plateNumber', 'ABC 1234'],
                ['Year', 'year', 'e.g. 2024 (optional)'],
              ].map(([label, key, placeholder], index) => (
                <View key={key} className={`ml-4 min-h-[54px] flex-row items-center pr-4 ${index < 3 ? 'border-b border-border' : ''}`}>
                  <Text className="w-[95px] text-base text-foreground">{label}</Text>
                  <TextInput className="min-h-[50px] flex-1 py-2 text-base text-foreground"
                    placeholder={placeholder} placeholderTextColor="#8E8E93" value={form[key]}
                    keyboardType={key === 'year' ? 'number-pad' : 'default'} maxLength={key === 'year' ? 4 : key === 'plateNumber' ? 20 : 100}
                    autoCapitalize={key === 'plateNumber' ? 'characters' : 'words'}
                    onChangeText={text => setForm(current => ({ ...current, [key]: text }))} />
                </View>
              ))}
            </View>
            <View className="mx-5 mt-4 flex-row items-center">
              <Camera size={15} color="#8E8E93" />
              <Text className="ml-2 text-xs text-muted-foreground">Photos are optional. Maximum upload size: 3 MB.</Text>
            </View>
          </ScrollView>
          <View className="absolute bottom-0 left-0 right-0 border-t border-border/40 bg-white/90 px-4 pt-3"
            style={{ paddingBottom: insets.bottom + 12 }}>
            <TouchableOpacity onPress={handleSave} disabled={submitting} activeOpacity={0.85}
              className="min-h-[52px] flex-row items-center justify-center rounded-xl bg-primary">
              {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-base font-semibold text-white">{editingVehicle ? 'Save Changes' : 'Save to Garage'}</Text>}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
