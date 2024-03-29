import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { CampaignService } from '../campaign/campaign.service';
import { ContactService } from '../contact/contact.service';
import { SendingMessageService } from './sending.message.service';

@WebSocketGateway()
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private clients: Set<Socket> = new Set();

  @WebSocketServer() server: Server;

  constructor(private readonly sendingMessageService: SendingMessageService) {}
  afterInit(server: Server) {
    console.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.clients.add(client);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.clients.delete(client);
  }

  @SubscribeMessage('sendCampaignMessage')
  handleSendCampaignMessage(client: Socket, campaignId: number): void {
    this.sendingMessageService.sendCampaignMessage(campaignId);
  }

  @SubscribeMessage('sendCampaignRejectMessage')
  handleSendCampaignRejectMessage(client: Socket, campaignId: number): void {
    this.sendingMessageService.sendCampaignRejectMessage(campaignId);
  }

  @SubscribeMessage('updateListCampaign')
  handleUpdateListCampaign(client: Socket, payload: any): void {
    this.server.emit('updateListCampaign', payload);
  }

  @SubscribeMessage('connectionPage')
  handleConnectionPage(client: Socket, payload: any): void {
    this.server.emit('connectionPage', payload);
  }

  @SubscribeMessage('connectionPageOK')
  handleConnectionPageOK(client: Socket, payload: any): void {
    this.server.emit('connectionPageOK', payload);
  }

  @SubscribeMessage('cancelSendCampaignMessage')
  handleCancelSendCampaignMessage(client: Socket, payload: any): void {
    this.server.emit('cancelSendCampaignMessage', payload);
  }
}
