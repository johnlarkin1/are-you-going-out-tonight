import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSSO, useSignIn, useSignUp } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

interface AuthScreenProps {
  onSignedIn: () => void;
}

export default function AuthScreen({ onSignedIn }: AuthScreenProps) {
  const { startSSOFlow } = useSSO();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOAuth = useCallback(async (strategy: 'oauth_apple' | 'oauth_google') => {
    setLoading(strategy);
    setError(null);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        onSignedIn();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      if (!message.includes('cancelled') && !message.includes('canceled')) {
        setError(message);
      }
    } finally {
      setLoading(null);
    }
  }, [startSSOFlow, onSignedIn]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>one last thing</Text>
          <Text style={styles.subtitle}>
            sign in so your vote counts{'\n'}(and nobody votes twice)
          </Text>
        </View>

        <View style={styles.buttons}>
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[styles.button, styles.appleButton]}
              onPress={() => handleOAuth('oauth_apple')}
              disabled={loading !== null}
              activeOpacity={0.85}
            >
              {loading === 'oauth_apple' ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={[styles.buttonText, styles.appleText]}> Continue with Apple</Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.googleButton]}
            onPress={() => handleOAuth('oauth_google')}
            disabled={loading !== null}
            activeOpacity={0.85}
          >
            {loading === 'oauth_google' ? (
              <ActivityIndicator color="#111111" />
            ) : (
              <Text style={[styles.buttonText, styles.googleText]}>Continue with Google</Text>
            )}
          </TouchableOpacity>

          {error && (
            <Text style={styles.error}>{error}</Text>
          )}
        </View>
      </View>
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
    paddingHorizontal: 32,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  subtitle: {
    fontSize: 17,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttons: {
    gap: 12,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  appleButton: {
    backgroundColor: '#FFFFFF',
  },
  googleButton: {
    backgroundColor: '#F5F5F5',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
  },
  appleText: {
    color: '#000000',
  },
  googleText: {
    color: '#111111',
  },
  error: {
    color: '#FF3B5C',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
  },
});
