import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { getCityAbbr } from '../lib/cityUtils';
import { submitVote, ApiError } from '../lib/api';

interface VoteScreenProps {
  onVote: (vote: boolean) => void;
  onAlreadyVoted: () => void;
  city: string;
}

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      // Get current time in ET
      const etParts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
      }).formatToParts(now);

      const h = parseInt(etParts.find((p) => p.type === 'hour')!.value);
      const m = parseInt(etParts.find((p) => p.type === 'minute')!.value);
      const s = parseInt(etParts.find((p) => p.type === 'second')!.value);

      const secsLeft = (23 - h) * 3600 + (59 - m) * 60 + (60 - s);
      const hh = Math.floor(secsLeft / 3600);
      const mm = Math.floor((secsLeft % 3600) / 60);
      const ss = secsLeft % 60;
      setTimeLeft(`${hh}h ${mm.toString().padStart(2, '0')}m ${ss.toString().padStart(2, '0')}s`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

export default function VoteScreen({ onVote, onAlreadyVoted, city }: VoteScreenProps) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const countdown = useCountdown();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const yesScale = useRef(new Animated.Value(1)).current;
  const noScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = async (vote: boolean, scaleRef: Animated.Value) => {
    if (loading) return;

    Animated.sequence([
      Animated.spring(scaleRef, { toValue: 0.93, useNativeDriver: true, tension: 200 }),
      Animated.spring(scaleRef, { toValue: 1, useNativeDriver: true, tension: 200 }),
    ]).start();

    setLoading(true);
    setError(null);

    try {
      await submitVote({ city, vote }, getToken);
      onVote(vote);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'ALREADY_VOTED') {
        onAlreadyVoted();
      } else {
        setError(err instanceof ApiError ? err.message : 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Top bar */}
        <View style={styles.topSection}>
          <Text style={styles.cityBadge}>{getCityAbbr(city)}</Text>
        </View>

        {/* Center content */}
        <View style={styles.centerSection}>
          <Text style={styles.question}>are you going out tonight?</Text>
          <Text style={styles.questionNote}>let em know</Text>
        </View>

        <View style={styles.buttonsSection}>
          <Animated.View style={{ transform: [{ scale: yesScale }], flex: 1 }}>
            <TouchableOpacity
              style={[styles.yesButton, loading && styles.buttonDisabled]}
              onPress={() => handlePress(true, yesScale)}
              activeOpacity={1}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.yesText}>yes</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: noScale }], flex: 1 }}>
            <TouchableOpacity
              style={[styles.noButton, loading && styles.buttonDisabled]}
              onPress={() => handlePress(false, noScale)}
              activeOpacity={1}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.noText}>no</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        {error && (
          <TouchableOpacity onPress={() => setError(null)}>
            <Text style={styles.errorText}>{error} — tap to dismiss</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footer}>resets in {countdown}</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 0,
  },
  cityBadge: {
    fontSize: 13,
    color: '#1B3A6B',
    fontWeight: '700',
    backgroundColor: 'rgba(27,58,107,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
    overflow: 'hidden',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: '30%',
  },
  question: {
    fontSize: 36,
    fontWeight: '900',
    color: '#111111',
    letterSpacing: -1,
    lineHeight: 42,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
    marginBottom: 16,
    textAlign: 'center',
  },
  questionNote: {
    fontSize: 15,
    color: '#999',
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
    marginBottom: 32,
    textAlign: 'center',
  },
  buttonsSection: {
    flexDirection: 'row',
    gap: 19,
    width: '75%',
    alignSelf: 'center',
    marginBottom: 200,
  },
  yesButton: {
    flex: 1,
    backgroundColor: '#F9BBBF',
    borderRadius: 20,
    paddingVertical: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F9BBBF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  noButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingVertical: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  yesText: {
    fontSize: 22,
    color: '#000000',
  },
  noText: {
    fontSize: 22,
    color: '#000000',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#FF3B5C',
    fontWeight: '500',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#CCC',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
  },
});
