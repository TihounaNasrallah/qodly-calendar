## Overview

This Calendar Component is a versatile tool designed to provide an intuitive and interactive calendar interface . It allows users to easily navigate between months, or years, show data related to every single day

## Calendar Component

![The Calendar Component](https://github.com/TihounaNasrallah/qodly-calendar/assets/73143827/221a3ea5-c749-45b6-bd0a-1295825e4a46)

### Properties :

| Name              | Type             | Default        | Description                                              |
| ----------------- | ---------------- | -------------- | -------------------------------------------------------- |
| Current Day Color | string           | #4169E1        | Sets the background color of the current day number      |
| Colors            | Array of Strings | Auto-generated | Sets the background color of the displayed elements      |
| Year Navigation   | boolean          | true           | If false, the year navigation buttons won't be displayed |
| Row Height        | string           | 150px          | Sets the Height of the calendar rows                     |
| Border Radius     | string           | 6px            | Sets the border redius of the displayed elements         |

### Data Access Properties :

| Name        | Type             | Required | Description                                               |
| ----------- | ---------------- | -------- | --------------------------------------------------------- |
| Data Source | Array of Objects | Yes      | Will contain an array of objects                          |
| Property    | string           | Yes      | Will contain the property to be displayed                 |
| First Date  | string           | Yes      | Will contain the attribute of the start date in our array |
| Last Date   | string           | Yes      | Will contain the attribute of the end date in our array   |
| Attributes  | Array of Strings | No       | Sets the additional properties to be displayed            |

### Custom CSS :

The Calendar Componant is divided to two main parts, we can access each one through the "calendar-header" and "calendar-grid" css classes :

![calendar-header](https://github.com/TihounaNasrallah/qodly-calendar/assets/73143827/e01c75f2-e379-4d37-8d99-1a90e3363386)

Here is a basic example :

```css
/* Make the header disappear */
self .calendar-header {
  display: none;
}

/* Style the navigation buttons */
self .nav-button {
  border: 1px solid blue;
  border-radius: 50%;
  color: blue;
}

/* Style the month title */
self .month-title {
  color: blue;
  font-size: 26px;
}
```

![calendar-grid](https://github.com/TihounaNasrallah/qodly-calendar/assets/73143827/4229c329-0304-4a05-a3d4-9c36188d4a5a)

Here is a basic example :

```css
/* When we hover a day container, its color change */
self .day-container:hover {
  background-color: #f0f0f0;
}
```
