import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from './lib/tokenCache';
import { DeviceIdProvider, useDeviceIdStatus } from './lib/DeviceIdContext';
import OnboardingScreen from './screens/OnboardingScreen';
import VoteScreen from './screens/VoteScreen';
import ResultsScreen from './screens/ResultsScreen';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

export type Screen = 'onboarding' | 'vote' | 'results';

function AppContent() {
  const { isReady } = useDeviceIdStatus();
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [userCity, setUserCity] = useState<string>('');
  const [userVote, setUserVote] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const city = await AsyncStorage.getItem('userCity');
      const onboarded = await AsyncStorage.getItem('onboarded');
      if (onboarded && city) {
        setUserCity(city);
        setScreen('vote');
      }
    } catch {
      // AsyncStorage read failed — stay on onboarding
    }
  };

  const handleOnboardingComplete = async (city: string) => {
    try {
      await AsyncStorage.setItem('onboarded', 'true');
      await AsyncStorage.setItem('userCity', city);
    } catch {
      // AsyncStorage write failed — continue anyway
    }
    setUserCity(city);
    setScreen('vote');
  };

  const handleVote = (vote: boolean) => {
    setUserVote(vote);
    setScreen('results');
  };

  const handleAlreadyVoted = () => {
    // User already voted today — go straight to results
    setScreen('results');
  };

  const handleVoteAgain = () => {
    setUserVote(null);
    setScreen('vote');
  };

  // Block rendering until device ID is ready
  if (!isReady) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {screen === 'onboarding' && (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      )}
      {screen === 'vote' && (
        <VoteScreen onVote={handleVote} onAlreadyVoted={handleAlreadyVoted} city={userCity} />
      )}
      {screen === 'results' && (
        <ResultsScreen userVote={userVote} city={userCity} onVoteAgain={handleVoteAgain} />
      )}
    </View>
  );
}

export default function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <DeviceIdProvider>
        <AppContent />
      </DeviceIdProvider>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
