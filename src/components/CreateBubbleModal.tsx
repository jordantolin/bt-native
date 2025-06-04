import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';

export type CreateBubbleData = {
  name: string;
  topic: string;
  description?: string;
};

export type CreateBubbleModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreate: (data: CreateBubbleData) => void;
};

const TOPICS = [
  'Filosofia',
  'Spiritualità',
  'Tecnologia',
  'Arte',
  'Musica',
  'Scienza',
  'Altro',
];

export default function CreateBubbleModal({ visible, onClose, onCreate }: CreateBubbleModalProps) {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');

  const canCreate = name.trim() !== '' && topic !== '';

  const handleCreate = () => {
    if (!canCreate) return;
    onCreate({ name: name.trim(), topic, description: description.trim() || undefined });
    setName('');
    setTopic('');
    setDescription('');
  };

  return (
    <Modal isVisible={visible} onBackdropPress={onClose} style={styles.modal}>
      <View style={styles.content}>
        <TouchableOpacity onPress={onClose} style={styles.close}>
          <MaterialIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>New Bubble</Text>
        <TextInput
          placeholder="Name"
          placeholderTextColor="#888"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={topic}
            onValueChange={setTopic}
            dropdownIconColor="#fff"
            style={styles.picker}
          >
            <Picker.Item label="Select topic..." value="" />
            {TOPICS.map((t) => (
              <Picker.Item key={t} label={t} value={t} />
            ))}
          </Picker>
        </View>
        <TextInput
          placeholder="Description (optional)"
          placeholderTextColor="#888"
          style={[styles.input, styles.description]}
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TouchableOpacity
          style={[styles.createButton, !canCreate && { opacity: 0.5 }]}
          disabled={!canCreate}
          onPress={handleCreate}
        >
          <Text style={styles.createText}>Create Bubble</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 12,
  },
  close: {
    position: 'absolute',
    right: 8,
    top: 8,
    padding: 4,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  picker: {
    color: '#fff',
    backgroundColor: '#222',
  },
  description: {
    height: 80,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: '#ffe46b',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createText: {
    color: '#111',
    fontWeight: 'bold',
  },
});
