import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

const { width } = Dimensions.get('window');

const CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami',
  'London', 'Paris', 'Berlin', 'Tokyo', 'Sydney',
  'Toronto', 'Austin', 'Nashville', 'Denver', 'Atlanta',
  'Las Vegas', 'New Orleans', 'Seattle', 'Portland', 'Boston',
];

interface OnboardingScreenProps {
  onComplete: (city: string) => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState<'welcome' | 'city'>('welcome');
  const [selectedCity, setSelectedCity] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const fadeAnim = new Animated.Value(1);

  const goToCity = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setStep('city');
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setShowCustom(false);
  };

  const handleDone = () => {
    const finalCity = showCustom ? customCity : selectedCity;
    if (finalCity.trim()) {
      onComplete(finalCity.trim());
    }
  };

  const canProceed = showCustom ? customCity.trim().length > 0 : selectedCity.length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          {step === 'welcome' ? (
            <View style={styles.welcomeContainer}>
              <Text style={styles.emoji}>🎉</Text>
              <Text style={styles.title}>oh hey,{'\n'}you're here.</Text>
              <Text style={styles.subtitle}>
                every night, your city votes on{'\n'}one very important question.
              </Text>
              <Text style={styles.subSubtitle}>
                no DMs. no photos. no drama.{'\n'}just vibes.
              </Text>
              <TouchableOpacity style={styles.primaryButton} onPress={goToCity} activeOpacity={0.85}>
                <Text style={styles.primaryButtonText}>i'm intrigued 👀</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cityContainer}>
              <Text style={styles.cityTitle}>where you at?</Text>
              <Text style={styles.citySubtitle}>pick your city so we can show you local results</Text>

              <ScrollView
                style={styles.cityList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.cityListContent}
              >
                {CITIES.map((city) => (
                  <TouchableOpacity
                    key={city}
                    style={[
                      styles.cityChip,
                      selectedCity === city && !showCustom && styles.cityChipSelected,
                    ]}
                    onPress={() => handleCitySelect(city)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.cityChipText,
                        selectedCity === city && !showCustom && styles.cityChipTextSelected,
                      ]}
                    >
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={[styles.cityChip, showCustom && styles.cityChipSelected]}
                  onPress={() => { setShowCustom(true); setSelectedCity(''); }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.cityChipText, showCustom && styles.cityChipTextSelected]}>
                    ✏️ somewhere else
                  </Text>
                </TouchableOpacity>

                {showCustom && (
                  <TextInput
                    style={styles.customInput}
                    placeholder="type your city..."
                    placeholderTextColor="#999"
                    value={customCity}
                    onChangeText={setCustomCity}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleDone}
                  />
                )}
              </ScrollView>

              <TouchableOpacity
                style={[styles.primaryButton, !canProceed && styles.primaryButtonDisabled]}
                onPress={handleDone}
                disabled={!canProceed}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>let's go 🚀</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  container: {
    flex: 1,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 48,
    letterSpacing: -1,
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  subtitle: {
    fontSize: 18,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 12,
  },
  subSubtitle: {
    fontSize: 15,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 48,
  },
  primaryButton: {
    backgroundColor: '#FF3B5C',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 100,
    alignSelf: 'stretch',
    alignItems: 'center',
    shadowColor: '#FF3B5C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonDisabled: {
    backgroundColor: '#444',
    shadowOpacity: 0,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cityContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  cityTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  citySubtitle: {
    fontSize: 15,
    color: '#888',
    marginBottom: 24,
  },
  cityList: {
    flex: 1,
  },
  cityListContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 20,
  },
  cityChip: {
    borderWidth: 1.5,
    borderColor: '#333',
    borderRadius: 100,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#1A1A1A',
  },
  cityChipSelected: {
    borderColor: '#FF3B5C',
    backgroundColor: 'rgba(255, 59, 92, 0.15)',
  },
  cityChipText: {
    color: '#AAAAAA',
    fontSize: 14,
    fontWeight: '600',
  },
  cityChipTextSelected: {
    color: '#FF3B5C',
  },
  customInput: {
    borderWidth: 1.5,
    borderColor: '#FF3B5C',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    color: '#FFFFFF',
    fontSize: 16,
    backgroundColor: '#1A1A1A',
    marginTop: 4,
    width: '100%',
  },
});
