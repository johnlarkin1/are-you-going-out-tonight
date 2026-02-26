import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from './lib/tokenCache';
import OnboardingScreen from './screens/OnboardingScreen';
import AuthScreen from './screens/AuthScreen';
import VoteScreen from './screens/VoteScreen';
import ResultsScreen from './screens/ResultsScreen';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

export type Screen = 'onboarding' | 'auth' | 'vote' | 'results';

function AppContent() {
  const { isSignedIn, isLoaded } = useAuth();
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [userCity, setUserCity] = useState<string>('');
  const [userVote, setUserVote] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboarding();
  }, []);

  // When auth loads and user is signed in, advance past auth screen
  useEffect(() => {
    if (isLoaded && isSignedIn && screen === 'auth') {
      setScreen('vote');
    }
  }, [isLoaded, isSignedIn, screen]);

  const checkOnboarding = async () => {
    try {
      const city = await AsyncStorage.getItem('userCity');
      const onboarded = await AsyncStorage.getItem('onboarded');
      if (onboarded && city) {
        setUserCity(city);
        setScreen('auth');
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
    setScreen('auth');
  };

  const handleSignedIn = () => {
    setScreen('vote');
  };

  const handleVote = (vote: boolean) => {
    setUserVote(vote);
    setScreen('results');
  };

  const handleVoteAgain = () => {
    setUserVote(null);
    setScreen('vote');
  };

  // If auth hasn't loaded yet, show nothing (or a splash)
  if (!isLoaded) {
    return <View style={styles.container} />;
  }

  // If not signed in and past onboarding, force auth screen
  if (!isSignedIn && screen !== 'onboarding') {
    return (
      <View style={styles.container}>
        <AuthScreen onSignedIn={handleSignedIn} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {screen === 'onboarding' && (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      )}
      {screen === 'vote' && (
        <VoteScreen onVote={handleVote} city={userCity} />
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
      <AppContent />
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
