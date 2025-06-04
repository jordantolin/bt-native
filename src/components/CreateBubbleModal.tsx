import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Modal, BackHandler } from 'react-native';
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
  const [topicMenuVisible, setTopicMenuVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        onClose();
        return true;
      });
      return () => sub.remove();
    }
  }, [visible]);

  const canCreate = name.trim() !== '' && topic !== '';

  const handleCreate = () => {
    if (!canCreate) return;
    onCreate({ name: name.trim(), topic, description: description.trim() || undefined });
    setName('');
    setTopic('');
    setDescription('');
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modal}>
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
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setTopicMenuVisible(true)}
          >
            <Text style={[styles.dropdownText, !topic && { color: '#888' }]}> 
              {topic || 'Select topic...'}
            </Text>
          </TouchableOpacity>
          <Modal
            transparent
            visible={topicMenuVisible}
            animationType="fade"
            onRequestClose={() => setTopicMenuVisible(false)}
          >
            <View style={styles.dropdownList}>
              <FlatList
                data={TOPICS}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setTopic(item);
                      setTopicMenuVisible(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </Modal>
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    marginBottom: 12,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownText: {
    color: '#fff',
  },
  dropdownList: {
    backgroundColor: '#222',
    borderRadius: 8,
    paddingVertical: 8,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    color: '#fff',
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
