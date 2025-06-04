import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  BackHandler,
  ActionSheetIOS,
  Platform,
} from 'react-native';
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
  const [topicPickerVisible, setTopicPickerVisible] = useState(false);

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

  const openTopicPicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...TOPICS, 'Cancel'],
          cancelButtonIndex: TOPICS.length,
        },
        (index) => {
          if (index !== undefined && index !== TOPICS.length) {
            setTopic(TOPICS[index]);
          }
        }
      );
    } else {
      setTopicPickerVisible(true);
    }
  };

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
          <Text style={styles.label}>Topic</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={openTopicPicker}
          >
            <Text style={[styles.dropdownText, !topic && { color: '#888' }]}>
              {topic || 'Select a topic'}
            </Text>
          </TouchableOpacity>
        </View>
        <Modal
          transparent
          visible={topicPickerVisible && Platform.OS !== 'ios'}
          animationType="slide"
          onRequestClose={() => setTopicPickerVisible(false)}
        >
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerModal}>
              <Picker
                selectedValue={topic}
                onValueChange={(value) => setTopic(value)}
                style={styles.picker}
              >
                {TOPICS.map((t) => (
                  <Picker.Item key={t} label={t} value={t} />
                ))}
              </Picker>
              <TouchableOpacity
                style={styles.pickerDone}
                onPress={() => setTopicPickerVisible(false)}
              >
                <Text style={styles.pickerDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    borderRadius: 20,
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
    borderRadius: 12,
    marginBottom: 12,
  },
  pickerContainer: {
    marginBottom: 12,
  },
  label: {
    color: '#fff',
    marginBottom: 4,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#222',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownText: {
    color: '#fff',
  },
  pickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerModal: {
    backgroundColor: '#111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  picker: {
    color: '#fff',
  },
  pickerDone: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pickerDoneText: {
    color: '#ffe46b',
    fontWeight: 'bold',
  },
  description: {
    height: 80,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: '#ffe46b',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  createText: {
    color: '#111',
    fontWeight: 'bold',
  },
});
