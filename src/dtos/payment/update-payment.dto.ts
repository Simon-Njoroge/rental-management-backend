import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentDto } from './CreatePaymentDtos';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {}
