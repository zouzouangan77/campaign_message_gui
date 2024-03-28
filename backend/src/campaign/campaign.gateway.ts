import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WsResponse,
} from '@nestjs/websockets';

@WebSocketGateway()
export class CampaignGateway {
  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: unknown): WsResponse<unknown> {
    const event = 'message';
    console.log(' data = ', data);
    return { event, data: 'tony' };
  }
}
