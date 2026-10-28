import { useState, Children, isValidElement } from 'react';
import { View, Text, ScrollView, type LayoutChangeEvent } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge } from './Badge';
import { tokens } from '../theme/tokens';

export type WidgetCellProps = {
  children: React.ReactNode;
  /** i18n key for the widget heading. */
  title?: string;
  /** Resolved line under the heading, e.g. the reporting period. */
  subtitle?: string;
  /** Count badge shown beside the heading. */
  count?: number;
  /** Primary action rendered at the right of the heading. */
  action?: React.ReactNode;
  /** Rows are a fixed height, so bodies scroll by default. */
  scrollable?: boolean;
  /** Draws a hairline rule between the heading and the body. */
  divider?: boolean;
  /** Columns this widget occupies — combined cells use 2, 3 or 4. */
  colSpan?: number;
  /** Rows this widget occupies. */
  rowSpan?: number;
  /** Zero-based column anchor. Omit to auto-place in the first free slot. */
  col?: number;
  /** Zero-based row anchor. Omit to auto-place in the first free slot. */
  row?: number;
  className?: string;
};

/**
 * One widget surface in a WidgetGrid: white, 22pt corners, no shadow.
 * Span and anchor props are read by the grid, which sizes and positions
 * the slot; the cell simply fills it.
 */
export function WidgetCell({
  children,
  title,
  subtitle,
  count,
  action,
  scrollable = true,
  divider = false,
  className,
}: WidgetCellProps) {
  const { t } = useTranslation();
  const Body = scrollable ? ScrollView : View;

  return (
    <View className={`flex-1 overflow-hidden rounded-3xl bg-surface ${className ?? ''}`}>
      {title && (
        <View className={divider ? 'border-b border-border' : ''}>
          <View className="flex-row items-center gap-2 px-5.5 pb-3 pt-5.5">
            <Text className="flex-1 text-base font-semibold text-fg">{t(title)}</Text>
            {count != null && <Badge label={String(count)} variant="brand" size="sm" />}
            {action}
          </View>
          {subtitle && (
            <Text className="-mt-2 px-5.5 pb-3 text-xs text-fg-muted">{subtitle}</Text>
          )}
        </View>
      )}
      <Body
        className="flex-1"
        {...(scrollable
          ? { contentContainerClassName: title ? 'px-5.5 pb-5.5' : 'p-5.5' }
          : { className: title ? 'flex-1 px-5.5 pb-5.5' : 'flex-1 p-5.5' })}
      >
        {children}
      </Body>
    </View>
  );
}

type Placement = { col: number; row: number; colSpan: number; rowSpan: number };

/**
 * Resolves each child to a grid slot, honouring explicit anchors and
 * auto-placing the rest row-major into the first gap that fits.
 */
function placeChildren(
  items: readonly Pick<WidgetCellProps, 'col' | 'row' | 'colSpan' | 'rowSpan'>[],
  columns: number,
): Placement[] {
  const taken = new Set<string>();
  const key = (c: number, r: number) => `${c},${r}`;
  const fits = (c: number, r: number, cs: number, rs: number) => {
    if (c + cs > columns) return false;
    for (let dc = 0; dc < cs; dc++) {
      for (let dr = 0; dr < rs; dr++) {
        if (taken.has(key(c + dc, r + dr))) return false;
      }
    }
    return true;
  };
  const occupy = (c: number, r: number, cs: number, rs: number) => {
    for (let dc = 0; dc < cs; dc++) {
      for (let dr = 0; dr < rs; dr++) taken.add(key(c + dc, r + dr));
    }
  };

  return items.map((item) => {
    const colSpan = Math.min(Math.max(item.colSpan ?? 1, 1), columns);
    const rowSpan = Math.max(item.rowSpan ?? 1, 1);

    if (item.col != null && item.row != null) {
      occupy(item.col, item.row, colSpan, rowSpan);
      return { col: item.col, row: item.row, colSpan, rowSpan };
    }

    for (let r = 0; ; r++) {
      for (let c = 0; c <= columns - colSpan; c++) {
        if (fits(c, r, colSpan, rowSpan)) {
          occupy(c, r, colSpan, rowSpan);
          return { col: c, row: r, colSpan, rowSpan };
        }
      }
    }
  });
}

type WidgetGridProps = {
  children: React.ReactNode;
  columns?: number;
  rowHeight?: number;
  gap?: number;
  className?: string;
};

/**
 * Fixed-column widget grid matching the Luna layout: equal fractional columns,
 * a uniform gap on both axes, and widgets that may span columns and rows.
 *
 * React Native has no CSS grid, so slots are absolutely positioned from the
 * measured container width; children render once that measurement lands.
 */
export function WidgetGrid({
  children,
  columns = 4,
  rowHeight = tokens.size.widgetRow,
  gap = tokens.space['5'],
  className,
}: WidgetGridProps) {
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const next = e.nativeEvent.layout.width;
    setWidth((prev) => (prev === next ? prev : next));
  };

  const cells = Children.toArray(children).filter(
    (c): c is React.ReactElement<WidgetCellProps> => isValidElement<WidgetCellProps>(c),
  );
  const placements = placeChildren(cells.map((c) => c.props), columns);
  const rowCount = placements.reduce((m, p) => Math.max(m, p.row + p.rowSpan), 0);
  const columnWidth = width > 0 ? (width - gap * (columns - 1)) / columns : 0;

  return (
    <View
      onLayout={onLayout}
      className={className}
      style={{ height: rowCount * rowHeight + gap * Math.max(rowCount - 1, 0) }}
    >
      {columnWidth > 0 &&
        cells.map((cell, i) => {
          const p = placements[i]!;
          return (
            <View
              key={cell.key ?? i}
              style={{
                position: 'absolute',
                left: p.col * (columnWidth + gap),
                top: p.row * (rowHeight + gap),
                width: p.colSpan * columnWidth + gap * (p.colSpan - 1),
                height: p.rowSpan * rowHeight + gap * (p.rowSpan - 1),
              }}
            >
              {cell}
            </View>
          );
        })}
    </View>
  );
}
