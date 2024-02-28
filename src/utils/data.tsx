export interface Conge {
  id: number;
  title: string;
  startDate: Date;
  endDate: Date;
  color?: string;
}

export const congesList: Conge[] = [
  {
    id: 1,
    title: 'Nasrallah',
    startDate: new Date('2024-02-13'),
    endDate: new Date('2024-02-15'),
    color: 'indianred',
  },
  {
    id: 2,
    title: 'Mehdi',
    startDate: new Date('2024-02-13'),
    endDate: new Date('2024-02-20'),
  },
  {
    id: 3,
    title: 'Ayoub',
    startDate: new Date('2024-02-15'),
    endDate: new Date('2024-02-18'),
    color: '#A3C9AA',
  },
  {
    id: 4,
    title: 'Qodly Team',
    startDate: new Date('2024-03-11'),
    endDate: new Date('2024-03-20'),
    color: 'cornflowerblue',
  },
];
