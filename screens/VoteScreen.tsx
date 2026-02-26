import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Platform,
} from 'react-native';
import { getCityAbbr } from '../lib/cityUtils';

interface VoteScreenProps {
  onVote: (vote: boolean) => void;
  city: string;
}

export default function VoteScreen({ onVote, city }: VoteScreenProps) {
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

  const handlePress = (vote: boolean, scaleRef: Animated.Value) => {
    Animated.sequence([
      Animated.spring(scaleRef, { toValue: 0.93, useNativeDriver: true, tension: 200 }),
      Animated.spring(scaleRef, { toValue: 1, useNativeDriver: true, tension: 200 }),
    ]).start(() => onVote(vote));
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
          <Text style={styles.cityBadge}>📍 {getCityAbbr(city)}</Text>
        </View>

        {/* Center content */}
        <View style={styles.centerSection}>
          <Text style={styles.question}>are you going out tonight?</Text>
          <Text style={styles.questionNote}>let em know</Text>
        </View>

        <View style={styles.buttonsSection}>
          <Animated.View style={{ transform: [{ scale: yesScale }], flex: 1 }}>
            <TouchableOpacity
              style={styles.yesButton}
              onPress={() => handlePress(true, yesScale)}
              activeOpacity={1}
            >
              <Text style={styles.yesText}>yes</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: noScale }], flex: 1 }}>
            <TouchableOpacity
              style={styles.noButton}
              onPress={() => handlePress(false, noScale)}
              activeOpacity={1}
            >
              <Text style={styles.noText}>no</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Text style={styles.footer}>resets at midnight</Text>
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
  yesEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  noEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  yesText: {
    fontSize: 22,
    color: '#000000',
  },
  noText: {
    fontSize: 22,
    color: '#000000',
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#CCC',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
  },
});
