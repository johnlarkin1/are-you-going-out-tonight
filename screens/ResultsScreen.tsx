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
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { getCityAbbr } from '../lib/cityUtils';
import { fetchResults, ApiError } from '../lib/api';
import type { ResultsResponse } from '../lib/types';

interface ResultsScreenProps {
  userVote: boolean | null;
  city: string;
  onVoteAgain: () => void;
}

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
  const { getToken } = useAuth();
  const [results, setResults] = useState<ResultsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const yesBarAnim = useRef(new Animated.Value(0)).current;
  const noBarAnim = useRef(new Animated.Value(0)).current;

  const loadResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchResults(city, getToken);
      setResults(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  // Animate bars when results load
  useEffect(() => {
    if (!results) return;

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.spring(yesBarAnim, {
          toValue: results.yes_percent / 100,
          tension: 40,
          friction: 8,
          useNativeDriver: false,
        }),
        Animated.spring(noBarAnim, {
          toValue: results.no_percent / 100,
          tension: 40,
          friction: 8,
          useNativeDriver: false,
        }),
      ]).start();
    }, 300);
  }, [results]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E8848A" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadResults}>
            <Text style={styles.retryText}>try again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!results) return null;

  const { headline, sub } = results.total_votes > 0
    ? getResultHeadline(results.yes_percent, userVote)
    : { headline: "be the first", sub: "no votes yet — you're the pioneer." };

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onVoteAgain} style={styles.backButton} activeOpacity={0.6}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.cityBadge}>{getCityAbbr(city)}</Text>
          </View>

          {/* Headline — now using dynamic data */}
          <View style={styles.headlineSection}>
            <Text style={styles.headline}>{headline}</Text>
            <Text style={styles.headlineSub}>{sub}</Text>
          </View>

          {/* Stats */}
          {results.total_votes > 0 ? (
            <View style={styles.statsCard}>
              {/* YES bar */}
              <View style={styles.barRow}>
                <View style={styles.barLabelRow}>
                  <Text style={styles.barLabel}>going out</Text>
                  <Text style={styles.barPercent}>{results.yes_percent}%</Text>
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
                  <Text style={styles.barPercent}>{results.no_percent}%</Text>
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

              <Text style={styles.totalVotes}>
                {results.total_votes} vote{results.total_votes !== 1 ? 's' : ''} tonight
              </Text>
            </View>
          ) : (
            <View style={styles.statsCard}>
              <Text style={styles.emptyText}>no votes yet for {city}</Text>
              <Text style={styles.emptySubtext}>check back later to see results</Text>
            </View>
          )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B5C',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
  },
  retryButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
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
  totalVotes: {
    textAlign: 'center',
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
  },
  emptySubtext: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
  },
});
