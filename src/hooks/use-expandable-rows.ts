"use client";

import * as React from "react";
import type {
  ExpandedState,
  OnChangeFn,
  Updater,
} from "@tanstack/react-table";

type ExpandableRowId = string | number;

function resolveExpandedState(
  updater: Updater<ExpandedState>,
  previous: ExpandedState
) {
  const nextState =
    typeof updater === "function" ? updater(previous) : updater;

  return nextState === true ? previous : nextState;
}

export function useExpandableRows<T extends ExpandableRowId>() {
  const [expandedRows, setExpandedRows] = React.useState<ExpandedState>({});

  const onExpandedChange = React.useCallback<OnChangeFn<ExpandedState>>(
    (updater) => {
      setExpandedRows((previous) => resolveExpandedState(updater, previous));
    },
    []
  );

  const toggleRow = React.useCallback((id: T) => {
    const rowId = String(id);

    setExpandedRows((previous) => {
      const nextState = previous === true ? {} : { ...previous };

      if (nextState[rowId]) {
        delete nextState[rowId];
      } else {
        nextState[rowId] = true;
      }

      return nextState;
    });
  }, []);

  const isExpanded = React.useCallback(
    (id: T) => expandedRows !== true && Boolean(expandedRows[String(id)]),
    [expandedRows]
  );

  const collapseAll = React.useCallback(() => {
    setExpandedRows({});
  }, []);

  return {
    expandedRows,
    onExpandedChange,
    toggleRow,
    isExpanded,
    collapseAll,
  };
}
