import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

type FormFieldProps = {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
};

export function FormField({ label, children, error, required = false }: FormFieldProps) {
  const { t } = useTranslation();

  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-[11px] font-semibold uppercase text-fg-muted">
        {t(label)}
        {required && <Text className="text-danger"> *</Text>}
      </Text>
      {children}
      {error && (
        <Text className="mt-1 text-xs text-danger">{t(error)}</Text>
      )}
    </View>
  );
}
