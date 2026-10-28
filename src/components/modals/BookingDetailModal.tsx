import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  View,
  Text,
  useWindowDimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MessageSquareText } from 'lucide-react-native';
import { tokens } from '../../theme/tokens';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { SegmentedTabs } from '../SegmentedTabs';
import { TextInput } from '../TextInput';
import { Tag } from '../Tag';
import { BookingSummaryPanel } from '../BookingSummaryPanel';
import { TabHeading } from '../TabHeading';
import { DetailFieldCard } from '../DetailFieldCard';
import { PillButton } from '../PillButton';
import { InfoBanner } from '../InfoBanner';
import { EmptyCard } from '../EmptyCard';
import { DocumentCard } from '../DocumentCard';
import { TimelineCard } from '../TimelineCard';
import { NoteCard } from '../NoteCard';
import { ReplyBar } from '../ReplyBar';
import { ChannelPicker } from '../ChannelPicker';
import { AiSummaryCard } from '../AiSummaryCard';
import { DocumentWorkflowModal } from './DocumentWorkflowModal';
import { countryName } from '../../lib/countries';
import {
  bookingNotesFeed,
  bookingStateBadge,
  buildBookingTimeline,
  formatMoney,
  needsHotelReview,
  nightsBetween,
  type BookingNote,
} from '../../lib/booking-view';
import { shortDate, shortDateTime, stayRangeWithYear, weekdayDate } from '../../lib/dates';
import { documentCardView } from '../../lib/agent-profile';
import { resolveTab } from '../../lib/routes';
import { replyChannelFor, type SummaryView } from '../../lib/conversation-view';
import type {
  BookingRequest,
  Document,
  DocumentType,
  VoucherInstance,
  Message,
  MessageChannel,
} from '../../lib/types';
import type { MockGuest } from '../../mocks';

type BookingDetailModalProps = {
  visible: boolean;
  onClose: () => void;
  booking: BookingRequest;
  guest?: MockGuest;
  agencyName?: string;
  roomTypeName?: string;
  rateCodeName?: string;
  documents: readonly Document[];
  documentTypes?: readonly DocumentType[];
  /** Messages on this booking's conversations (§7.12 Communications). */
  messages?: readonly Message[];
  agentName?: string;
  voucher?: VoucherInstance;
  onGenerateVoucher?: () => void;
  /** Tab named by the route (§22.2 "selected tab is addressable"). */
  initialTab?: string;
  /** Property business date, for document expiry. Falls back to the booking's last update. */
  businessDate?: string;
  /** Total stays on file for the guest, including this one. */
  guestStayCount?: number;
  /** AI (or fallback) digest of the agent ↔ hotel thread on this booking. */
  threadSummary?: SummaryView;
};

type TabKey = 'stay' | 'guest' | 'documents' | 'timeline' | 'voucher' | 'notes';

const TABS: { key: TabKey; labelKey: string }[] = [
  { key: 'stay', labelKey: 'booking.tabs.stay' },
  { key: 'guest', labelKey: 'booking.tabs.guest' },
  { key: 'documents', labelKey: 'booking.tabs.documents' },
  { key: 'timeline', labelKey: 'booking.tabs.timeline' },
  { key: 'voucher', labelKey: 'booking.tabs.voucher' },
  { key: 'notes', labelKey: 'booking.tabs.notes' },
];

/** Old links to the retired Messages tab land on Notes, which now holds the thread. */
function tabFromRoute(requested: string | undefined): TabKey {
  const mapped = requested === 'communications' ? 'notes' : requested;
  return resolveTab(mapped, TABS.map((x) => x.key), 'stay') as TabKey;
}

/** Below this width the two panes stack and the whole body scrolls. */
const SPLIT_MIN_WIDTH = 900;
/** Body height: 0.8x the design's 638, matching the other detail sheets. */
const BODY_HEIGHT = 510;

function Field({ labelKey, value }: { labelKey: string; value: string }) {
  const { t } = useTranslation();
  return (
    <View className="min-w-[140px] flex-1 gap-1">
      <Text className="text-[10px] font-semibold uppercase text-fg-muted">
        {t(labelKey)}
      </Text>
      <Text className="text-sm text-fg">{value || t('common.none')}</Text>
    </View>
  );
}

export function BookingDetailModal({
  visible,
  onClose,
  booking,
  guest,
  agencyName,
  roomTypeName,
  rateCodeName,
  documents,
  documentTypes = [],
  messages = [],
  agentName,
  voucher,
  onGenerateVoucher,
  initialTab,
  businessDate,
  guestStayCount,
  threadSummary,
}: BookingDetailModalProps) {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const [tab, setTab] = useState<TabKey>(() => tabFromRoute(initialTab));
  const [reply, setReply] = useState('');
  const [replyChannel, setReplyChannel] = useState<MessageChannel>(() => replyChannelFor(messages));
  // PROTO: replies live in local state only; real build posts via the communication service
  const [sentReplies, setSentReplies] = useState<BookingNote[]>([]);
  const [rejectReason, setRejectReason] = useState('');
  const [changeRequest, setChangeRequest] = useState('');
  const [pendingAction, setPendingAction] = useState<'reject' | 'changes' | null>(null);
  const [flow, setFlow] = useState<
    'detail' | 'preflight' | 'processing' | 'success' | 'failure' | 'reconciliation'
  >('detail');
  const [documentWorkflow, setDocumentWorkflow] = useState<{ document?: Document } | null>(null);

  const guestName = guest ? `${guest.firstName} ${guest.lastName}` : booking.humanId;
  const nights = nightsBetween(booking.checkIn, booking.checkOut);
  const money = formatMoney(booking.totalAmount, booking.currency);
  const needsReview = needsHotelReview(booking.state);
  const operationKey = `${booking.id}-v${booking.currentVersion}`;
  const mockConfirmationId = `HC-${booking.humanId.slice(-4)}${booking.currentVersion}`;

  useEffect(() => {
    setTab(tabFromRoute(initialTab));
    setPendingAction(null);
    setReply('');
    setReplyChannel(replyChannelFor(messages));
    setSentReplies([]);
    setFlow('detail');
    setRejectReason('');
    setChangeRequest('');
  }, [booking.id, initialTab]);

  const close = () => {
    setFlow('detail');
    onClose();
  };

  const confirmApproval = () => {
    setFlow('processing');
    setTimeout(() => setFlow('success'), 1100);
  };

  if (flow !== 'detail') {
    return (
      <Modal
        visible={visible}
        onClose={flow === 'processing' ? () => {} : close}
        title={
          flow === 'preflight'
            ? 'booking.approval.preflightTitle'
            : flow === 'success'
              ? 'booking.approval.successTitle'
              : flow === 'failure'
                ? 'booking.approval.failureTitle'
                : flow === 'reconciliation'
                  ? 'booking.approval.reconciliationTitle'
                  : 'booking.approval.processingTitle'
        }
        subtitle={`${booking.humanId} · ${guestName}`}
        badge={flow === 'success' ? { label: 'booking.state.confirmed', variant: 'positive' } : undefined}
      >
        <View className="w-[680px] max-w-full gap-5">
          {flow === 'preflight' && (
            <>
              <View className="rounded-xl bg-warning-bg p-4">
                <Text className="text-sm font-semibold text-warning">{t('booking.approval.noHoldTitle')}</Text>
                <Text className="mt-1 text-xs leading-5 text-warning">{t('booking.approval.noHoldBody')}</Text>
              </View>

              <View className="gap-3">
                <Text className="text-[10px] font-semibold uppercase text-fg-muted">
                  {t('booking.approval.reviewedSnapshot')}
                </Text>
                <View className="flex-row flex-wrap gap-4 rounded-xl border border-border p-4">
                  <Field labelKey="booking.versionLabel" value={String(booking.currentVersion)} />
                  <Field labelKey="booking.checkIn" value={booking.checkIn} />
                  <Field labelKey="booking.checkOut" value={booking.checkOut} />
                  <Field labelKey="booking.roomType" value={roomTypeName ?? booking.roomTypeId} />
                  <Field labelKey="booking.rateCode" value={rateCodeName ?? booking.rateCodeId} />
                  <Field labelKey="booking.totalValue" value={money} />
                </View>
              </View>

              <View className="gap-2">
                {[
                  t('booking.approval.checkAvailability'),
                  t('booking.approval.checkRate'),
                  t('booking.approval.checkRestrictions'),
                  t('booking.approval.checkProfile'),
                  t('booking.approval.checkDocuments'),
                ].map((item) => (
                  <View key={item} className="flex-row items-center gap-2">
                    <View className="h-2 w-2 rounded-pill bg-positive" />
                    <Text className="text-sm text-fg">{item}</Text>
                  </View>
                ))}
              </View>

              <View className="flex-row flex-wrap gap-2 border-t border-border pt-4">
                <Button label="booking.approval.confirm" onPress={confirmApproval} />
                <Button label="booking.actions.requestChanges" variant="secondary" onPress={() => { setFlow('detail'); setPendingAction('changes'); }} />
                <Button label="common.cancel" variant="ghost" onPress={() => setFlow('detail')} />
              </View>
            </>
          )}

          {flow === 'processing' && (
            <View className="items-center gap-5 py-8">
              <ActivityIndicator size="large" />
              <View className="items-center gap-1">
                <Text className="text-base font-semibold text-fg">{t('booking.approval.processingBody')}</Text>
                <Text className="text-xs text-fg-muted">{t('booking.approval.operationKey')}: {operationKey}</Text>
              </View>
              <View className="w-full gap-2 rounded-xl bg-surface-page p-4">
                <Text className="text-sm text-positive">✓ {t('booking.approval.validated')}</Text>
                <Text className="text-sm text-positive">✓ {t('booking.approval.profileResolved')}</Text>
                <Text className="text-sm text-brand">• {t('booking.approval.awaitingOpera')}</Text>
              </View>
            </View>
          )}

          {flow === 'success' && (
            <>
              <View className="rounded-xl bg-positive-bg p-4">
                <Text className="text-sm font-semibold text-positive">{t('booking.approval.successBody')}</Text>
                <Text className="mt-1 text-xs text-positive">{t('booking.approval.confirmedOnlyAfterOpera')}</Text>
              </View>
              <View className="flex-row flex-wrap gap-4 rounded-xl border border-border p-4">
                <Field labelKey="booking.operaId" value={mockConfirmationId} />
                <Field labelKey="booking.versionLabel" value={String(booking.currentVersion)} />
                <Field labelKey="booking.totalValue" value={money} />
                <Field labelKey="booking.approval.operationKey" value={operationKey} />
              </View>
              <View className="flex-row gap-2 border-t border-border pt-4">
                {onGenerateVoucher && <Button label="voucher.generate" onPress={() => { close(); onGenerateVoucher(); }} />}
                <Button label="booking.approval.returnToBookings" variant="secondary" onPress={close} />
              </View>
            </>
          )}

          {flow === 'failure' && (
            <>
              <View className="rounded-xl bg-warning-bg p-4">
                <Text className="text-sm font-semibold text-warning">{t('booking.approval.failureBody')}</Text>
                <Text className="mt-1 text-xs leading-5 text-warning">{booking.notes}</Text>
              </View>
              <View className="flex-row flex-wrap gap-4 rounded-xl border border-border p-4">
                <Field labelKey="booking.approval.correlationId" value={booking.operaCorrelationId ?? 'Pending'} />
                <Field labelKey="booking.state.operaCreationFailed" value={t('booking.approval.reservationUnchanged')} />
              </View>
              <View className="flex-row gap-2 border-t border-border pt-4">
                <Button label="booking.actions.retryOpera" onPress={confirmApproval} />
                <Button label="common.back" variant="secondary" onPress={() => setFlow('detail')} />
              </View>
            </>
          )}

          {flow === 'reconciliation' && (
            <>
              <View className="rounded-xl bg-warning-bg p-4">
                <Text className="text-sm font-semibold text-warning">{t('booking.approval.reconciliationBody')}</Text>
                <Text className="mt-1 text-xs leading-5 text-warning">{t('booking.approval.noDuplicateWarning')}</Text>
              </View>
              <View className="flex-row flex-wrap gap-4 rounded-xl border border-border p-4">
                <Field labelKey="booking.approval.operationKey" value={operationKey} />
                <Field labelKey="booking.approval.correlationId" value={booking.operaCorrelationId ?? 'Unknown'} />
                <Field labelKey="common.lastUpdated" value={booking.updatedAt.slice(0, 16).replace('T', ' ')} />
              </View>
              <View className="flex-row gap-2 border-t border-border pt-4">
                <Button label="booking.approval.reconcile" onPress={confirmApproval} />
                <Button label="common.back" variant="secondary" onPress={() => setFlow('detail')} />
              </View>
            </>
          )}
        </View>
      </Modal>
    );
  }


  const isSplit = width >= SPLIT_MIN_WIDTH;
  const bodyHeight = Math.min(BODY_HEIGHT, height - 160);
  const none = t('common.none');
  const sourceLabel =
    agencyName ?? agentName ?? t('booking.sourceAgent');
  const asOf = businessDate ?? booking.updatedAt.slice(0, 10);
  const isReturning = (guestStayCount ?? 0) > 1;
  const isConfirmedInOpera = Boolean(booking.operaConfirmationId);
  const firstName = agentName?.split(' ')[0];

  const notes = useMemo(
    () => [...bookingNotesFeed(booking, messages), ...sentReplies],
    [booking, messages, sentReplies],
  );

  const sendReply = () => {
    const content = reply.trim();
    if (!content) return;
    setSentReplies((r) => [
      ...r,
      {
        id: `local-${r.length}`,
        author: 'hotel',
        at: new Date().toISOString(),
        content,
        channel: replyChannel,
      },
    ]);
    setReply('');
  };

  const tabContent = (
    <View className="gap-5">
      {tab === 'stay' && (
        <>
          <TabHeading
            title={t('booking.detail.stayHeading')}
            subtitle={t('booking.detail.staySubheading')}
          />
          <View className="gap-3">
            <Text className="text-sm font-semibold text-fg">{t('booking.detail.stay')}</Text>
            <DetailFieldCard
              surface="solid"
              columns={4}
              fields={[
                { label: t('booking.checkIn'), value: weekdayDate(booking.checkIn) },
                { label: t('booking.checkOut'), value: weekdayDate(booking.checkOut) },
                { label: t('booking.nightsLabel'), value: String(nights) },
                {
                  label: t('booking.occupancy'),
                  value: t('booking.detail.occupancyValue', {
                    adults: t('booking.detail.adultCount', { count: booking.adults }),
                    children: t('booking.detail.childCount', { count: booking.children }),
                  }),
                },
              ]}
            />
          </View>
          <View className="gap-3">
            <Text className="text-sm font-semibold text-fg">{t('booking.detail.pricing')}</Text>
            <DetailFieldCard
              surface="solid"
              columns={4}
              fields={[
                {
                  label: t('booking.pricePerNight'),
                  value: formatMoney(booking.totalAmount / Math.max(nights, 1), booking.currency),
                },
                { label: t('booking.totalValue'), value: money },
                { label: t('booking.versionLabel'), value: String(booking.currentVersion) },
                { label: t('booking.rateCode'), value: rateCodeName ?? booking.rateCodeId },
              ]}
            />
          </View>
          <View className="gap-3">
            <Text className="text-sm font-semibold text-fg">{t('booking.detail.requestsNotes')}</Text>
            <DetailFieldCard
              surface="solid"
              fields={[
                { label: t('booking.specialRequests'), value: booking.specialRequests || none },
                {
                  label: t('booking.detail.hotelNotes'),
                  value:
                    guest?.isVip || isReturning ? (
                      <View className="flex-row flex-wrap items-center gap-1.5">
                        {guest?.isVip && <Tag labelKey="guest.vip" tone="vip" shape="pill" />}
                        {isReturning && (
                          <Text className="text-xs font-semibold text-fg">
                            {t('booking.detail.returningClient')}
                          </Text>
                        )}
                      </View>
                    ) : (
                      none
                    ),
                },
              ]}
            />
          </View>
        </>
      )}

      {tab === 'guest' && (
        <>
          <TabHeading
            title={t('booking.detail.guestHeading')}
            subtitle={t('booking.detail.guestSubheading')}
          />
          {guest ? (
            <>
              <View className="gap-3">
                <Text className="text-sm font-semibold text-fg">{t('booking.detail.leadGuest')}</Text>
                <DetailFieldCard
                  surface="solid"
                  columns={3}
                  fields={[
                    { label: t('guest.firstName'), value: guest.firstName || none },
                    { label: t('guest.lastName'), value: guest.lastName || none },
                    { label: t('guest.nationality'), value: countryName(guest.nationality) || none },
                    { label: t('guest.email'), value: guest.email || none },
                    { label: t('guest.phone'), value: guest.phone || none },
                    { label: t('guest.passport'), value: guest.passportNumber || none },
                  ]}
                />
              </View>
              <View className="gap-3">
                <Text className="text-sm font-semibold text-fg">{t('booking.detail.profile')}</Text>
                <View className="flex-row flex-wrap items-center gap-2 rounded-md bg-surface px-4 py-3">
                  {guest.isVip && <Tag labelKey="guest.vip" tone="vip" shape="pill" />}
                  {isReturning && (
                    <Tag labelKey="booking.detail.returningGuest" tone="brand" shape="pill" />
                  )}
                  <Tag
                    labelKey={isConfirmedInOpera ? 'guest.matched' : 'guest.unmatched'}
                    tone={isConfirmedInOpera ? 'positive' : 'muted'}
                    shape="pill"
                  />
                  <View className="flex-1" />
                  {!isConfirmedInOpera && (
                    // PROTO: profile matching isn't wired; real build opens the OPERA profile search
                    <Pressable
                      onPress={() => {}}
                      accessibilityRole="button"
                      hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                    >
                      <Text className="text-[11px] font-semibold text-brand">
                        {t('booking.detail.matchProfile')} →
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </>
          ) : (
            <EmptyCard title={t('booking.detail.noGuest')} />
          )}
        </>
      )}

      {tab === 'documents' && (
        <>
          <TabHeading
            title={t('booking.documents')}
            subtitle={t('booking.detail.documentsSubheading')}
            action={<PillButton label={t('document.upload')} onPress={() => setDocumentWorkflow({})} />}
          />
          <InfoBanner title={t('document.workflow.uploadNotice')} />
          {documents.length > 0 ? (
            <View className="gap-2">
              {documents.map((doc) => {
                const view = documentCardView(doc, asOf);
                return (
                  <Pressable
                    key={doc.id}
                    onPress={() => setDocumentWorkflow({ document: doc })}
                    accessibilityRole="button"
                    accessibilityLabel={`${doc.type} · ${doc.fileName}`}
                    className="active:opacity-80"
                  >
                    <DocumentCard
                      title={view.title}
                      fileLine={t('agent.profile.docFileLine', {
                        fileName: view.fileName,
                        date: view.uploadedOn,
                      })}
                      status={view.status}
                      tags={view.tags}
                    />
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <EmptyCard
              title={t('booking.detail.noDocuments')}
              body={t('booking.detail.noDocumentsBody')}
            />
          )}
        </>
      )}

      {tab === 'timeline' && (
        <>
          <TabHeading
            title={t('booking.timeline')}
            subtitle={t('booking.detail.timelineSubheading')}
          />
          <TimelineCard
            items={buildBookingTimeline(booking).map((e) => ({
              key: e.key,
              kind: e.kind,
              title: t(e.titleKey),
              detail:
                e.kind === 'next'
                  ? t('booking.detail.nextStep', { detail: e.detailKey ? t(e.detailKey) : '' })
                  : e.key === 'submitted' && (agentName || agencyName)
                    ? t('booking.detail.timelineBy', {
                        date: shortDateTime(e.at ?? ''),
                        name: [agentName, agencyName].filter(Boolean).join(', '),
                      })
                    : [e.at ? shortDateTime(e.at) : '', e.detailKey ? t(e.detailKey, e.detailParams) : '']
                        .filter(Boolean)
                        .join(' · '),
            }))}
          />
        </>
      )}

      {tab === 'voucher' && (
        <>
          <TabHeading
            title={t('voucher.title')}
            subtitle={t('booking.detail.voucherSubheading')}
            action={
              <PillButton
                label={t('voucher.generateFor')}
                onPress={isConfirmedInOpera && onGenerateVoucher ? onGenerateVoucher : undefined}
              />
            }
          />
          {!isConfirmedInOpera && (
            <InfoBanner
              tone="caution"
              title={t('voucher.blockedNotConfirmed')}
              body={t('booking.detail.voucherBlockedBody')}
            />
          )}
          {voucher ? (
            <DetailFieldCard
              surface="solid"
              columns={4}
              fields={[
                { label: t('booking.detail.voucherId'), value: voucher.humanId },
                {
                  label: t('common.status'),
                  value: (
                    <Tag
                      labelKey={`voucher.instance.state.${voucher.state.charAt(0).toLowerCase()}${voucher.state.slice(1)}`}
                      tone="brand"
                      shape="pill"
                    />
                  ),
                },
                { label: t('voucher.templateVersion'), value: `v${voucher.templateVersion}` },
                { label: t('voucher.generatedAt'), value: shortDate(voucher.generatedAt) },
              ]}
            />
          ) : (
            <EmptyCard
              title={t('voucher.empty')}
              body={t(
                isConfirmedInOpera ? 'booking.detail.voucherReadyBody' : 'booking.detail.noVouchersBody',
              )}
            />
          )}
        </>
      )}

      {tab === 'notes' && (
        <>
          <TabHeading
            title={t('booking.detail.notesHeading')}
            subtitle={
              agencyName
                ? t('booking.detail.notesSubheading', { agency: agencyName })
                : t('booking.detail.notesSubheadingDirect')
            }
          />
          {threadSummary && <AiSummaryCard view={threadSummary} />}
          {notes.length === 0 && <EmptyCard title={t('booking.detail.noNotes')} />}
          {notes.map((n) => (
            <NoteCard
              key={n.id}
              fromHotel={n.author === 'hotel'}
              channel={n.channel}
              author={
                n.author === 'hotel'
                  ? t('booking.detail.hotelAuthor')
                  : (agentName ?? agencyName ?? t('booking.sourceAgent'))
              }
              meta={[n.author === 'agent' ? agencyName : undefined, shortDateTime(n.at)]
                .filter(Boolean)
                .join(' · ')}
              body={n.content}
            />
          ))}
          <ChannelPicker value={replyChannel} onChange={setReplyChannel} />
          <ReplyBar
            value={reply}
            onChangeText={setReply}
            onSend={sendReply}
            placeholder={
              firstName
                ? t('booking.detail.replyTo', { name: firstName })
                : t('booking.detail.replyGeneric')
            }
            sendLabel={t('booking.detail.send')}
          />
          <Text className="text-[10px] text-fg-muted">{t('booking.notesSection.notAGuarantee')}</Text>
        </>
      )}
    </View>
  );

  const reviewActions = (needsReview || booking.state === 'OperaCreationFailed') && (
    <View className="gap-3 border-t border-chip-neutralBg px-5.5 pb-4.5 pt-4">
      {needsReview && (
        <>
          <Text className="text-[10px] font-semibold uppercase text-fg-muted">
            {t('booking.detail.reviewTitle')}
          </Text>
          <Text className="text-[11px] leading-4 text-fg-muted">{t('booking.noHoldWarning')}</Text>
          {pendingAction === 'reject' && (
            <TextInput
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="booking.rejectReason"
              multiline
            />
          )}
          {pendingAction === 'changes' && (
            <TextInput
              value={changeRequest}
              onChangeText={setChangeRequest}
              placeholder="booking.requestedChanges"
              multiline
            />
          )}
          <View className="gap-2">
            {pendingAction === null ? (
              <>
                {/* PROTO: approval runs the no-hold OPERA sequence in production */}
                <Button label="booking.actions.approve" onPress={() => setFlow('preflight')} />
                <Button
                  label="booking.actions.requestChanges"
                  variant="secondary"
                  onPress={() => setPendingAction('changes')}
                />
                <Button
                  label="booking.actions.reject"
                  variant="danger"
                  onPress={() => setPendingAction('reject')}
                />
              </>
            ) : (
              <>
                <Button
                  label={pendingAction === 'reject' ? 'booking.confirmReject' : 'booking.confirmRequestChanges'}
                  variant={pendingAction === 'reject' ? 'danger' : 'primary'}
                  disabled={(pendingAction === 'reject' ? rejectReason : changeRequest).trim().length === 0}
                  onPress={close}
                />
                <Button label="common.cancel" variant="secondary" onPress={() => setPendingAction(null)} />
              </>
            )}
          </View>
        </>
      )}

      {booking.state === 'OperaCreationFailed' && (
        <>
          <View className="rounded-md bg-warning-bg p-3">
            <Text className="text-xs font-semibold text-warning">
              {booking.notes.toLowerCase().includes('timeout')
                ? t('booking.approval.reconciliationTitle')
                : t('booking.approval.failureTitle')}
            </Text>
            <Text className="mt-1 text-[11px] text-warning">{booking.notes}</Text>
          </View>
          <Button
            label={
              booking.notes.toLowerCase().includes('timeout')
                ? 'booking.approval.openReconciliation'
                : 'booking.actions.retryOpera'
            }
            onPress={() =>
              setFlow(booking.notes.toLowerCase().includes('timeout') ? 'reconciliation' : 'failure')
            }
          />
        </>
      )}
    </View>
  );

  const summaryPane = (
    <View
      className={`overflow-hidden rounded-2xl bg-surface-glass shadow-md ${isSplit ? 'w-[280px]' : 'w-full'}`}
    >
      <ScrollView className={isSplit ? 'flex-1' : undefined} contentContainerClassName="px-5.5 py-4.5">
        <BookingSummaryPanel
          headline={{ label: t('booking.totalValue'), value: money }}
          rows={[
            { key: 'source', label: t('booking.source'), value: sourceLabel },
            {
              key: 'opera',
              label: t('booking.operaId'),
              value: booking.operaConfirmationId ?? (
                <Tag labelKey="booking.detail.notConfirmed" tone="caution" shape="pill" />
              ),
            },
            { key: 'room', label: t('booking.roomType'), value: roomTypeName ?? booking.roomTypeId },
            { key: 'rate', label: t('booking.rateCode'), value: rateCodeName ?? booking.rateCodeId },
            {
              key: 'stay',
              label: t('booking.detail.stay'),
              value: t('booking.detail.stayValue', {
                range: stayRangeWithYear(booking.checkIn, booking.checkOut),
                count: nights,
              }),
            },
          ]}
        />
      </ScrollView>
      {/* Pinned so the decision is always visible, however long the summary gets */}
      {reviewActions}
    </View>
  );

  const detailHeader = (
    <View className="gap-4">
      <SegmentedTabs
        variant="pill"
        fill
        tabs={TABS}
        selected={tab}
        onSelect={(key) => setTab(key as TabKey)}
      />
      <View className="h-px w-full bg-surface" />
    </View>
  );

  return (
    <>
      <Modal
        visible={visible && !documentWorkflow}
        onClose={close}
        variant="sheet"
        title={booking.humanId}
        subtitle={t('booking.detail.subtitle', { guest: guestName, source: sourceLabel })}
        badge={bookingStateBadge(booking.state)}
        headerActions={
          <Pressable
            onPress={() => setTab('notes')}
            accessibilityRole="button"
            accessibilityLabel={t('booking.detail.openNotes')}
            className="h-9 w-9 items-center justify-center rounded-pill bg-brand-10 active:opacity-70"
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <MessageSquareText size={19} color={tokens.color.brand.DEFAULT} />
          </Pressable>
        }
      >
        {isSplit ? (
          <View className="flex-row gap-4" style={{ height: bodyHeight }}>
            {summaryPane}
            <View className="flex-1 gap-4 overflow-hidden rounded-2xl bg-surface-glass px-[26px] py-[21px] shadow-md">
              {detailHeader}
              <ScrollView className="flex-1" showsVerticalScrollIndicator>
                {tabContent}
              </ScrollView>
            </View>
          </View>
        ) : (
          <ScrollView contentContainerClassName="gap-4">
            {summaryPane}
            <View className="gap-5 rounded-2xl bg-surface-glass p-4 shadow-md">
              {detailHeader}
              {tabContent}
            </View>
          </ScrollView>
        )}
      </Modal>
      <DocumentWorkflowModal
        visible={visible && documentWorkflow != null}
        onClose={() => setDocumentWorkflow(null)}
        bookingId={booking.id}
        document={documentWorkflow?.document}
        documentTypes={documentTypes}
      />
    </>
  );
}
