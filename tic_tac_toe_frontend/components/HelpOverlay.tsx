import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';

type HelpOverlayProps = {
  visible: boolean;
  onClose: () => void;
};

// PUBLIC_INTERFACE
export default function HelpOverlay({ visible, onClose }: HelpOverlayProps) {
  /** Displays quick instructions for playing the game and using controls. */
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>How to Play</Text>
          <Text style={styles.text}>
            - Choose a mode: Player vs Player or Player vs AI.
          {"\n"}- Tap a cell to place your mark.
          {"\n"}- Get three in a row to win.
          {"\n"}- Use New Game to start a fresh round.
          {"\n"}- Reset Scores clears X/O/Draw counts.
          {"\n"}- In AI mode, toggle which side the AI plays to change who starts.
          </Text>
          <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={onClose}>
            <Text style={styles.buttonText}>Got it</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
  },
  title: {
    color: '#f8fafc',
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 8,
  },
  text: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  button: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#f8fafc',
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.9,
  },
});
