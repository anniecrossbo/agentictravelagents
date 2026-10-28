import { View, Text } from 'react-native';
import { Avatar } from './Avatar';
import { ChannelBadge } from './ChannelBadge';
import type { MessageChannel } from '../lib/types';

type NoteCardProps = {
  /** Resolved strings. */
  author: string;
  meta: string;
  body: string;
  /** Hotel replies use a neutral avatar so the agent's notes stand out. */
  fromHotel?: boolean;
  channel?: MessageChannel;
};

export function NoteCard({ author, meta, body, fromHotel, channel }: NoteCardProps) {
  return (
    <View className="gap-2.5 rounded-md bg-surface px-4.5 py-4">
      <View className="flex-row items-center gap-2.5">
        <Avatar name={author} size="sm" color={fromHotel ? 'bg-avatar-grey' : 'bg-avatar-teal'} />
        <View className="flex-1 gap-0.5">
          <Text className="text-xs font-semibold text-fg">{author}</Text>
          <Text className="text-[10px] text-fg-muted">{meta}</Text>
        </View>
        {channel && <ChannelBadge channel={channel} />}
      </View>
      <Text className="text-xs leading-[17px] text-fg">{body}</Text>
    </View>
  );
}
