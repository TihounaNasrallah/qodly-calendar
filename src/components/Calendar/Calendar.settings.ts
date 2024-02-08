import { ESetting, TSetting, DEFAULT_ITERATOR } from '@ws-ui/webform-editor';
import { BASIC_SETTINGS, DEFAULT_SETTINGS, load } from '@ws-ui/webform-editor';
import { validateServerSide } from '@ws-ui/shared';

const commonSettings: TSetting[] = [
  {
    key: 'color',
    label: 'Color',
    type: ESetting.COLOR_PICKER,
    defaultValue: '#4169E1',
  },
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
    placeholder: 'Row Height',
    defaultValue: '150px',
  },
];

const dataAccessSettings: TSetting[] = [
  {
    key: 'datasource',
    label: 'Data Source',
    type: ESetting.DS_AUTO_SUGGEST,
  },
  // {
  //   key: 'attribute',
  //   label: 'Filter By',
  //   type: ESetting.DS_AUTO_SUGGEST,
  // },
  {
    key: 'serverSideRef',
    label: 'Server Side',
    type: ESetting.TEXT_FIELD,
    hasError: validateServerSide,
    validateOnEnter: true,
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
  ...load(DEFAULT_SETTINGS).filter('dataAccess'),
];

export const BasicSettings: TSetting[] = [
  ...commonSettings,
  ...load(BASIC_SETTINGS).filter('style.overflow'),
];

export default Settings;
