import type { Channel, Contact, ContactKind, ConversationMessage } from '@/contracts';

export type ContactFilter = ContactKind | 'all';

export function totalUnread(contacts: Contact[]): number {
  return contacts.filter((c) => c.unread > 0).length;
}

export function countByKind(contacts: Contact[]): Record<ContactKind, number> {
  const counts: Record<ContactKind, number> = { hotel: 0, supplier: 0, customer: 0 };
  contacts.forEach((c) => {
    counts[c.kind] += 1;
  });
  return counts;
}

export function filterContacts(contacts: Contact[], kind: ContactFilter, query: string, unreadOnly: boolean): Contact[] {
  const q = query.trim().toLowerCase();
  return contacts.filter((c) => {
    if (kind !== 'all' && c.kind !== kind) return false;
    if (unreadOnly && c.unread === 0) return false;
    return !q || `${c.name} ${c.context} ${c.preview}`.toLowerCase().includes(q);
  });
}

export function searchMessages(messages: ConversationMessage[], query: string): ConversationMessage[] {
  const q = query.trim().toLowerCase();
  return q ? messages.filter((m) => `${m.text} ${m.sender} ${m.subject ?? ''} ${(m.attachments ?? []).join(' ')}`.toLowerCase().includes(q)) : messages;
}

/** A file and the message it arrived in. */
export interface MessageDocument {
  id: string;
  name: string;
  messageId: string;
  sender: string;
  day: string;
  time: string;
  channel: Channel;
  subject?: string;
}

export function documentsOf(messages: ConversationMessage[]): MessageDocument[] {
  return messages.flatMap((m) => (m.attachments ?? []).map((name, i) => ({ id: `${m.id}-${i}`, name, messageId: m.id, sender: m.sender, day: m.day, time: m.time, channel: m.channel, subject: m.subject })));
}

export function searchDocuments(documents: MessageDocument[], query: string): MessageDocument[] {
  const q = query.trim().toLowerCase();
  return q ? documents.filter((d) => `${d.name} ${d.sender} ${d.subject ?? ''}`.toLowerCase().includes(q)) : documents;
}

/** The subject to prefill when replying to an email thread. */
export function replySubject(messages: ConversationMessage[]): string {
  const last = [...messages].reverse().find((m) => m.channel === 'email' && m.subject);
  if (!last?.subject) return '';
  return last.subject.startsWith('Re:') ? last.subject : `Re: ${last.subject}`;
}

/** Groups messages under their day label, keeping the original order. */
export function groupByDay(messages: ConversationMessage[]): { day: string; messages: ConversationMessage[] }[] {
  const groups: { day: string; messages: ConversationMessage[] }[] = [];
  messages.forEach((m) => {
    const last = groups[groups.length - 1];
    if (last && last.day === m.day) last.messages.push(m);
    else groups.push({ day: m.day, messages: [m] });
  });
  return groups;
}
