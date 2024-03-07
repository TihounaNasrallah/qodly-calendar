import { useRenderer, useSources } from '@ws-ui/webform-editor';

import cn from 'classnames';
import { FC, useEffect, useState, useMemo } from 'react';

import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from 'react-icons/md';
import {
  differenceInDays,
  parseISO,
  startOfWeek,
  endOfWeek,
  endOfMonth,
  isToday,
  startOfMonth,
  addMonths,
  subMonths,
  eachDayOfInterval,
  format,
  isSameMonth,
  addDays,
} from 'date-fns';

import { ICalendarProps } from './Calendar.config';

const Calendar: FC<ICalendarProps> = ({
  att1,
  att2,
  property,
  rowHeight,
  color,
  color1,
  color2,
  color3,
  yearNav,
  style,
  className,
  classNames = [],
}) => {
  const { connect } = useRenderer();

  const {
    sources: { datasource: ds },
  } = useSources();

  const [data, setData] = useState<any[]>([]);

  const getList = async () => {
    const v = await ds?.getValue();
    return v;
  };

  useEffect(() => {
    getList()
      .then((array: any[]) => {
        setData(array);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [ds]);

  //Add color to data
  let newData = data.map((obj, index) => ({
    ...obj,
    color: index % 3 === 0 ? color1 : index % 3 === 1 ? color2 : color3,
  }));

  let list: any[] = [];
  for (let j = 0; j < newData.length; j++) {
    const conge = newData[j];
    const num = differenceInDays(parseISO(conge?.endDate), parseISO(conge?.startDate));
    for (let i = 0; i <= num; i++) {
      list.push({
        title: conge[property],
        att1: conge[att1],
        att2: conge[att2],
        startDate: addDays(parseISO(conge?.startDate), i),
        endDate: addDays(parseISO(conge?.startDate), i),
        color: conge.color,
      });
    }
  }

  const congesByDate = useMemo(() => {
    return list.reduce((acc: { [key: string]: any[] }, conge) => {
      const dateKey = format(conge?.startDate, 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(conge);
      return acc;
    }, {});
  }, [data]);

  const [date, setDate] = useState(new Date());

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(date), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(date), { weekStartsOn: 1 }),
  });

  const prevMonth = () => setDate(subMonths(date, 1));
  const nextMonth = () => setDate(addMonths(date, 1));
  const nextYear = () => setDate(addMonths(date, 12));
  const prevYear = () => setDate(subMonths(date, 12));

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const filterProperties = () => {};

  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <div className="calendar-container flex flex-col justify-center items-center gap-4 w-full h-full">
        <div className="calendar-header w-full flex justify-center gap-4 items-center">
          <button
            className="text-2xl cursor-pointer"
            onClick={prevYear}
            style={{ display: yearNav ? 'block' : 'none' }}
          >
            <MdKeyboardDoubleArrowLeft />
          </button>
          <button className="text-2xl cursor-pointer" onClick={prevMonth}>
            <MdKeyboardArrowLeft />
          </button>
          <h2 className="w-44 text-center font-medium text-xl">{format(date, 'MMMM yyyy')}</h2>
          <button className="text-2xl cursor-pointer" onClick={nextMonth}>
            <MdKeyboardArrowRight />
          </button>
          <button
            className="text-2xl cursor-pointer"
            onClick={nextYear}
            style={{ display: yearNav ? 'block' : 'none' }}
          >
            <MdKeyboardDoubleArrowRight />
          </button>
        </div>

        <div className="calendar-grid w-full grid justify-center grid-cols-7">
          {weekdays.map((day) => (
            <div key={day} className="font-medium text-lg text-center">
              {day}
            </div>
          ))}
          {daysInMonth.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const todaysConges = congesByDate[dateKey] || [];
            return (
              <div
                key={day.toString()}
                className="day-container flex flex-col justify-start items-start gap-1 py-1 px-1 w-full border border-gray-200"
                style={{
                  color: isSameMonth(day, date) ? 'black' : '#C0C0C0',
                  backgroundColor: isSameMonth(day, date) ? '' : '#F3F4F6',
                  height: rowHeight,
                }}
              >
                <div
                  className="px-2 py-1 font-medium rounded-full"
                  style={{
                    backgroundColor: isToday(day) ? color : '',
                    color: isToday(day) ? 'white' : '',
                  }}
                >
                  {format(day, 'd')}
                </div>
                <div className="date-content w-full grid grid-cols-1 gap-1 overflow-auto">
                  {todaysConges.map(
                    (
                      conge: {
                        title: string;
                        color: string;
                        att1: string;
                        att2: string;
                      },
                      index,
                    ) => {
                      return (
                        <div
                          className="conge-container px-2 py-1 flex flex-col gap-1 w-full overflow-hidden"
                          style={{
                            backgroundColor: isSameMonth(day, date) ? conge?.color : '#C0C0C0',
                          }}
                        >
                          <p key={index} className="conge-title font-medium text-white">
                            {conge.title}
                          </p>
                          <div className="conge-detail grid grid-cols-2">
                            <p className="text-white text-sm">{conge.att1}</p>
                            <p className="text-white text-sm">{conge.att2}</p>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
