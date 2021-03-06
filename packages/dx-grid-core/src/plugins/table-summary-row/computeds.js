import { TABLE_TOTAL_SUMMARY_TYPE, TABLE_GROUP_SUMMARY_TYPE, TABLE_TREE_SUMMARY_TYPE } from './constants';

export const tableRowsWithTotalSummaries = footerRows => [
  { key: TABLE_TOTAL_SUMMARY_TYPE, type: TABLE_TOTAL_SUMMARY_TYPE },
  ...footerRows,
];

export const tableRowsWithSummaries = (tableRows, getRowLevelKey, isGroupRow, getRowId) => {
  if (!getRowLevelKey) return tableRows;

  const result = [];
  const closeLevel = (level) => {
    if (!level.opened) return;
    if (isGroupRow && isGroupRow(level.row)) {
      const { compoundKey } = level.row;
      result.push({
        key: `${TABLE_GROUP_SUMMARY_TYPE}_${compoundKey}`,
        type: TABLE_GROUP_SUMMARY_TYPE,
        row: level.row,
      });
    } else {
      const rowId = getRowId(level.row);
      result.push({
        key: `${TABLE_TREE_SUMMARY_TYPE}_${rowId}`,
        type: TABLE_TREE_SUMMARY_TYPE,
        row: level.row,
      });
    }
  };

  let levels = [];
  tableRows.forEach((tableRow) => {
    const { row } = tableRow;
    const levelKey = getRowLevelKey(row);
    if (levelKey) {
      const levelIndex = levels.findIndex(level => level.levelKey === levelKey);
      if (levelIndex > -1) {
        levels.slice(levelIndex).forEach(closeLevel);
        levels = levels.slice(0, levelIndex);
      }
      if (!isGroupRow || !isGroupRow(row)) {
        levels = levels.map(level => ({
          ...level,
          opened: true,
        }));
      }
      levels.push({
        levelKey,
        row,
        opened: false,
      });
    } else {
      levels = levels.map(level => ({
        ...level,
        opened: true,
      }));
    }
    result.push(tableRow);
  });
  levels.slice().reverse().forEach(closeLevel);

  return result;
};
