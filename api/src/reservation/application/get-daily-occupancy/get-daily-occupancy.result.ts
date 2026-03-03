export type DailyOccupancySpot = {
  spotId: string;
  row: string;
  number: number;
  hasCharger: boolean;
  isActive: boolean;
  isAvailableAM: boolean;
  isAvailablePM: boolean;
};

export type GetDailyOccupancyResult = {
  date: string;
  spots: DailyOccupancySpot[];
};
