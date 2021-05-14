import { AdminDataReturnDto } from './dto/admin-data-return.dto';
import { DynamicDataUnit } from './enum/dynamic-data-unit';
import { Body, Get, Param } from '@nestjs/common';
import { Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiOperation,
  ApiConsumes,
  ApiBearerAuth,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { UploadAdminAreaDynamicDataDto } from './dto/upload-admin-area-dynamic-data.dto';
import { AdminAreaDynamicDataService } from './admin-area-dynamic-data.service';
import { UploadTriggerPerLeadTimeDto } from '../event/dto/upload-trigger-per-leadtime.dto';
@ApiBearerAuth()
@ApiTags('admin-area-dynamic-data')
@Controller('admin-area-dynamic-data')
export class AdminAreaDynamicDataController {
  private readonly adminAreaDynamicDataService: AdminAreaDynamicDataService;
  public constructor(adminAreaDynamicDataService: AdminAreaDynamicDataService) {
    this.adminAreaDynamicDataService = adminAreaDynamicDataService;
  }

  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Upload exposure data at a regular interval',
  })
  @Post('exposure')
  @ApiConsumes()
  @UseInterceptors()
  public async exposure(
    @Body() placeCodeExposure: UploadAdminAreaDynamicDataDto,
  ): Promise<void> {
    await this.adminAreaDynamicDataService.exposure(placeCodeExposure);
  }

  @ApiOperation({ summary: 'Get dynamic admin-area data' })
  @ApiParam({ name: 'countryCode', required: true, type: 'string' })
  @ApiParam({ name: 'adminLevel', required: true, type: 'number' })
  @ApiParam({ name: 'leadTime', required: true, type: 'string' })
  @ApiParam({ name: 'key', required: true, type: 'string' })
  @Get(':countryCode/:adminLevel/:leadTime/:key')
  public async getAdminAreaData(
    @Param() params,
  ): Promise<AdminDataReturnDto[]> {
    return await this.adminAreaDynamicDataService.getAdminAreaDynamicData(
      params.countryCode,
      params.adminLevel,
      params.leadTime,
      params.key as DynamicDataUnit,
    );
  }
}
