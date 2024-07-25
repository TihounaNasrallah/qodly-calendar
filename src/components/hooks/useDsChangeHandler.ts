import isEqual from 'lodash/isEqual';

export async function updateEntity({
  index,
  newIndex,
  datasource,
  currentElement,
  fireEvent = true,
  onBeforeUpdate,
}: {
  index: number;
  newIndex?: number;
  datasource: datasources.DataSource;
  currentElement: datasources.DataSource;
  fireEvent?: boolean;
  onBeforeUpdate?: () => void;
}) {
  const { entitysel: sel } = datasource as any;
  if (!sel) {
    return;
  }
  const entity = index >= 0 ? await sel.getEntity(index) : null;
  const hasDifferentNamespace =
    datasource && currentElement ? datasource.namespace !== currentElement.namespace : false;
  const needRefresh = !currentElement.parentSource || hasDifferentNamespace;
  onBeforeUpdate?.();
  await currentElement.setValue(null, entity, !needRefresh && fireEvent);
  if (newIndex !== undefined) {
    (currentElement as any).entity?.setPos(newIndex);
  }
  if (needRefresh) {
    await refreshCurrentEntity(currentElement, entity);
  }
}

export async function refreshCurrentEntity(source: any, entity: any, doFireEvent: boolean = true) {
  if (entity) {
    const sourceAttributes = source.filterAttributesText.split(',').filter(Boolean);
    const entityAttributes = (entity._private.filterAttributes || '').split(',').filter(Boolean);
    if (!isEqual(sourceAttributes, entityAttributes)) {
      source.filterAttributesText = Array.from(
        new Set([...sourceAttributes, ...entityAttributes]),
      ).join(',');
      entity._private.filterAttributes = source.filterAttributesText;
      entity._private.inited = false;
      await entity.fetch();
      entity._private.inited = true;
    }
  }
  await source.recomputeChildren(doFireEvent);
  if (doFireEvent) source.fireEvent('changed');
}

export function getParentEntitySel(
  source: datasources.DataSource,
  dataclassID: string,
): datasources.DataSource | null {
  const parent = source.getParentSource();
  if (!parent) {
    return null;
  } else if (parent.type === 'entitysel' && parent.dataclassID === dataclassID) {
    return parent;
  }

  return getParentEntitySel(parent, dataclassID);
}

export function findIndexByRefOrValue(items: any[], value: any) {
  const arr = items || [];
  const indexByRef = arr.indexOf(value);

  if (indexByRef !== -1) {
    return indexByRef;
  }

  let parsedValue = value;
  if (typeof value === 'string') {
    try {
      parsedValue = JSON.parse(value);
    } catch (ex) {
      parsedValue = value;
    }
  }
  const indexByValue = arr.findIndex((item: any) => isEqual(item, parsedValue));
  return indexByValue;
}
