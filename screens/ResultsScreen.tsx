import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Platform,
  ScrollView,
} from 'react-native';
import { getCityAbbr } from '../lib/cityUtils';

interface ResultsScreenProps {
  userVote: boolean | null;
  city: string;
  onVoteAgain: () => void;
}

const generateResults = (city: string, userVote: boolean | null) => {
  const seed = city.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const baseYes = 35 + (seed % 40);
  const totalVotes = 120 + (seed % 800);
  const yesPercent = userVote === true ? Math.min(baseYes + 5, 75) : Math.max(baseYes - 5, 25);
  const noPercent = 100 - yesPercent;
  const yesVotes = Math.round((yesPercent / 100) * totalVotes);
  const noVotes = totalVotes - yesVotes;
  return { yesPercent, noPercent, yesVotes, noVotes, totalVotes };
};

const getResultHeadline = (yesPercent: number, userVote: boolean | null): { headline: string; sub: string } => {
  if (yesPercent >= 65) {
    return {
      headline: userVote ? "your city agrees" : "your city disagrees",
      sub: userVote ? "it's gonna be a big night." : "everyone's going out but you... respect.",
    };
  } else if (yesPercent >= 50) {
    return {
      headline: userVote ? "slight majority, you're in" : "it's split but you're staying in",
      sub: userVote ? "could go either way tonight." : "the couch has fans too.",
    };
  } else if (yesPercent >= 35) {
    return {
      headline: userVote ? "brave one, aren't you" : "the city agrees with you",
      sub: userVote ? "the city's mostly staying in but you said yes." : "quiet night.",
    };
  } else {
    return {
      headline: userVote ? "you're basically an icon rn" : "ghost town energy",
      sub: userVote ? "almost nobody's going out. you legend." : "everyone's staying in tonight.",
    };
  }
};

export default function ResultsScreen({ userVote, city, onVoteAgain }: ResultsScreenProps) {
  const results = generateResults(city, userVote);
  const { headline, sub } = getResultHeadline(results.yesPercent, userVote);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const yesBarAnim = useRef(new Animated.Value(0)).current;
  const noBarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.spring(yesBarAnim, {
          toValue: results.yesPercent / 100,
          tension: 40,
          friction: 8,
          useNativeDriver: false,
        }),
        Animated.spring(noBarAnim, {
          toValue: results.noPercent / 100,
          tension: 40,
          friction: 8,
          useNativeDriver: false,
        }),
      ]).start();
    }, 300);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onVoteAgain} style={styles.backButton} activeOpacity={0.6}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.cityBadge}>📍 {getCityAbbr(city)}</Text>
          </View>

          {/* Headline */}
          <View style={styles.headlineSection}>
            <Text style={styles.headline}>the city has spoken</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsCard}>
            {/* YES bar */}
            <View style={styles.barRow}>
              <View style={styles.barLabelRow}>
                <Text style={styles.barLabel}>going out</Text>
                <Text style={styles.barPercent}>{results.yesPercent}%</Text>
              </View>
              <View style={styles.barTrack}>
                <Animated.View
                  style={[
                    styles.barFill,
                    styles.barFillYes,
                    {
                      width: yesBarAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
            </View>

            {/* NO bar */}
            <View style={styles.barRow}>
              <View style={styles.barLabelRow}>
                <Text style={styles.barLabel}>staying in</Text>
                <Text style={styles.barPercent}>{results.noPercent}%</Text>
              </View>
              <View style={styles.barTrack}>
                <Animated.View
                  style={[
                    styles.barFill,
                    styles.barFillNo,
                    {
                      width: noBarAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
            </View>
          </View>

        </ScrollView>
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
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 60,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  backButton: {
    paddingVertical: 4,
  },
  backText: {
    fontSize: 15,
    color: '#111',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
    fontWeight: '500',
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
  headlineSection: {
    marginBottom: 20,
    marginTop: '50%',
  },
  headline: {
    fontSize: 38,
    fontWeight: '900',
    color: '#111111',
    letterSpacing: -1,
    lineHeight: 44,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
    marginBottom: 8,
  },
  headlineSub: {
    fontSize: 16,
    color: '#999',
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
  },
  statsCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginBottom: 32,
    paddingVertical: 25,
  },
  barRow: {
    marginBottom: 20,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 15,
    color: '#111',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
  },
  barPercent: {
    fontSize: 15,
    color: '#111',
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
  },
  barTrack: {
    height: 10,
    backgroundColor: '#E5E5E5',
    borderRadius: 100,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 100,
  },
  barFillYes: {
    backgroundColor: '#E8848A',
  },
  barFillNo: {
    backgroundColor: '#D1D1D1',
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#CCC',
    fontWeight: '500',
    marginBottom: 24,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
  },
  changeLinkContainer: {
    alignItems: 'center',
  },
  changeLink: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'underline',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
  },
});
