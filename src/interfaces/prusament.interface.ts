export interface PrusamentFilament {
  color_name: string;
  color_rgb: string;
  material: string;
  name: string;
  photo_url: string;
  grade: number;
  he_min: number;
  he_max: number;
  hb_min: number;
  hb_max: number;
}

export interface PrusamentGoodsObject {
  ff_goods_id: number;
  country: string;
  sample: boolean;
  diameter_avg: number;
  diameter_measurement: string;
  diameter_measurement_full: string;
  diameter_standard_deviation: number;
  filament: PrusamentFilament;
  length: number;
  manufacture_date: string; // ISO 8601 date string
  time_zone_difference: string;
  max_diameter_offset: string;
  ovality: number;
  weight: number;
  spool_weight: number;
}
