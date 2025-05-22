import {
  IconArrowDropDown as DownIcon,
  IconArrowDropUp as UpIcon,
} from '@republik/icons'
import Link from 'next/link'

export const Table = ({ children, style }) => (
  <>
    <style jsx>{`
      .tableContainer {
        width: 100%;
        container-type: inline-size;
        overflow-x: auto;
      }
      .table {
        border-spacing: 0 0;
        width: 100%;
        table-layout: fixed;
      }
      .td {
        padding: 8px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 0;
      }
      @container (max-width: 30em) {
        .table {
          display: block;
          width: 100%;
          margin: 0;
          padding: 0;
        }
      }
    `}</style>
    <div className="tableContainer">
      <table className="table" style={style}>
        {children}
      </table>
    </div>
  </>
)

export const Tr = ({ children, style = {} }) => (
  <>
    <style jsx>{`
      .tr:nth-child(even) {
        background-color: var(--color-secondary-bg);
      }
      @container (max-width: 30em) {
        .tr {
          display: block;
          margin-bottom: 16px;
          padding: 12px;
          background-color: var(--color-secondary-bg);
          border-radius: 4px;
          width: 100%;
          box-sizing: border-box;
          position: relative;
        }
      }
    `}</style>
    <tr className="tr" style={style}>
      {children}
    </tr>
  </>
)

export const Th = ({ children, style = {} }) => (
  <>
    <style jsx>{`
      .th {
        text-align: left;
        font-weight: normal;
        padding: 8px;
        border-bottom: 1px solid var(--color-divider);
      }
      .th:first-child {
        padding-left: 0;
      }
      .th:last-child {
        padding-right: 0;
      }
      @container (max-width: 30em) {
        .th {
          display: none;
        }
      }
    `}</style>
    <th className="th" style={style}>
      {children}
    </th>
  </>
)

export const Td = ({ children, style = {}, colSpan = 1, label }) => (
  <>
    <style jsx>{`
      .td {
        padding: 8px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .td:first-child {
        padding-left: 0;
      }
      .td:last-child {
        padding-right: 0;
      }
      @container (max-width: 30em) {
        .td {
          display: block;
          padding: 4px 0;
          width: 100%;
          box-sizing: border-box;
          position: relative;
          clear: both;
          white-space: normal;
        }
        .td:first-child {
          padding-top: 0;
        }
        .td:last-child {
          padding-bottom: 0;
        }
        .td::before {
          content: attr(data-label);
          font-weight: bold;
          margin-right: 8px;
          display: inline-block;
          float: left;
          width: 30%;
        }
      }
    `}</style>
    <td className="td" style={style} colSpan={colSpan} data-label={label}>
      {children}
    </td>
  </>
)

export const TdNum = ({ children }) => (
  <>
    <style jsx>{`
      .tdNum {
        font-feature-settings: "tnum" 1, "kern" 1;
      }
      @container (max-width: 30em) {
        .tdNum {
          display: block;
        }
      }
    `}</style>
    <td className="tdNum">
      {children}
    </td>
  </>
)

export const ThOrder = ({
  activeDirection,
  activeField,
  field,
  href,
  children,
  style,
}) => (
  <>
    <style jsx>{`
      .order {
        display: inline-block;
        position: relative;
        padding-right: 20px;
      }
      .orderLink {
        color: inherit;
        text-decoration: none;
      }
      .orderLinkIcon {
        position: absolute;
        top: 0;
        right: 0;
      }
    `}</style>
    <Th style={style}>
      <span className="order">
        <Link href={href} replace className="orderLink">
          {children}
          {activeField === field &&
            (activeDirection === 'DESC' ? (
              <DownIcon size={20} className="orderLinkIcon" />
            ) : (
              <UpIcon size={20} className="orderLinkIcon" />
            ))}
        </Link>
      </span>
    </Th>
  </>
)
