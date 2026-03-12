import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
import ConfettiJSON from '@/assets/animations/confetti.json';

interface Props {
  visible: boolean;
  onClose: () => void;
  celebratedVictories: string[];
  onVictoryPress: (text: string) => Promise<string[]> | void;
}

export function VictoriesModal({ visible, onClose, celebratedVictories, onVictoryPress }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [showConfetti, setShowConfetti] = useState(false);

  const victories = [
    { id: 'bed', text: t('today.bed'), emoji: '🛏️' },
    { id: 'water', text: t('today.water'), emoji: '💧' },
    { id: 'breath', text: t('today.breath'), emoji: '🌬️' },
    { id: 'patient', text: t('today.patient'), emoji: '🍎' },
    { id: 'pet', text: t('today.pet'), emoji: '🌤' },
    { id: 'sky', text: t('today.sky'), emoji: '😊' },
    { id: 'smile', text: t('today.smile'), emoji: '❤️' },
    { id: 'food', text: t('today.food'), emoji: '⏸️' },
  ];

  const victoriesCount = useMemo(() => {
    return celebratedVictories.reduce<Record<string, number>>((acc, victoryId) => {
      acc[victoryId] = (acc[victoryId] || 0) + 1;
      return acc;
    }, {});
  }, [celebratedVictories]);

  const handleVictory = async (victoryId: string) => {
    const currentCount = victoriesCount[victoryId] || 0;

    // "Slept well" is limited to one celebration per day.
    if (victoryId === 'bed' && currentCount > 0) return;

    try {
      await onVictoryPress(victoryId);

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    } catch (error) {
      console.error('Victory press error:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent
      onShow={() => StatusBar.setHidden(true, 'none')}
      onDismiss={() => StatusBar.setHidden(true, 'none')}
      onRequestClose={() => {
        StatusBar.setHidden(true, 'none');
        onClose();
      }}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t('today.Tiny Victories')} <Sparkles size={20} color={colors.primary} />
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t('today.Celebrate the small wins!')}
            </Text>
          </View>

          {/* Grid 2x4 */}
          <View style={styles.grid}>
            {victories.map((victory, index) => {
              const count = victoriesCount[victory.id] || 0;
              const isCelebrated = count > 0;
              const isDisabled = victory.id === 'bed' && count > 0;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    { 
                      backgroundColor: isCelebrated 
                        ? colors.primary + '20' 
                        : colors.background[0] 
                    }
                  ]}
                  onPress={() => handleVictory(victory.id)}
                  disabled={isDisabled}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`${victory.text}. ${count}`}
                >
                  <Text style={styles.emoji}>{victory.emoji}</Text>
                  <Text style={[styles.buttonText, { color: colors.text }]}>
                    {victory.text}
                  </Text>
                  {count > 0 && (
                    <View style={[styles.counterBadge, { backgroundColor: colors.primary }]}> 
                      <Text style={[styles.counterText, { color: colors.surface }]}>{count}</Text>
                    </View>
                  )}
                  {isCelebrated && (
                    <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Close button */}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.primary}]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
          >
            <Text style={[styles.closeText, { color: colors.surface }]}> 
              {t('common.close')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Confetti */}
        {showConfetti && (
          <View style={[styles.confettiContainer, { pointerEvents: 'none' }]}>
            <LottieView
              source={ConfettiJSON}
              autoPlay
              loop={false}
              speed={1.2}
              style={styles.confetti}
            />
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '90%',
    height: '90%',
    maxWidth: 350,
    maxHeight: 650,
    borderRadius: 24,
    padding: 24,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  button: {
    width: '48%',
    aspectRatio: 1.5,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    position: 'relative',
  },
  emoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 20,
  },
  counterBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti: {
    width: 400,
    height: 400,
  },
});