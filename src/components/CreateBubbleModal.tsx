import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal as RNModal,
} from 'react-native';
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreate?: (name: string, topic: string, description: string) => void;
}

export default function CreateBubbleModal({ visible, onClose, onCreate }: Props) {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [isPickerVisible, setPickerVisible] = useState(false);

  const handleSubmit = () => {
    if (!name.trim() || !topic.trim()) return;
    onCreate?.(name, topic, description); // safe call
    setName('');
    setTopic('');
    setDescription('');
    onClose();
  };

  return (
    <Modal isVisible={visible} onBackdropPress={onClose} backdropOpacity={0.6}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>+ Create New Bubble</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Create a new bubble that will last for 24 hours. Invite others to join your conversation!
        </Text>

        {/* Name */}
        <Text style={styles.label}>Name</Text>
        <TextInput
          placeholder="Enter bubble name"
          placeholderTextColor="#888"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        {/* Topic */}
        <Text style={styles.label}>Topic</Text>
        <TouchableOpacity
          style={styles.fakeDropdown}
          onPress={() => setPickerVisible(true)}
        >
          <Text style={styles.dropdownText}>
            {topic || 'Select a topic'}
          </Text>
        </TouchableOpacity>

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          placeholder="What would you like to discuss in this bubble? (optional)"
          placeholderTextColor="#888"
          style={[styles.input, styles.description]}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {/* Submit */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Create Bubble</Text>
        </TouchableOpacity>
      </View>

      {/* Picker in Native Modal */}
      <RNModal visible={isPickerVisible} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={topic}
              onValueChange={(value) => {
                setTopic(value);
                setPickerVisible(false);
              }}
              style={{ color: '#fff', backgroundColor: '#222' }}
            >
              <Picker.Item label="Select a topic" value="" />
              <Picker.Item label="Filosofia" value="Filosofia" />
              <Picker.Item label="Spiritualità" value="Spiritualità" />
              <Picker.Item label="Tecnologia" value="Tecnologia" />
              <Picker.Item label="Arte" value="Arte" />
              <Picker.Item label="Musica" value="Musica" />
              <Picker.Item label="Altro" value="Altro" />
            </Picker>
          </View>
        </View>
      </RNModal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111',
    padding: 22,
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    color: '#ffe46b',
    fontWeight: 'bold',
  },
  close: {
    fontSize: 20,
    color: '#ccc',
  },
  subtitle: {
    color: '#ccc',
    marginTop: 8,
    fontSize: 14,
  },
  label: {
    marginTop: 16,
    marginBottom: 4,
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderColor: '#333',
    borderWidth: 1,
  },
  description: {
    height: 80,
    textAlignVertical: 'top',
  },
  fakeDropdown: {
    backgroundColor: '#222',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderColor: '#333',
    borderWidth: 1,
  },
  dropdownText: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#ffe46b',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: '#222',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 0,
  },
});
