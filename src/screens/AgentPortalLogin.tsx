import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Briefcase } from 'lucide-react-native';
import { tokens } from '../theme/tokens';
import { FormField } from '../components/FormField';
import { TextInput } from '../components/TextInput';
import { Button } from '../components/Button';
import { useAgentPortalAuth } from '../lib/agent-portal-auth-context';

export function AgentPortalLogin() {
  const { t } = useTranslation();
  const { login } = useAgentPortalAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(false);
    setLoading(true);
    // PROTO: fake latency to show loading state
    await new Promise((r) => setTimeout(r, 400));
    const ok = await login(email, password);
    setLoading(false);
    if (!ok) setError(true);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface-page"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-full max-w-sm">
          {/* Logo / brand area */}
          <View className="mb-10 items-center">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-brand">
              <Briefcase size={32} color={tokens.color.fg.inverse} />
            </View>
            <Text className="text-2xl font-bold text-fg">
              {t('agentPortal.login.title')}
            </Text>
            <Text className="mt-1 text-sm text-fg-muted">
              {t('agentPortal.login.subtitle')}
            </Text>
          </View>

          {/* Form */}
          <View className="rounded-3xl bg-surface p-6">
            <FormField label="agentPortal.login.emailLabel" required>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="agentPortal.login.emailPlaceholder"
                error={error}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                accessibilityLabel={t('agentPortal.login.emailLabel')}
              />
            </FormField>

            <FormField label="agentPortal.login.passwordLabel" required>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="agentPortal.login.passwordPlaceholder"
                error={error}
                secureTextEntry
                autoComplete="password"
                textContentType="password"
                accessibilityLabel={t('agentPortal.login.passwordLabel')}
              />
            </FormField>

            {error && (
              <Text className="mb-3 text-xs text-danger">
                {t('agentPortal.login.error')}
              </Text>
            )}

            <Button
              label="agentPortal.login.submit"
              onPress={handleLogin}
              loading={loading}
              disabled={!email || !password}
              size="lg"
            />

            <Text className="mt-4 text-center text-xs text-fg-muted">
              {t('agentPortal.login.forgotPassword')}
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
