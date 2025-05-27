import { PartialType } from"../../utils/partial-type";
import { CreatePropertyDto } from "./CreatePropertyDto";


export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}
