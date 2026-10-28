import type { AgentId, ContactKind } from '@/contracts';

/** PROTO: canned replies keyed on simple phrases; a real teammate would answer from its own work. */
const rules: { agent: AgentId | '*'; match: RegExp; reply: string }[] = [
  { agent: 'sales', match: /who|first|need/i, reply: 'Omar first: his reply is drafted and needs your OK. Then Aisha, who wants a call about transfers.' },
  { agent: 'sales', match: /liam/i, reply: "Liam Chen is waiting on his passport details. I asked yesterday and I'll nudge him tomorrow morning." },
  { agent: 'designer', match: /maldives|omar|plan/i, reply: 'Omar has two options: an overwater villa and a beach villa. Open his card to see each day.' },
  { agent: 'designer', match: /next|which/i, reply: "Hannah's second Singapore option is next, then Jonas once his budget is clear." },
  { agent: 'supplier', match: /chas|who/i, reply: "I've chased Tokyo twice for the Sharmas and Rome once for Nadia. Phuket is waiting on your limit." },
  { agent: 'supplier', match: /rate|better/i, reply: 'Tokyo offers a better rate for earlier payment. I put it in your decisions.' },
  { agent: 'reservations', match: /confirm|unconfirmed|still/i, reply: "Karim's hotel is the only one still unconfirmed. Nadia's is being checked before she accepts." },
  { agent: 'reservations', match: /special|request/i, reply: "Nothing open right now. I'll add anniversary or dietary requests as soon as customers mention them." },
  { agent: 'finance', match: /chase|balance/i, reply: "I'll send Aisha a friendly reminder on 30 Oct if her €4,480 hasn't arrived." },
  { agent: 'finance', match: /invoice|view/i, reply: 'Each step has its own document. Open it from the cashflow list on the right.' },
  { agent: 'marketing', match: /draft|show/i, reply: "“Hi Elena, it's been a year since Capri. Would you like us to plan something for early January?”" },
  { agent: 'marketing', match: /who|else|note/i, reply: "Two more customers are due a note after their trips finish, and I'll draft those then." },
];

export function replyTo(agent: AgentId, text: string): string {
  const hit = rules.find((r) => (r.agent === agent || r.agent === '*') && r.match.test(text));
  return hit?.reply ?? "Got it. I'll look into that and tell you here as soon as I have something.";
}

/** PROTO: a contact "answers" with a fixed line for their kind; a real one would reply in their own time. */
const contactReplies: Record<ContactKind, string[]> = {
  hotel: ['Thank you, we will confirm that with our reservations team and come back to you shortly.', 'Noted. We will update the booking and send you a confirmation today.'],
  supplier: ['Thanks for the message. We can hold that for you until the end of the week.', "Got it. We'll send the updated rates and availability this afternoon."],
  customer: ['Thank you, that sounds good to me.', 'Great, thanks for letting me know. Please keep me posted.'],
};

export function replyFromContact(kind: ContactKind, text: string): string {
  const options = contactReplies[kind];
  return options[text.length % options.length] ?? '';
}
