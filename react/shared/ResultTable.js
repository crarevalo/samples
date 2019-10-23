import React, {Fragment} from "react";

// reduce function breaks down column definition: is defined based on the column definition and is applied to rowData
// the column definition is broken down by "dot" notation into an array
// reduce iterates over the array starting with the initial value of rowData: rowData[the first element or property]
// the iteration continues to the next element b and the result of the first iteration a and then so on
// e.g.: column defintion: user.name.first: 1. rowData[user] 2. rowData[user][name] 3. rowData[user][name][first]
const ResultRow = ({rowData, columns, onClickRow}) =>
  <tr>
    {columns.map(column =>
      <td key={rowData.rowId + "_" + column.name} onClick={() => onClickRow(rowData.rowId)}>{column.definition.split(".").reduce((a, b) => a[b], rowData)}</td>
    )}
  </tr>


const ResultTable = ({tableData, columns, onClickRow}) =>
  <div className="result">
    {
      tableData && 
      <table>
        <thead>
          <tr>
            {columns.map(column => <th key={column.id} >{column.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {tableData.map(item => <ResultRow key={item.rowId} rowData={item} columns={columns} onClickRow={onClickRow} />)}
        </tbody>
      </table>
    }
  </div>

export default ResultTable;
