import { CRS, Layer, LayerGroup, Marker } from 'leaflet';

export class IbfLayer {
  type: IbfLayerType;
  name: IbfLayerName;
  label: IbfLayerLabel;
  description: string;
  active: boolean;
  show: boolean;
  viewCenter: boolean;
  order: number;
  colorProperty?: string;
  wms?: IbfLayerWMS;
  data?: GeoJSON.FeatureCollection;
  leafletLayer?: Layer | LayerGroup | Marker;
  legendColor?: string;
  group?: IbfLayerGroup;
}

export enum IbfLayerType {
  point = 'point',
  shape = 'shape',
  wms = 'wms',
}

export enum IbfLayerName {
  glofasStations = 'glofas_stations',
  redCrossBranches = 'red_cross_branches',
  waterpoints = 'waterpoints',
  floodExtent = 'flood_extent',
  population = 'population',
  adminRegions = 'Admin regions',
  cropland = 'cropland',
  grassland = 'grassland',
  population_affected = 'population_affected',
  vulnerability_score = 'vulnerability_score',
  vulnerability_index = 'vulnerability_index',
  poverty_incidence = 'poverty_incidence',
  female_head_hh = 'female_head_hh',
  population_u8 = 'population_u8',
  population_over65 = 'population_over65',
  wall_type = 'wall_type',
  roof_type = 'roof_type',
}

export enum IbfLayerLabel {
  glofasStations = 'Glofas stations',
  redCrossBranches = 'Red Cross branches',
  waterpoints = 'Waterpoints',
  floodExtent = 'Flood extent',
  population = 'Population',
  adminRegions = 'Admin regions',
  cropland = 'Cropland',
  grassland = 'Grassland',
  population_affected = 'Exposed population',
  vulnerability_score = 'Vulnerability index',
  vulnerability_index = 'Vulnerability index',
  poverty_incidence = 'Poverty incidence',
  female_head_hh = 'Female-headed household',
  population_u8 = 'Population U8',
  population_over65 = 'Population 65+',
  wall_type = 'Permanent wall type',
  roof_type = 'Permanent roof type',
}

export class IbfLayerWMS {
  url: string;
  name: string;
  format: string;
  version: string;
  attribution: string;
  crs?: CRS;
  transparent: boolean;
}

export enum IbfLayerGroup {
  aggregates = 'aggregates',
}
