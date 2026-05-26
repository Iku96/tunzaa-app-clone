import * as TablePrimitive from '@rn-primitives/table';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useResolvedThemeColors } from '@/hooks/useThemeColors';
import { useResponsive } from '@/hooks/useResponsive';

interface TableColumn {
  header: string;
  accessor: string; // Key to access data in the row object
  render?: (value: any, row: any) => React.ReactNode; // Optional custom render function
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  onRowPress?: (row: any) => void; // Optional callback for row selection
  footer?: { label: string; value: string }; // Optional footer for totals
  ariaLabelledBy?: string; // Accessibility label
}

export function Table({ columns, data, onRowPress, footer, ariaLabelledBy = 'table-label' }: TableProps) {
  const resolvedColors = useResolvedThemeColors();
  const { isDesktop } = useResponsive();

  return (
    <View className="w-full border border-border rounded-lg bg-background">
      <TablePrimitive.Root aria-labelledby={ariaLabelledBy}>
        <TablePrimitive.Header className="bg-muted">
          <TablePrimitive.Row className="flex-row border-b border-border">
            {columns.map((column, index) => (
              <TablePrimitive.Head
                key={index}
                style={[
                  styles.cell,
                  { borderRightWidth: index < columns.length - 1 ? 1 : 0 },
                  { borderColor: resolvedColors.border },
                ]}
              >
                <Text className="text-base font-semibold text-foreground px-4 py-3">
                  {column.header}
                </Text>
              </TablePrimitive.Head>
            ))}
          </TablePrimitive.Row>
        </TablePrimitive.Header>
        <TablePrimitive.Body>
          {data.map((row, rowIndex) => (
            <TablePrimitive.Row
              key={rowIndex}
              className={`flex-row border-b border-border ${
                isDesktop && onRowPress ? 'hover:bg-muted/50' : ''
              }`}
            >
              {columns.map((column, colIndex) => (
                <TablePrimitive.Cell
                  key={`${rowIndex}-${colIndex}`}
                  style={[
                    styles.cell,
                    { borderRightWidth: colIndex < columns.length - 1 ? 1 : 0 },
                    { borderColor: resolvedColors.border },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => onRowPress && onRowPress(row)}
                    disabled={!onRowPress}
                    className="px-4 py-3"
                    style={onRowPress ? styles.touchable : undefined}
                  >
                    <Text
                      className={`text-sm text-foreground ${
                        column.accessor === 'actions' ? 'flex-row items-center' : ''
                      }`}
                    >
                      {column.render ? column.render(row[column.accessor], row) : row[column.accessor]}
                    </Text>
                  </TouchableOpacity>
                </TablePrimitive.Cell>
              ))}
            </TablePrimitive.Row>
          ))}
          {footer && (
            <TablePrimitive.Footer className="bg-muted">
              <TablePrimitive.Row className="flex-row">
                <TablePrimitive.Cell
                  style={[styles.cell, { borderColor: resolvedColors.border }]}
                >
                  <Text className="text-base font-bold text-foreground px-4 py-3">
                    {footer.label}
                  </Text>
                </TablePrimitive.Cell>
                <TablePrimitive.Cell
                  style={[styles.cell, { borderColor: resolvedColors.border }]}
                >
                  <Text className="text-base font-bold text-foreground px-4 py-3">
                    {footer.value}
                  </Text>
                </TablePrimitive.Cell>
                {columns.length > 2 &&
                  Array(columns.length - 2)
                    .fill(null)
                    .map((_, index) => (
                      <TablePrimitive.Cell
                        key={`footer-empty-${index}`}
                        style={[
                          styles.cell,
                          { borderRightWidth: index < columns.length - 3 ? 1 : 0 },
                          { borderColor: resolvedColors.border },
                        ]}
                      />
                    ))}
              </TablePrimitive.Row>
            </TablePrimitive.Footer>
          )}
        </TablePrimitive.Body>
      </TablePrimitive.Root>
      <Text nativeID={ariaLabelledBy} className="sr-only">
        {ariaLabelledBy.replace('-', ' ')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    justifyContent: 'center',
  },
  touchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
});