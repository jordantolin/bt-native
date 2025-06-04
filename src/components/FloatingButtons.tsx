import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export type FloatingButtonsProps = {
  onLeftPress: () => void;
  onRightPress: () => void;
};

export default function FloatingButtons({ onLeftPress, onRightPress }: FloatingButtonsProps) {
  return (
    <>
      <TouchableOpacity style={[styles.button, styles.left]} onPress={onLeftPress}>
        <MaterialIcons name="star" size={28} color="#111" />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.right]} onPress={onRightPress}>
        <MaterialIcons name="add" size={28} color="#111" />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffe46b',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  left: {
    left: 24,
  },
  right: {
    right: 24,
  },
});
