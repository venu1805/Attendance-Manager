import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  ScrollView, 
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useAlert } from '@/template';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

type AuthMode = 'login' | 'signup';

export default function LoginScreen() {
  const { signInWithPassword, signUpWithPassword, sendOTP, verifyOTPAndLogin, operationLoading } = useAuth();
  const { showAlert } = useAlert();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      showAlert('Missing Fields', 'Please enter email and password');
      return;
    }
    
    const { error } = await signInWithPassword(email, password);
    if (error) {
      showAlert('Login Failed', error);
    }
  }

  async function handleSendOTP() {
    if (!email) {
      showAlert('Missing Email', 'Please enter your email address');
      return;
    }
    
    if (!password || !confirmPassword) {
      showAlert('Missing Password', 'Please enter and confirm your password');
      return;
    }
    
    if (password !== confirmPassword) {
      showAlert('Password Mismatch', 'Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      showAlert('Weak Password', 'Password must be at least 6 characters');
      return;
    }
    
    const { error } = await sendOTP(email);
    if (error) {
      showAlert('Error', error);
      return;
    }
    
    setOtpSent(true);
    showAlert('OTP Sent', 'Verification code sent to your email');
  }

  async function handleVerifyOTP() {
    if (!otp) {
      showAlert('Missing OTP', 'Please enter the verification code');
      return;
    }
    
    const { error } = await verifyOTPAndLogin(email, otp, { password });
    if (error) {
      showAlert('Verification Failed', error);
      setOtpSent(false);
      setOtp('');
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="school" size={64} color={colors.primary} />
            </View>
            <Text style={styles.title}>BunkSmart</Text>
            <Text style={styles.subtitle}>Smart Attendance Management</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {mode === 'signup' && otpSent ? (
              // OTP Verification
              <>
                <Text style={styles.label}>Verification Code</Text>
                <TextInput
                  style={styles.input}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Enter 4-digit code"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="number-pad"
                  maxLength={4}
                  autoFocus
                />
                
                <Pressable
                  onPress={handleVerifyOTP}
                  disabled={operationLoading}
                  style={({ pressed }) => [
                    styles.button,
                    styles.primaryButton,
                    pressed && { opacity: 0.7 },
                    operationLoading && { opacity: 0.5 },
                  ]}
                >
                  <Text style={styles.primaryButtonText}>
                    {operationLoading ? 'Verifying...' : 'Verify & Sign Up'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setOtpSent(false);
                    setOtp('');
                  }}
                  style={styles.linkButton}
                >
                  <Text style={styles.linkText}>Back to Sign Up</Text>
                </Pressable>
              </>
            ) : (
              <>
                {/* Email */}
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="student@college.edu"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />

                {/* Password */}
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry
                  autoCapitalize="none"
                />

                {/* Confirm Password (Signup only) */}
                {mode === 'signup' && (
                  <>
                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Re-enter password"
                      placeholderTextColor={colors.textTertiary}
                      secureTextEntry
                      autoCapitalize="none"
                    />
                  </>
                )}

                {/* Submit Button */}
                <Pressable
                  onPress={mode === 'login' ? handleLogin : handleSendOTP}
                  disabled={operationLoading}
                  style={({ pressed }) => [
                    styles.button,
                    styles.primaryButton,
                    pressed && { opacity: 0.7 },
                    operationLoading && { opacity: 0.5 },
                  ]}
                >
                  <Text style={styles.primaryButtonText}>
                    {operationLoading 
                      ? (mode === 'login' ? 'Logging in...' : 'Sending OTP...') 
                      : (mode === 'login' ? 'Login' : 'Sign Up')
                    }
                  </Text>
                </Pressable>

                {/* Toggle Mode */}
                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleText}>
                    {mode === 'login' 
                      ? "Do not have an account? " 
                      : "Already have an account? "
                    }
                  </Text>
                  <Pressable onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
                    <Text style={styles.toggleLink}>
                      {mode === 'login' ? 'Sign Up' : 'Login'}
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.base,
    color: colors.textPrimary,
  },
  button: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: '#FFFFFF',
  },
  linkButton: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  linkText: {
    fontSize: typography.base,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  toggleText: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  toggleLink: {
    fontSize: typography.base,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
});
