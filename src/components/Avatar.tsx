import { View, Text } from 'react-native';

const AVATAR_COLORS = [
  'bg-avatar-green',
  'bg-avatar-brown',
  'bg-avatar-grey',
  'bg-avatar-red',
  'bg-avatar-teal',
] as const;

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '';
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

const SIZES = { sm: 24, md: 33, lg: 40 } as const;

const TEXT_SIZES = {
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
} as const;

type AvatarProps = {
  name: string;
  size?: keyof typeof SIZES;
  color?: string;
  /** 'soft' is a pale brand disc with brand initials. */
  tone?: 'solid' | 'soft';
};

export function Avatar({ name, size = 'md', color, tone = 'solid' }: AvatarProps) {
  const dimension = SIZES[size];
  const colorClass =
    tone === 'soft' ? 'bg-brand-light' : (color ?? AVATAR_COLORS[hashName(name) % AVATAR_COLORS.length]);
  const initials = getInitials(name);

  return (
    <View
      className={`${colorClass} items-center justify-center rounded-full`}
      style={{ width: dimension, height: dimension }}
      accessibilityRole="image"
      accessibilityLabel={name}
    >
      <Text className={`${TEXT_SIZES[size]} font-semibold ${tone === 'soft' ? 'text-brand' : 'text-fg-inverse'}`}>
        {initials}
      </Text>
    </View>
  );
}
