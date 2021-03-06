import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  Getter,
  Template,
  Plugin,
  TemplateConnector,
  TemplatePlaceholder,
} from '@devexpress/dx-react-core';
import {
  getMessagesFormatter,
  tableRowsWithSummaries,
  tableRowsWithTotalSummaries,
  isTotalSummaryTableCell,
  isGroupSummaryTableCell,
  isTreeSummaryTableCell,
  isTotalSummaryTableRow,
  isGroupSummaryTableRow,
  isTreeSummaryTableRow,
  getColumnSummaries,
} from '@devexpress/dx-grid-core';

const dependencies = [
  { name: 'DataTypeProvider', optional: true },
  { name: 'SummaryState' },
  { name: 'CustomSummary', optional: true },
  { name: 'IntegratedSummary', optional: true },
  { name: 'Table' },
  { name: 'TableTreeColumn', optional: true },
];

const tableBodyRowsComputed = ({
  tableBodyRows,
  getRowLevelKey,
  isGroupRow,
  getRowId,
}) => tableRowsWithSummaries(tableBodyRows, getRowLevelKey, isGroupRow, getRowId);
const tableFooterRowsComputed = ({
  tableFooterRows,
}) => tableRowsWithTotalSummaries(tableFooterRows);

const defaultTypelessSummaries = ['count'];

export class TableSummaryRow extends React.PureComponent {
  renderCellContent(column, columnSummaries) {
    const {
      formatlessSummaryTypes,
      itemComponent: Item,
      messages,
    } = this.props;

    const getMessage = getMessagesFormatter(messages);

    return (
      <React.Fragment>
        {columnSummaries.map((summary) => {
          if (summary.value === null
            || formatlessSummaryTypes.includes(summary.type)
            || defaultTypelessSummaries.includes(summary.type)) {
            return (
              <Item
                key={summary.type}
              >
                {getMessage(summary.type)}
                :&nbsp;&nbsp;
                {String(summary.value)}
              </Item>
            );
          }
          return (
            <TemplatePlaceholder
              key={summary.type}
              name="valueFormatter"
              params={{
                column,
                value: summary.value,
              }}
            >
              {content => (
                <Item>
                  {getMessage(summary.type)}
                  :&nbsp;&nbsp;
                  {content || String(summary.value)}
                </Item>
              )}
            </TemplatePlaceholder>
          );
        })}
      </React.Fragment>
    );
  }

  render() {
    const {
      totalRowComponent: TotalRow,
      groupRowComponent: GroupRow,
      treeRowComponent: TreeRow,
      totalCellComponent: TotalCell,
      groupCellComponent: GroupCell,
      treeCellComponent: TreeCell,
      treeColumnCellComponent: TreeColumnCell,
      treeColumnContentComponent: TreeColumnContent,
      treeColumnIndentComponent: TreeColumnIndent,
    } = this.props;

    return (
      <Plugin
        name="TableSummaryRow"
        dependencies={dependencies}
      >
        <Getter name="tableBodyRows" computed={tableBodyRowsComputed} />
        <Getter name="tableFooterRows" computed={tableFooterRowsComputed} />
        <Template
          name="tableCell"
          predicate={({ tableRow, tableColumn }) => isTotalSummaryTableCell(tableRow, tableColumn)}
        >
          {params => (
            <TemplateConnector>
              {({ totalSummaryItems, totalSummaryValues }) => {
                const columnSummaries = getColumnSummaries(
                  totalSummaryItems,
                  params.tableColumn.column.name,
                  totalSummaryValues,
                );
                return (
                  <TotalCell
                    {...params}
                    column={params.tableColumn.column}
                  >
                    {this.renderCellContent(params.tableColumn.column, columnSummaries)}
                  </TotalCell>
                );
              }}
            </TemplateConnector>
          )}
        </Template>
        <Template
          name="tableCell"
          predicate={({ tableRow, tableColumn }) => isGroupSummaryTableCell(tableRow, tableColumn)}
        >
          {params => (
            <TemplateConnector>
              {({ groupSummaryItems, groupSummaryValues }) => {
                const columnSummaries = getColumnSummaries(
                  groupSummaryItems,
                  params.tableColumn.column.name,
                  groupSummaryValues[params.tableRow.row.compoundKey],
                );
                return (
                  <GroupCell
                    {...params}
                    column={params.tableColumn.column}
                  >
                    {this.renderCellContent(params.tableColumn.column, columnSummaries)}
                  </GroupCell>
                );
              }}
            </TemplateConnector>
          )}
        </Template>
        <Template
          name="tableCell"
          predicate={({ tableRow, tableColumn }) => isTreeSummaryTableCell(tableRow, tableColumn)}
        >
          {params => (
            <TemplateConnector>
              {({
                treeSummaryItems,
                treeSummaryValues,
                tableTreeColumnName,
                getRowId,
                getTreeRowLevel,
              }) => {
                const columnSummaries = getColumnSummaries(
                  treeSummaryItems,
                  params.tableColumn.column.name,
                  treeSummaryValues[getRowId(params.tableRow.row)],
                );
                if (tableTreeColumnName === params.tableColumn.column.name) {
                  return (
                    <TreeColumnCell
                      {...params}
                      column={params.tableColumn.column}
                    >
                      <TreeColumnIndent
                        level={getTreeRowLevel(params.tableRow.row)}
                      />
                      <TreeColumnContent>
                        {this.renderCellContent(params.tableColumn.column, columnSummaries)}
                      </TreeColumnContent>
                    </TreeColumnCell>
                  );
                }
                return (
                  <TreeCell
                    {...params}
                    column={params.tableColumn.column}
                  >
                    {this.renderCellContent(params.tableColumn.column, columnSummaries)}
                  </TreeCell>
                );
              }}
            </TemplateConnector>
          )}
        </Template>
        <Template
          name="tableRow"
          predicate={({ tableRow }) => isTotalSummaryTableRow(tableRow)}
        >
          {params => (
            <TotalRow
              {...params}
            />
          )}
        </Template>
        <Template
          name="tableRow"
          predicate={({ tableRow }) => isGroupSummaryTableRow(tableRow)}
        >
          {params => (
            <GroupRow
              {...params}
            />
          )}
        </Template>
        <Template
          name="tableRow"
          predicate={({ tableRow }) => isTreeSummaryTableRow(tableRow)}
        >
          {params => (
            <TreeRow
              {...params}
            />
          )}
        </Template>
      </Plugin>
    );
  }
}

TableSummaryRow.propTypes = {
  formatlessSummaryTypes: PropTypes.array,

  totalRowComponent: PropTypes.func.isRequired,
  groupRowComponent: PropTypes.func.isRequired,
  treeRowComponent: PropTypes.func.isRequired,

  totalCellComponent: PropTypes.func.isRequired,
  groupCellComponent: PropTypes.func.isRequired,
  treeCellComponent: PropTypes.func.isRequired,

  treeColumnCellComponent: PropTypes.func.isRequired,
  treeColumnContentComponent: PropTypes.func.isRequired,
  treeColumnIndentComponent: PropTypes.func.isRequired,

  itemComponent: PropTypes.func.isRequired,

  messages: PropTypes.object,
};

TableSummaryRow.defaultProps = {
  formatlessSummaryTypes: [],
  messages: {},
};
