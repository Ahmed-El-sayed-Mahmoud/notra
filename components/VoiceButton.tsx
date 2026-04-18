import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/constants/theme';
import { transcribeAudio } from '@/lib/openai';

type VoiceState = 'idle' | 'listening' | 'processing' | 'error';

interface Props {
  onTranscription: (text: string) => void;
  autoStart?: boolean;
  size?: number;
}

const RECORDING_OPTIONS: Audio.RecordingOptions = {
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: { mimeType: 'audio/webm', bitsPerSecond: 128000 },
};

const MAX_MS = 10_000;

export const VoiceButton = ({ onTranscription, autoStart = false, size = 44 }: Props) => {
  const { colors } = useTheme();
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  // Ref mirrors state so async callbacks always read the current value
  const vsRef = useRef<VoiceState>('idle');
  const set = (s: VoiceState) => { vsRef.current = s; setVoiceState(s); };

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef     = useRef<ReturnType<typeof setTimeout>>();

  const ringScale   = useSharedValue(1);
  const ringOpacity = useSharedValue(0);
  const btnScale    = useSharedValue(1);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  useEffect(() => {
    if (voiceState === 'listening') {
      ringScale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 0 }),
          withTiming(2.2, { duration: 900, easing: Easing.out(Easing.ease) })
        ),
        -1
      );
      ringOpacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 0 }),
          withTiming(0, { duration: 900 })
        ),
        -1
      );
    } else {
      cancelAnimation(ringScale);
      cancelAnimation(ringOpacity);
      ringScale.value = withSpring(1);
      ringOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [voiceState]);

  const stopAndTranscribe = useCallback(async () => {
    clearTimeout(timerRef.current);
    const recording = recordingRef.current;
    if (!recording) return;

    set('processing');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      try { deactivateKeepAwake('notra-rec'); } catch {}
      recordingRef.current = null;
      const uri = recording.getURI();
      if (!uri) throw new Error('No URI');

      const text = await transcribeAudio(uri);
      set('idle');
      if (text) onTranscription(text);
    } catch {
      set('error');
      setTimeout(() => set('idle'), 2500);
    }
  }, [onTranscription]);

  const startRecording = useCallback(async () => {
    if (vsRef.current === 'listening') { stopAndTranscribe(); return; }
    if (vsRef.current !== 'idle') return;

    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      Alert.alert('Microphone Access', 'Enable microphone in Settings to use voice input.');
      return;
    }

    try {
      try { await activateKeepAwakeAsync('notra-rec'); } catch {}
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(RECORDING_OPTIONS);
      recordingRef.current = recording;
      set('listening');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      timerRef.current = setTimeout(stopAndTranscribe, MAX_MS);
    } catch {
      set('error');
      setTimeout(() => set('idle'), 2500);
    }
  }, [stopAndTranscribe]);

  // Auto-start on mount when requested (FAB long press flow)
  useEffect(() => {
    if (autoStart) startRecording();
    return () => {
      clearTimeout(timerRef.current);
      recordingRef.current?.stopAndUnloadAsync().catch(() => {});
    };
  }, []);

  const isListening  = voiceState === 'listening';
  const isProcessing = voiceState === 'processing';
  const isError      = voiceState === 'error';

  const bgColor   = isListening ? '#FF475722' : isError ? colors.priority.high + '22' : colors.surface;
  const bdColor   = isListening ? '#FF4757'   : isError ? colors.priority.high       : colors.border;
  const iconColor = isListening ? '#FF4757'   : isError ? colors.priority.high       : colors.textSecondary;
  const iconName  = isListening ? 'mic' : isError ? 'alert-circle-outline' : 'mic-outline';

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Expanding ripple ring */}
      <Animated.View
        style={[
          { position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: '#FF4757' },
          ringStyle,
        ]}
      />

      <Animated.View style={btnStyle}>
        <Pressable
          onPress={startRecording}
          onPressIn={() => { btnScale.value = withSpring(0.88, { damping: 14, stiffness: 380 }); }}
          onPressOut={() => { btnScale.value = withSpring(1, { damping: 14, stiffness: 380 }); }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bgColor,
            borderWidth: 1.5,
            borderColor: bdColor,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {isProcessing
            ? <ActivityIndicator size="small" color={colors.primary} />
            : <Ionicons name={iconName as any} size={Math.round(size * 0.46)} color={iconColor} />
          }
        </Pressable>
      </Animated.View>
    </View>
  );
};
