import { View, Text, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

type Column = {
  key: string;
  headerKey: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
};

type DataTableProps = {
  columns: Column[];
  data: Record<string, string | number | React.ReactNode>[];
  onRowPress?: (row: Record<string, string | number | React.ReactNode>, index: number) => void;
  emptyKey?: string;
};

function getAlignClass(align?: string): string {
  switch (align) {
    case 'center': return 'text-center';
    case 'right': return 'text-right';
    default: return 'text-left';
  }
}

export function DataTable({ columns, data, onRowPress, emptyKey = 'common.noResults' }: DataTableProps) {
  const { t } = useTranslation();

  if (data.length === 0) {
    return (
      <View className="items-center py-6">
        <Text className="text-sm text-fg-muted">{t(emptyKey)}</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        {/* Header */}
        <View className="flex-row border-b border-border px-3 py-2">
          {columns.map((col) => (
            <View key={col.key} style={col.width ? { width: col.width } : { flex: 1 }}>
              <Text
                className={`text-[11px] font-semibold uppercase text-fg-muted ${getAlignClass(col.align)}`}
              >
                {t(col.headerKey)}
              </Text>
            </View>
          ))}
        </View>

        {/* Rows */}
        {data.map((row, rowIndex) => {
          const RowWrapper = onRowPress ? Pressable : View;
          const rowProps = onRowPress
            ? {
                onPress: () => onRowPress(row, rowIndex),
                accessibilityRole: 'button' as const,
              }
            : {};

          return (
            <RowWrapper
              key={rowIndex}
              className={`flex-row border-b border-border px-3 py-3 ${
                onRowPress ? 'active:bg-surface-page' : ''
              }`}
              {...rowProps}
            >
              {columns.map((col) => (
                <View key={col.key} style={col.width ? { width: col.width } : { flex: 1 }}>
                  {typeof row[col.key] === 'string' || typeof row[col.key] === 'number' ? (
                    <Text className={`text-sm text-fg ${getAlignClass(col.align)}`}>
                      {row[col.key] as string | number}
                    </Text>
                  ) : (
                    row[col.key]
                  )}
                </View>
              ))}
            </RowWrapper>
          );
        })}
      </View>
    </ScrollView>
  );
}
