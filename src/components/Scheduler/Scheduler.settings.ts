import { ESetting, TSetting } from '@ws-ui/webform-editor';
import { BASIC_SETTINGS, DEFAULT_SETTINGS, load } from '@ws-ui/webform-editor';

const commonSettings: TSetting[] = [
  {
    key: 'color',
    label: 'Current Day Color',
    type: ESetting.COLOR_PICKER,
    defaultValue: '#3b82f6',
  },
  {
    key: 'timeFormat',
    label: 'Time Format',
    type: ESetting.SELECT,
    options: [
      { value: '12', label: '12 Hours' },
      { value: '24', label: '24 Hours' },
    ],
    defaultValue: '12',
  },
];

const Settings: TSetting[] = [
  {
    key: 'properties',
    label: 'Properties',
    type: ESetting.GROUP,
    components: commonSettings,
  },
  ...DEFAULT_SETTINGS,
];

export const BasicSettings: TSetting[] = [
  ...commonSettings,
  ...load(BASIC_SETTINGS).filter('style.overflow'),
];

export default Settings;
