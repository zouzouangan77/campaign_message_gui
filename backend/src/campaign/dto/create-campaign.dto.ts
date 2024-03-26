import {CreateAttachmentDto} from "../../attachment/dto/create-attachment.dto";
import {CreateMessageDto} from "../../message/dto/create-message.dto";

export class CreateCampaignDto {
    id?: number;
    name: string;
    createDate?: Date;
    updateDate?: Date;
    statut: string;
    canal: string;
    message: {id: number};
    attachments?: Array<{id: number}>;
    groups: Array<{id: number}>;
}

export class CreateCampaignSendingDto {
    id: number;
    sendingDate?: string;
    contact:  {id: number};
    campaign:  {id: number};
}

export class CreateCampaignRejectDto {
    id: number;
    rejectDate?: string;
    contact:  {id: number};
    campaign:  {id: number};
    cause: string;
}
