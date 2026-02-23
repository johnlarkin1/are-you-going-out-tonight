import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from './screens/OnboardingScreen';
import VoteScreen from './screens/VoteScreen';
import ResultsScreen from './screens/ResultsScreen';

export type Screen = 'onboarding' | 'vote' | 'results';

export default function App() {
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [userCity, setUserCity] = useState<string>('');
  const [userVote, setUserVote] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const city = await AsyncStorage.getItem('userCity');
    const onboarded = await AsyncStorage.getItem('onboarded');
    if (onboarded && city) {
      setUserCity(city);
      setScreen('vote');
    }
  };

  const handleOnboardingComplete = async (city: string) => {
    await AsyncStorage.setItem('onboarded', 'true');
    await AsyncStorage.setItem('userCity', city);
    setUserCity(city);
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
