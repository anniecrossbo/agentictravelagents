import { Fragment } from 'react';
import { View, Text } from 'react-native';

type DetailField = {
  label: string;
  /** A resolved string, or custom content such as chips. */
  value: React.ReactNode;
};

type DetailFieldCardProps = {
  /** Resolved strings; laid out `columns` per row with a divider between rows. */
  fields: readonly DetailField[];
  columns?: number;
  /** 'glass' is the translucent account card; 'solid' is the white booking card. */
  surface?: 'glass' | 'solid';
};

export function DetailFieldCard({ fields, columns = 2, surface = 'glass' }: DetailFieldCardProps) {
  const isSolid = surface === 'solid';
  const rows: DetailField[][] = [];
  for (let i = 0; i < fields.length; i += columns) rows.push(fields.slice(i, i + columns));

  return (
    <View
      className={
        isSolid
          ? 'gap-3 rounded-md bg-surface px-4.5 py-4'
          : 'gap-3 rounded-md bg-surface-glassStrong p-4.5'
      }
    >
      {rows.map((row, i) => (
        <Fragment key={row[0]?.label ?? i}>
          {i > 0 && <View className="h-px w-full bg-chip-neutralBg" />}
          <View className={`flex-row ${isSolid ? 'gap-4' : 'gap-2'}`}>
            {row.map((f) => (
              <View key={f.label} className={`flex-1 ${isSolid ? 'gap-1.5' : 'gap-2'}`}>
                <Text className={`text-[10px] text-fg-muted ${isSolid ? '' : 'font-semibold'}`}>
                  {f.label}
                </Text>
                {typeof f.value === 'string' ? (
                  <Text className="text-xs font-semibold text-fg">{f.value}</Text>
                ) : (
                  f.value
                )}
              </View>
            ))}
            {Array.from({ length: columns - row.length }, (_, k) => (
              <View key={`pad-${k}`} className="flex-1" />
            ))}
          </View>
        </Fragment>
      ))}
    </View>
  );
}
