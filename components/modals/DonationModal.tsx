import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '@/components/ThemeProvider';
import { useTextStyles } from '@/hooks/useTextStyles';
import { useTranslation } from 'react-i18next';

interface DonationModalProps {
  visible: boolean;
  onClose: () => void;
  walletAddress: string;
  network: string;
}

export function DonationModal({
  visible,
  onClose,
  walletAddress,
  network,
}: DonationModalProps) {
  const { colors } = useTheme();
  const textStyles = useTextStyles();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!visible) {
      setCopied(false);
    }
  }, [visible]);

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}> 
          <Text style={[textStyles.h2, styles.title, { color: colors.text }]}> 
            {t('settings.supportApp.donationTitle')}
          </Text>

          <Text style={[textStyles.caption, styles.description, { color: colors.textSecondary }]}> 
            {t('settings.supportApp.donationDesc')}
          </Text>

          <View style={[styles.qrContainer, { backgroundColor: colors.surface }]}> 
            <QRCode
              value={walletAddress}
              size={180}
              color={colors.text}
              backgroundColor={colors.surface}
            />
          </View>

          <Text style={[textStyles.caption, styles.networkInfo, { color: colors.textSecondary }]}> 
            {t('settings.supportApp.network')}: {network}
          </Text>

          <TouchableOpacity
            style={[styles.addressBox, { borderColor: colors.secondary, backgroundColor: colors.background[0] }]}
            onPress={copyToClipboard}
            activeOpacity={0.85}
          >
            <Text numberOfLines={1} style={[textStyles.caption, styles.addressText, { color: colors.text }]}> 
              {walletAddress}
            </Text>
            <Text style={[textStyles.caption, styles.copyLabel, { color: colors.primary }]}> 
              {copied ? t('settings.supportApp.copied') : t('settings.supportApp.tapToCopy')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.primary }]}
            onPress={onClose}
            activeOpacity={0.9}
          >
            <Text style={[textStyles.button, styles.closeButtonText]}>{t('common.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  qrContainer: {
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  networkInfo: {
    marginBottom: 10,
  },
  addressBox: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  addressText: {
    textAlign: 'center',
    marginBottom: 4,
  },
  copyLabel: {
    textAlign: 'center',
  },
  closeButton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 140,
  },
  closeButtonText: {
    textAlign: 'center',
  },
});
