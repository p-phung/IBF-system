import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { EventSummaryCountry } from './data.model';
/* eslint-disable @typescript-eslint/camelcase */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, getManager } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { AdminAreaDataRecord, TriggeredArea } from './data.model';
import {
    GeoJson,
    GeoJsonFeature,
    GlofasStation,
    RedCrossBranch,
} from './geo.model';
import fs from 'fs';
import { TriggerPerLeadTime } from '../event/trigger-per-lead-time.entity';
import { CountryEntity } from '../country/country.entity';

@Injectable()
export class DataService {
    @InjectRepository(UserEntity)
    private manager: EntityManager;

    @InjectRepository(CountryEntity)
    private readonly countryRepository: Repository<CountryEntity>;

    @InjectRepository(TriggerPerLeadTime)
    private readonly triggerPerLeadTimeRepository: Repository<
        TriggerPerLeadTime
    >;

    public constructor(manager: EntityManager) {
        this.manager = manager;
    }

    public async getAdminAreaData(
        countryCodeISO3: string,
        adminLevel: number,
        leadTime: string,
    ): Promise<GeoJson> {
        if (!leadTime) {
            leadTime = await this.getDefaultLeadTime(countryCodeISO3);
        }
        const trigger = (await this.getTriggerPerLeadtime(countryCodeISO3))[
            leadTime
        ];
        let placeCodes;
        if (parseInt(trigger) === 1) {
            placeCodes = (await this.getTriggeredAreas(countryCodeISO3)).map(
                (triggeredArea): string => "'" + triggeredArea.placeCode + "'",
            );
        }

        const query =
            `select *
    from "IBF-API"."Admin_area_data` +
            adminLevel +
            `"
    where 0 = 0
    and lead_time = $1
    and countryCodeISO3 = $2`.concat(
                placeCodes && placeCodes.length > 0
                    ? ' and "placeCode" in (' + placeCodes.toString() + ')'
                    : '',
            );
        const rawResult: AdminAreaDataRecord[] = await this.manager.query(
            query,
            [leadTime, countryCodeISO3],
        );
        const result = this.toGeojson(rawResult);
        return result;
    }

    public async getDefaultLeadTime(countryCodeISO3: string): Promise<string> {
        const findOneOptions = {
            countryCodeISO3: countryCodeISO3,
        };
        const country = await this.countryRepository.findOne(findOneOptions, {
            relations: ['countryActiveLeadTimes'],
        });
        for (const activeLeadTime of country.countryActiveLeadTimes) {
            if (activeLeadTime.leadTimeName === LeadTime.day7) {
                return activeLeadTime.leadTimeName;
            }
        }
        for (const activeLeadTime of country.countryActiveLeadTimes) {
            if (activeLeadTime.leadTimeName === LeadTime.month0) {
                return activeLeadTime.leadTimeName;
            }
        }
        // If country does not have 7 day or 1 month lead time return the first
        return country.countryActiveLeadTimes[0].leadTimeName;
    }

    public async getStations(
        countryCodeISO3: string,
        leadTime: string,
    ): Promise<GeoJson> {
        const query =
            ' select * \
    from "IBF-API"."Glofas_stations" \
    where 0 = 0 \
    and lead_time = $1 \
    and countryCodeISO3 = $2 \
    ';

        const rawResult: GlofasStation[] = await this.manager.query(query, [
            leadTime,
            countryCodeISO3,
        ]);

        const result = this.toGeojson(rawResult);

        return result;
    }

    public async getRedCrossBranches(
        countryCodeISO3: string,
    ): Promise<GeoJson> {
        const query =
            ' select * \
    from "IBF-API"."redcross_branches" \
    where 0 = 0 \
    and "countryCodeISO3" = $1 \
    ';

        const rawResult: RedCrossBranch[] = await this.manager.query(query, [
            countryCodeISO3,
        ]);

        const result = this.toGeojson(rawResult);

        return result;
    }

    public async getRecentDates(countryCodeISO3: string): Promise<object[]> {
        const result = await this.triggerPerLeadTimeRepository.findOne({
            where: { countryCodeISO3: countryCodeISO3 },
            order: { date: 'DESC' },
        });
        if (!result) {
            return [];
        }
        return [{ date: new Date(result.date).toISOString() }];
    }

    public async getTriggerPerLeadtime(
        countryCodeISO3: string,
    ): Promise<object> {
        const latestDate = await this.getOneMaximumTriggerDate(countryCodeISO3);
        const triggersPerLeadTime = await this.triggerPerLeadTimeRepository.find(
            {
                where: { countryCodeISO3: countryCodeISO3, date: latestDate },
            },
        );
        if (triggersPerLeadTime.length === 0) {
            return;
        }
        const result = {};
        result['date'] = triggersPerLeadTime[0].date;
        result['countryCodeISO3'] = triggersPerLeadTime[0].countryCodeISO3;
        for (const leadTimeKey in LeadTime) {
            const leadTimeUnit = LeadTime[leadTimeKey];
            const leadTimeIsTriggered = triggersPerLeadTime.find(
                (el): boolean => el.leadTime === leadTimeUnit,
            );
            if (leadTimeIsTriggered) {
                result[leadTimeUnit] = String(
                    Number(leadTimeIsTriggered.triggered),
                );
            } else {
                result[leadTimeUnit] = '0';
            }
        }
        return result;
    }

    private async getOneMaximumTriggerDate(countryCodeISO3): Promise<Date> {
        const result = await this.triggerPerLeadTimeRepository.findOne({
            order: { date: 'DESC' },
            where: { countryCodeISO3: countryCodeISO3 },
        });
        return result.date;
    }

    public async getTriggeredAreas(
        countryCodeISO3: string,
    ): Promise<TriggeredArea[]> {
        const query = fs
            .readFileSync('./src/api/data/sql/get-triggered-areas.sql')
            .toString();

        const result = await this.manager.query(query, [countryCodeISO3]);
        return result;
    }

    public async getEventSummaryCountry(
        countryCodeISO3: string,
    ): Promise<EventSummaryCountry> {
        const query = fs
            .readFileSync('./src/api/data/sql/get-event-summary-country.sql')
            .toString();
        const result = await this.manager.query(query, [countryCodeISO3]);
        if (!result[0].startDate) {
            return null;
        }
        return result[0];
    }

    public toGeojson(rawResult): GeoJson {
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
}
