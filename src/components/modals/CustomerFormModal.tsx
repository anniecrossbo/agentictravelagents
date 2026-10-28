import { useState, useEffect } from 'react';
import { View, Text, Pressable, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../theme/tokens';
import { Modal } from '../Modal';
import { FormField } from '../FormField';
import { TextInput } from '../TextInput';
import type { CustomerDetail } from '../../contracts/agent-portal-dashboard';

// PROTO: local-only CRUD — real implementation calls the agent portal API

type CustomerFormData = {
  name: string;
  email: string;
  phone: string;
  subtitle: string;
  isVip: boolean;
};

const EMPTY_FORM: CustomerFormData = {
  name: '',
  email: '',
  phone: '',
  subtitle: '',
  isVip: false,
};

function formFromCustomer(customer: CustomerDetail): CustomerFormData {
  return {
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    subtitle: customer.subtitle,
    isVip: customer.isVip,
  };
}

type CustomerFormModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: CustomerFormData) => void;
  customer?: CustomerDetail;
};

export function CustomerFormModal({
  visible,
  onClose,
  onSave,
  customer,
}: CustomerFormModalProps) {
  const { t } = useTranslation();
  const isEdit = !!customer;
  const [form, setForm] = useState<CustomerFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({});

  useEffect(() => {
    if (visible) {
      setForm(customer ? formFromCustomer(customer) : EMPTY_FORM);
      setErrors({});
    }
  }, [visible, customer]);

  const update = <K extends keyof CustomerFormData>(key: K, value: CustomerFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = 'agentPortal.customer.formNameRequired';
    if (!form.email.trim()) next.email = 'agentPortal.customer.formEmailRequired';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(form);
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={isEdit ? 'agentPortal.customer.editCustomer' : 'agentPortal.customer.addCustomer'}
    >
      <View className="w-[480px] max-w-full gap-1">
        <FormField label="agentPortal.customer.formName" required error={errors.name}>
          <TextInput
            value={form.name}
            onChangeText={(v) => update('name', v)}
            placeholder="agentPortal.customer.formName"
            error={!!errors.name}
          />
        </FormField>

        <FormField label="agentPortal.customer.formEmail" required error={errors.email}>
          <TextInput
            value={form.email}
            onChangeText={(v) => update('email', v)}
            placeholder="agentPortal.customer.formEmail"
            error={!!errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </FormField>

        <FormField label="agentPortal.customer.formPhone">
          <TextInput
            value={form.phone}
            onChangeText={(v) => update('phone', v)}
            placeholder="agentPortal.customer.formPhone"
            keyboardType="phone-pad"
          />
        </FormField>

        <FormField label="agentPortal.customer.formSubtitle">
          <TextInput
            value={form.subtitle}
            onChangeText={(v) => update('subtitle', v)}
            placeholder="agentPortal.customer.formSubtitlePlaceholder"
          />
        </FormField>

        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-[11px] font-semibold uppercase text-fg-muted">
            {t('agentPortal.customer.formVip')}
          </Text>
          <Switch
            value={form.isVip}
            onValueChange={(v) => update('isVip', v)}
            trackColor={{ false: tokens.color.border.DEFAULT, true: tokens.color.brand.DEFAULT }}
            accessibilityLabel={t('agentPortal.customer.formVip')}
          />
        </View>

        <View className="flex-row justify-end gap-3 border-t border-border pt-4">
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t('common.cancel')}
            className="rounded-lg border border-border px-5 py-2.5 active:opacity-70"
          >
            <Text className="text-sm font-semibold text-fg">{t('common.cancel')}</Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityLabel={t('common.save')}
            className="rounded-lg bg-brand px-5 py-2.5 active:opacity-80"
          >
            <Text className="text-sm font-semibold text-fg-inverse">{t('common.save')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export type { CustomerFormData };
