--
--create API view for Glofas stations
DROP TABLE IF EXISTS "IBF-API".redcross_branches;
create table "IBF-API".redcross_branches as
select "countryCodeISO3"
		,"name"
		,"numberOfVolunteers"
		,"contactPerson"
		,"contactAddress"
		,"contactNumber"
		, ST_AsGeoJSON(st_astext(geom))::json as geom
from "IBF-app"."redcrossBranch"
;
--select * from "IBF-API".redcross_branches
--
--create API view for Glofas stations
drop table if exists "IBF-API"."Glofas_stations";
create table "IBF-API"."Glofas_stations" as
select gst."countryCodeISO3" as countryCodeISO3
		,gst."leadTime" as lead_time
		,dgsv.station_code
		,dgsv.station_name
		,dgsv.trigger_level
		,dgsv.geom
	  , gst."forecastLevel" as fc
      , gst."forecastTrigger" as fc_trigger
      , gst."forecastProbability" as fc_prob
from (
	select "countryCodeISO3" as countryCodeISO3
		,"stationCode" as station_code
		,"stationName" as station_name
		,"triggerLevel" as trigger_level
		,ST_AsGeoJSON(geom)::json As geom
	from "IBF-app"."glofasStation" gs
	) dgsv
left join "IBF-app"."glofasStationTrigger" gst
	on dgsv.station_code = gst."stationCode" 
	and dgsv.countryCodeISO3 = gst."countryCodeISO3" 
	and gst.date = current_date
;
--select * from "IBF-API"."Glofas_stations" where lead_time = '3-day' and countryCodeISO3 = 'ZMB'

drop table if exists "IBF-API".admin_area_data_pivoted;
create table "IBF-API".admin_area_data_pivoted as
select aa."placeCode"
		,max(case when key = 'population_over65' then value end) as population_over65
		,max(case when key = 'female_head_hh' then value end) as female_head_hh
		,max(case when key = 'population_u8' then value end) as population_u8
		,max(case when key = 'poverty_incidence' then value end) as poverty_incidence
		,max(case when key = 'roof_type' then value end) as roof_type
		,max(case when key = 'wall_type' then value end) as wall_type
		,max(case when key = 'Weighted Vulnerability Index' then value end) as vulnerability_index
		,max(case when key = 'covid_risk' then value end) as covid_risk
		,max(case when key = 'population_u9' then value end) as population_u9
		,max(case when key = 'dengue_incidence_average' then value end) as dengue_incidence_average
		,max(case when key = 'dengue_cases_average' then value end) as dengue_cases_average
from "IBF-app"."adminArea" aa
left join "IBF-app"."adminAreaData" aad
	on aa."placeCode" = aad."placeCode"
group by 1
;

drop table if exists "IBF-API"."Admin_area_data2" cascade;
create table "IBF-API"."Admin_area_data2" as
select geo."placeCode"
	,geo."name"
	,geo."placeCodeParent" as pcode_level1
	,ST_AsGeoJSON(geo.geom)::json As geom
	,"countryCodeISO3" as countryCodeISO3
	, date
	, lead_time
	, population_affected
	, row_to_json(daad.*) as indicators
from "IBF-app"."adminArea" geo
left join (
	select "countryCodeISO3" as countryCodeISO3 
		,"leadTime" as lead_time
		,date
		,"placeCode" 
		,value as population_affected
	from "IBF-app".admin_area_dynamic_data
	where date = current_date 
	and key = 'population_affected'
) ca
	on geo."placeCode" = ca."placeCode"  
	and geo."countryCodeISO3" = ca.countryCodeISO3 
left join "IBF-API".admin_area_data_pivoted daad 
	on geo."placeCode" = daad."placeCode"
where "adminLevel" = 2
;
--select * from "IBF-API"."Admin_area_data2" where countryCodeISO3 = 'UGA'

drop table if exists "IBF-API"."Admin_area_data1" cascade;
create table "IBF-API"."Admin_area_data1" as
select geo."placeCode"
	,geo."name"
	,geo."placeCodeParent" as pcode_level0
	,ST_AsGeoJSON(geo.geom)::json As geom
	,"countryCodeISO3" as countryCodeISO3
	, date
	, lead_time
	, population_affected
	, row_to_json(daad.*) as indicators
from "IBF-app"."adminArea" geo
left join (
	select "countryCodeISO3" as countryCodeISO3 
		,"leadTime" as lead_time
		,date
		,"placeCode" 
		,value as population_affected
	from "IBF-app".admin_area_dynamic_data
	where date = current_date 
	and key = 'population_affected'
) ca
	on geo."placeCode" = ca."placeCode"  
	and geo."countryCodeISO3" = ca.countryCodeISO3 
left join "IBF-API".admin_area_data_pivoted daad 
	on geo."placeCode" = daad."placeCode"
where "adminLevel" = 1
;
--select * from "IBF-API"."Admin_area_data1" where countryCodeISO3 = 'EGY'

drop table if exists "IBF-API".admin_area_data_pivoted;

drop table if exists "IBF-API"."Matrix_aggregates2";
create table "IBF-API"."Matrix_aggregates2" as
select countryCodeISO3
	,lead_time
	,sum(population_affected) as population_affected
from "IBF-API"."Admin_area_data2"
where countryCodeISO3 is not null
group by 1,2
;
--select * from "IBF-API"."Matrix_aggregates2"

drop table if exists "IBF-API"."Matrix_aggregates1";
create table "IBF-API"."Matrix_aggregates1" as
select countryCodeISO3
	,lead_time
	,sum(population_affected) as population_affected
from "IBF-API"."Admin_area_data1"
where countryCodeISO3 is not null
group by 1,2
;
--select * from "IBF-API"."Matrix_aggregates1"
