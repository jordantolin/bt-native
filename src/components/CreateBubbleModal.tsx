import React, { useState } from 'react';
import { View, StyleSheet, Platform, ActionSheetIOS } from 'react-native';
import { Modal, Portal, TextInput, Button, Surface } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';

export type CreateBubbleModalProps = {
  visible: boolean;
  onDismiss: () => void;
  onSubmit?: (label: string, topic: string) => void;
  topics: string[];
};

export default function CreateBubbleModal({ visible, onDismiss, onSubmit, topics }: CreateBubbleModalProps) {
  const [label, setLabel] = useState('');
  const [topic, setTopic] = useState('');

  const handleSubmit = () => {
    onSubmit?.(label.trim(), topic.trim());
    setLabel('');
    setTopic('');
    onDismiss();
  };

  const openIOSPicker = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [...topics, 'Cancel'],
        cancelButtonIndex: topics.length,
      },
      (index) => {
        if (index < topics.length) {
          setTopic(topics[index]);
        }
      },
    );
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Surface style={styles.card} elevation={4}>
          <TextInput
            mode="outlined"
            label="Label"
            value={label}
            onChangeText={setLabel}
            style={styles.input}
          />
          {Platform.OS === 'ios' ? (
            <TextInput
              mode="outlined"
              label="Topic"
              placeholder="Select a topic"
              value={topic}
              onFocus={openIOSPicker}
              style={styles.input}
              showSoftInputOnFocus={false}
            />
          ) : (
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={topic}
                onValueChange={(val) => setTopic(val)}
                style={styles.picker}
              >
                <Picker.Item label="Select a topic" value="" />
                {topics.map((t) => (
                  <Picker.Item label={t} value={t} key={t} />
                ))}
              </Picker>
            </View>
          )}
          <Button mode="contained" onPress={handleSubmit} style={styles.button} disabled={!label || !topic}>
            Create
          </Button>
          <Button onPress={onDismiss} textColor="#ccc" style={styles.cancel}>Cancel</Button>
        </Surface>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#222',
    overflow: 'visible',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#333',
    borderRadius: 12,
  },
  pickerWrapper: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  picker: {
    color: '#fff',
  },
  button: {
    borderRadius: 12,
  },
  cancel: {
    marginTop: 8,
  },
});
