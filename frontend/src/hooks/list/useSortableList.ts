// src/hooks/useSortableList.ts
import { useMemo, useState } from 'react';
import { ACTIONS } from '../../config/actions';
import { SortConfig } from '../../config/formInterfaces';
import { Song } from '../../config/interfaces';

export const useSortableList = <T extends Song>(
  initialData: T[],
  initialSortKey: SortConfig["key"] = "artist"
) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: initialSortKey,
    direction: "ascending",
  });

  const sortedList = useMemo(() => {
    if (!initialData) return [];

    return ACTIONS.sortList(sortConfig, initialData as Song[]);
  }, [initialData, sortConfig]);

  const requestSort = (key: SortConfig["key"]) => {
    let direction = "ascending" as SortConfig["direction"];
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  return { sortedList, sortConfig, requestSort };
};
