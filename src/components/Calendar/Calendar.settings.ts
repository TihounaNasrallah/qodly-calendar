import { ESetting, TSetting } from '@ws-ui/webform-editor';
import { BASIC_SETTINGS, DEFAULT_SETTINGS, load } from '@ws-ui/webform-editor';

const commonSettings: TSetting[] = [
  {
    key: 'yearNav',
    label: 'Year Navigation',
    type: ESetting.CHECKBOX,
    defaultValue: true,
  },
  {
    key: 'rowHeight',
    label: 'Row Height',
    type: ESetting.UNITFIELD,
    defaultValue: '150px',
    hasLabel: true,
  },
  {
    key: 'borderRadius',
    label: 'Border Radius',
    type: ESetting.UNITFIELD,
    defaultValue: '6px',
    hasLabel: true,
  },
  {
    key: 'color',
    label: 'Current Day Color',
    type: ESetting.COLOR_PICKER,
    defaultValue: '#4169E1',
  },
  {
    type: ESetting.DATAGRID,
    key: 'colors',
    name: 'Colors',
    label: 'Colors',
    titleProperty: 'color',
    data: [
      {
        key: 'color',
        label: 'Color',
        type: ESetting.COLOR_PICKER,
        defaultValue: '',
      },
    ],
  },
];

const attributesSettings: TSetting[] = [
  {
    type: ESetting.DATAGRID,
    key: 'attributes',
    name: 'Attributes',
    label: 'Attributes',
    titleProperty: 'Attribute',
    data: [
      {
        key: 'Attribute',
        label: 'Attribute',
        type: ESetting.TEXT_FIELD,
        defaultValue: '',
      },
    ],
  },
];

const dataAccessSettings: TSetting[] = [
  {
    key: 'datasource',
    label: 'Data Source',
    type: ESetting.DS_AUTO_SUGGEST,
  },
  {
    key: 'serverSideRef',
    label: 'Server Side',
    type: ESetting.TEXT_FIELD,
    validateOnEnter: true,
  },
  {
    key: 'property',
    label: 'Property',
    type: ESetting.TEXT_FIELD,
    defaultValue: '',
  },
  {
    key: 'startDate',
    label: 'First Date',
    type: ESetting.TEXT_FIELD,
    defaultValue: '',
  },
  {
    key: 'endDate',
    label: 'Last Date',
    type: ESetting.TEXT_FIELD,
    defaultValue: '',
  },
];

const Settings: TSetting[] = [
  {
    key: 'properties',
    label: 'Properties',
    type: ESetting.GROUP,
    components: commonSettings,
  },
  {
    key: 'dataAccess',
    label: 'Data Access',
    type: ESetting.GROUP,
    components: dataAccessSettings,
  },
  {
    key: 'attributes',
    label: 'Attributes to Display',
    type: ESetting.GROUP,
    components: attributesSettings,
  },
  ...load(DEFAULT_SETTINGS).filter('dataAccess'),
];

export const BasicSettings: TSetting[] = [
  ...commonSettings,
  ...load(BASIC_SETTINGS).filter('style.overflow'),
];

export default Settings;
