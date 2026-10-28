import { View, Text } from 'react-native';

type RateMatrixTableProps = {
  /** Resolved column headings; the first is the row label column. */
  columns: readonly string[];
  /** Resolved cells, one array per row, matching `columns`. */
  rows: readonly { key: string; cells: readonly string[] }[];
};

/** Room-type price grid. The first price column (the headline rate) is emphasised. */
export function RateMatrixTable({ columns, rows }: RateMatrixTableProps) {
  const width = (i: number) => (i === 0 ? 'flex-[1.5]' : 'flex-1');

  return (
    <View className="overflow-hidden rounded-md border border-border-subtle bg-surface">
      <View className="flex-row border-b border-border px-4 py-2.5">
        {columns.map((c, i) => (
          <Text key={c} className={`${width(i)} text-[11px] font-semibold uppercase text-fg-muted`}>
            {c}
          </Text>
        ))}
      </View>
      {rows.map((row) => (
        <View key={row.key} className="flex-row px-4 py-2.5">
          {row.cells.map((cell, i) => (
            <Text
              key={`${row.key}-${columns[i] ?? i}`}
              className={`${width(i)} text-[13px] ${i === 1 ? 'font-semibold text-brand' : 'text-fg'}`}
              numberOfLines={1}
            >
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}
