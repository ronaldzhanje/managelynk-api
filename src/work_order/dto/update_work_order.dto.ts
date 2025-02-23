import { PartialType } from '@nestjs/swagger';
import { CreateWorkOrderDto } from './create_work_order.dto';

export class UpdateWorkOrderDto extends PartialType(CreateWorkOrderDto) {} 