export interface ItineraryStop {
  time: string;
  slot: string;
  name: string;
  description: string;
  duration: string;
  category: string;
  tip?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  stops: ItineraryStop[];
}
