export interface ICalEvent {
  uid: string;
  summary: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  allDay: boolean;
  color?: string;
}

export interface ICalSettings {
  url: string;
}

export interface ICalServiceResult {
  success: boolean;
  events?: ICalEvent[];
  error?: string;
}
