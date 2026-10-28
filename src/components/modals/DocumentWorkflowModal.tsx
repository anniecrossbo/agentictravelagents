import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { StatusBadge } from '../StatusBadge';
import { TextInput } from '../TextInput';
import type { Document, DocumentStatus, DocumentType } from '../../lib/types';

type Mode = 'preview' | 'reject' | 'replace' | 'upload' | 'processing' | 'complete';

type DocumentWorkflowModalProps = {
  visible: boolean;
  onClose: () => void;
  bookingId: string;
  document?: Document;
  documentTypes: readonly DocumentType[];
};

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[140px] flex-1 gap-1">
      <Text className="text-[10px] font-semibold uppercase text-fg-muted">{label}</Text>
      <Text className="text-sm text-fg">{value || '—'}</Text>
    </View>
  );
}

function FileSelection({ selected, onSelect }: { selected: boolean; onSelect: () => void }) {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('document.workflow.selectSample')}
      onPress={onSelect}
      className={`rounded-xl border border-dashed p-4 ${selected ? 'border-positive bg-positive-bg' : 'border-border-input bg-surface-page'}`}
    >
      <Text className={`text-sm font-semibold ${selected ? 'text-positive' : 'text-fg'}`}>
        {selected ? t('document.workflow.sampleSelected') : t('document.workflow.selectSample')}
      </Text>
      <Text className="mt-1 text-xs text-fg-muted">sample-document.pdf · 1.4 MB · application/pdf</Text>
      <Text className="mt-2 text-[10px] text-fg-muted">{t('document.workflow.prototypeNotice')}</Text>
    </Pressable>
  );
}

export function DocumentWorkflowModal({
  visible,
  onClose,
  bookingId,
  document,
  documentTypes,
}: DocumentWorkflowModalProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>(document ? 'preview' : 'upload');
  const [status, setStatus] = useState<DocumentStatus>(document?.status ?? 'missing');
  const [reason, setReason] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState(documentTypes[0]?.id ?? '');
  const [fileSelected, setFileSelected] = useState(false);
  const [expiryDate, setExpiryDate] = useState(document?.expiryDate ?? '');
  const [resultMessage, setResultMessage] = useState('');

  useEffect(() => {
    setMode(document ? 'preview' : 'upload');
    setStatus(document?.status ?? 'missing');
    setReason('');
    setFileSelected(false);
    setExpiryDate(document?.expiryDate ?? '');
    setResultMessage('');
  }, [document?.id, visible]);

  const close = () => {
    setMode(document ? 'preview' : 'upload');
    onClose();
  };

  const finishMockAction = (message: string, nextStatus: DocumentStatus) => {
    setMode('processing');
    setTimeout(() => {
      setStatus(nextStatus);
      setResultMessage(message);
      setMode('complete');
    }, 700);
  };

  const selectedType = documentTypes.find((type) => type.id === selectedTypeId);
  const title = document
    ? mode === 'replace'
      ? 'document.workflow.replaceTitle'
      : mode === 'reject'
        ? 'document.workflow.rejectTitle'
        : 'document.workflow.previewTitle'
    : 'document.workflow.uploadTitle';

  return (
    <Modal
      visible={visible}
      onClose={mode === 'processing' ? () => {} : close}
      title={title}
      subtitle={document ? `${document.humanId} · ${document.type}` : bookingId}
      badge={document ? { label: `document.status.${status === 'under_review' ? 'underReview' : status}`, variant: status === 'approved' ? 'positive' : status === 'rejected' ? 'danger' : 'warning' } : undefined}
    >
      <View className="w-[700px] max-w-full gap-5">
        {mode === 'preview' && document && (
          <>
            <View className="items-center gap-2 rounded-xl border border-border bg-surface-page px-5 py-8">
              <Badge label="document.workflow.protectedPreview" variant="neutral" />
              <Text className="text-base font-semibold text-fg">{document.fileName}</Text>
              <Text className="max-w-[500px] text-center text-xs leading-5 text-fg-muted">
                {t('document.workflow.previewPrivacy')}
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-4">
              <Fact label={t('document.type')} value={document.type} />
              <Fact label={t('document.workflow.fileSize')} value={`${(document.fileSize / 1_000_000).toFixed(1)} MB`} />
              <Fact label={t('document.workflow.mimeType')} value={document.mimeType} />
              <Fact label={t('document.uploadedAt')} value={document.uploadedAt.slice(0, 16).replace('T', ' ')} />
              <Fact label={t('document.uploadedBy')} value={document.uploadedBy} />
              <Fact label={t('document.expiryDate')} value={document.expiryDate ?? t('common.none')} />
            </View>

            <View className="gap-2 border-t border-border pt-4">
              <Text className="text-[10px] font-semibold uppercase text-fg-muted">{t('document.workflow.versionHistory')}</Text>
              {document.versions.map((version) => (
                <View key={version.versionId} className="flex-row items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-fg">{version.versionId} · {version.fileName}</Text>
                    <Text className="text-xs text-fg-muted">{version.uploadedAt.slice(0, 16).replace('T', ' ')} · {version.uploadedBy}</Text>
                  </View>
                  <StatusBadge status={version.status === 'under_review' ? 'underReview' : version.status} type="document" />
                </View>
              ))}
            </View>

            <View className="flex-row flex-wrap gap-2 border-t border-border pt-4">
              {status === 'under_review' && (
                <>
                  <Button label="document.approve" onPress={() => finishMockAction(t('document.workflow.approvedResult'), 'approved')} />
                  <Button label="document.reject" variant="danger" onPress={() => setMode('reject')} />
                </>
              )}
              <Button label="document.replace" variant="secondary" onPress={() => setMode('replace')} />
              <Button label="common.close" variant="ghost" onPress={close} />
            </View>
          </>
        )}

        {mode === 'reject' && document && (
          <>
            <View className="rounded-xl bg-warning-bg p-4">
              <Text className="text-sm font-semibold text-warning">{t('document.workflow.rejectNotice')}</Text>
              <Text className="mt-1 text-xs text-warning">{t('document.workflow.rejectAudit')}</Text>
            </View>
            <TextInput value={reason} onChangeText={setReason} placeholder="document.rejectionReason" multiline numberOfLines={4} />
            <View className="flex-row gap-2">
              <Button label="document.workflow.confirmReject" variant="danger" disabled={!reason.trim()} onPress={() => finishMockAction(t('document.workflow.rejectedResult'), 'rejected')} />
              <Button label="common.back" variant="secondary" onPress={() => setMode('preview')} />
            </View>
          </>
        )}

        {(mode === 'upload' || mode === 'replace') && (
          <>
            {mode === 'upload' && (
              <View className="gap-2">
                <Text className="text-[10px] font-semibold uppercase text-fg-muted">{t('document.type')}</Text>
                <View className="flex-row flex-wrap gap-2">
                  {documentTypes.filter((type) => type.isActive).map((type) => (
                    <Pressable
                      key={type.id}
                      onPress={() => setSelectedTypeId(type.id)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: selectedTypeId === type.id }}
                      className={`rounded-pill border px-3 py-2 ${selectedTypeId === type.id ? 'border-brand bg-brand-light' : 'border-border-input'}`}
                    >
                      <Text className={`text-xs font-medium ${selectedTypeId === type.id ? 'text-brand' : 'text-fg'}`}>{type.name}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <FileSelection selected={fileSelected} onSelect={() => setFileSelected(true)} />

            <View className="flex-row flex-wrap gap-4 rounded-xl bg-surface-page p-4">
              <Fact label={t('document.workflow.allowedTypes')} value={(selectedType?.allowedFileTypes ?? ['application/pdf']).join(', ')} />
              <Fact label={t('document.workflow.maximumSize')} value={`${((selectedType?.maxFileSize ?? 10_000_000) / 1_000_000).toFixed(0)} MB`} />
              <Fact label={t('document.workflow.reviewRule')} value={(selectedType?.requiresReview ?? true) ? t('document.workflow.requiresReview') : t('document.workflow.autoAccepted')} />
            </View>

            <View className="gap-1.5">
              <Text className="text-[10px] font-semibold uppercase text-fg-muted">{t('document.expiryDate')}</Text>
              <TextInput value={expiryDate} onChangeText={setExpiryDate} placeholder="document.workflow.expiryPlaceholder" />
            </View>

            <View className="rounded-lg bg-warning-bg p-3">
              <Text className="text-xs leading-5 text-warning">
                {mode === 'replace' ? t('document.workflow.replaceNotice') : t('document.workflow.uploadNotice')}
              </Text>
            </View>

            <View className="flex-row gap-2 border-t border-border pt-4">
              <Button
                label={mode === 'replace' ? 'document.workflow.confirmReplace' : 'document.workflow.confirmUpload'}
                disabled={!fileSelected || (mode === 'upload' && !selectedTypeId)}
                onPress={() => finishMockAction(mode === 'replace' ? t('document.workflow.replacedResult') : t('document.workflow.uploadedResult'), 'under_review')}
              />
              <Button label="common.cancel" variant="secondary" onPress={() => document ? setMode('preview') : close()} />
            </View>
          </>
        )}

        {mode === 'processing' && (
          <View className="items-center gap-4 py-10">
            <ActivityIndicator size="large" />
            <Text className="text-sm font-semibold text-fg">{t('document.workflow.processing')}</Text>
            <Text className="text-xs text-fg-muted">{t('document.workflow.processingNotice')}</Text>
          </View>
        )}

        {mode === 'complete' && (
          <>
            <View className={`rounded-xl p-4 ${status === 'rejected' ? 'bg-warning-bg' : 'bg-positive-bg'}`}>
              <Text className={`text-sm font-semibold ${status === 'rejected' ? 'text-warning' : 'text-positive'}`}>{resultMessage}</Text>
              <Text className={`mt-1 text-xs ${status === 'rejected' ? 'text-warning' : 'text-positive'}`}>{t('document.workflow.mockPersistenceNotice')}</Text>
            </View>
            <View className="flex-row items-center gap-3 rounded-xl border border-border p-4">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-fg">{document?.fileName ?? 'sample-document.pdf'}</Text>
                <Text className="text-xs text-fg-muted">{document?.humanId ?? bookingId} · {selectedType?.name ?? document?.type}</Text>
              </View>
              <StatusBadge status={status === 'under_review' ? 'underReview' : status} type="document" />
            </View>
            <Button label="common.done" onPress={close} />
          </>
        )}
      </View>
    </Modal>
  );
}
