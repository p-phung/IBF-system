/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { Station, GeoJson, GeoJsonFeature } from 'src/models/station.model';
import { type } from 'os';

@Injectable()
export class DataService {
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;

  public constructor(private manager: EntityManager) {}

  public async getData(schemaName: string, tableName: string): Promise<string> {
    const query = this.formQuery(schemaName, 'usp_fbf_data', 'ZMB', tableName);
    const result = await this.manager.query(query);
    return result[0].usp_fbf_data;
  }

  public async getGeodata(
    schemaName: string,
    tableName: string,
  ): Promise<string> {
    const query = this.formQuery(
      schemaName,
      'usp_fbf_geodata',
      'ZMB',
      tableName,
    );
    const result = await this.manager.query(query);
    return result[0].usp_fbf_geodata;
  }

  public async getAdminAreaData(
    countryCode: string,
    adminLevel: number,
    leadTime: string,
  ): Promise<GeoJson> {
    const query =
      ' select * \
    from "IBF-API"."Admin_area_data' +
      adminLevel +
      '" \
    where 0 = 0 \
    and lead_time = $1 \
    and country_code = $2 \
    ';

    const rawResult: Station[] = await this.manager.query(query, [
      leadTime,
      countryCode,
    ]);

    const result = this.toGeojson(rawResult);

    return result;
  }

  public async getAdminAreaStaticData(
    countryCode: string,
    adminLevel: number,
  ): Promise<GeoJson> {
    const query =
      ' select * \
    from "IBF-API"."Admin_area_static_level' +
      adminLevel +
      '" \
    where 0 = 0 \
    and country_code = $1 \
    ';

    const rawResult: Station[] = await this.manager.query(query, [countryCode]);

    const result = this.toGeojson(rawResult);

    return result;
  }

  public async getStations(
    countryCode: string,
    leadTime: string,
  ): Promise<GeoJson> {
    const query =
      ' select * \
    from "IBF-API"."Glofas_stations" \
    where 0 = 0 \
    and lead_time = $1 \
    and country_code = $2 \
    ';

    const rawResult: Station[] = await this.manager.query(query, [
      leadTime,
      countryCode,
    ]);

    const result = this.toGeojson(rawResult);

    return result;
  }

  public async getTriggerPerLeadtime(
    countryCode: string,
    leadTime: string,
  ): Promise<number> {
    const query =
      ' select * \
    from "IBF-API"."Trigger_per_lead_time" \
    where 0 = 0 \
    and country_code = $1 \
    ';

    const result = await this.manager.query(query, [countryCode]);

    return result[0][leadTime[0]];
  }

  public async getTriggeredAreas(
    countryCode: string,
    adminLevel: number,
    leadTime: string,
  ): Promise<any> {
    const query =
      'select pcode_level' +
      adminLevel +
      ' as pcode \
        ,"name" \
        , population_affected \
      from "IBF-API"."Admin_area_data' +
      adminLevel +
      '" \
      where country_code = $1 \
      and lead_time = $2 \
      and fc_trigger = 1 \
      order by population_affected DESC \
    ';

    const result = await this.manager.query(query, [countryCode, leadTime]);

    return result;
  }

  public async getMetadata(countryCode: string): Promise<any> {
    const query =
      ' select * \
    from "IBF-API"."metadata" \
    where 0 = 0 \
    and country_code = $1 \
    ';

    return await this.manager.query(query, [countryCode]);
  }

  public async getMatrixAggregates(
    countryCode: string,
    adminLevel: number,
    leadTime: string,
  ): Promise<any> {
    const query =
      ' select * \
    from "IBF-API"."Admin_area_data' +
      adminLevel +
      '" \
    where 0 = 0 \
    and lead_time = $1 \
    and country_code = $2 \
    ';

    const rawResult = await this.manager.query(query, [leadTime, countryCode]);

    const indicators = await this.getMetadata(countryCode);

    const result = {};
    for (let indicator of indicators) {
      const cra = typeof rawResult[0][indicator.name] === 'undefined';
      if (indicator.weightedAvg) {
        result[indicator.name] =
          this.sumProduct(rawResult, indicator.name, 'population', cra) /
          this.sum(rawResult, 'population', cra);
      } else {
        result[indicator.name] = this.sum(rawResult, indicator.name, cra);
      }
    }

    return result;
  }

  sum(items, prop, cra) {
    return items.reduce(function(a, b) {
      return a + (cra ? b.indicators[prop] : b[prop]);
    }, 0);
  }

  sumProduct(items, prop, weightKey, cra) {
    return items.reduce(function(a, b) {
      return a + b.indicators[weightKey] * (cra ? b.indicators[prop] : b[prop]);
    }, 0);
  }

  private toGeojson(rawResult): GeoJson {
    const geoJson: GeoJson = {
      type: 'FeatureCollection',
      features: [],
    };
    rawResult.forEach((i): void => {
      let feature: GeoJsonFeature = {
        type: 'Feature',
        geometry: i.geom,
        properties: {},
      };
      delete i.geom;
      feature.properties = i;
      geoJson.features.push(feature);
    });

    return geoJson;
  }

  private formQuery(schema, functionName, country, tableName): string {
    const query =
      'select "IBF-pipeline-output".' +
      functionName +
      "('" +
      country +
      "','\"" +
      schema +
      '"\',\'"' +
      tableName +
      '"\');';
    return query;
  }
}
