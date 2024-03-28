import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io-client';

@Injectable()
export class SocketService {
  private socket: Socket;

  constructor() {
    const url = `${process.env.PROTOCOLE}://${process.env.HOST}:${process.env.PORT}`;
    this.socket = require('socket.io-client')(url); // Replace with your server URL
    //this.setupSocketEvents();
  }

  // private  setupSocketEvents() {
  //   // Listen to 'messageToClient' event from the server
  //   this.socket.on('messageToClient', (data) => {
  //     console.log('Received serverEvent:', data);
  //   });
  // }

  public listenEvent(event: string, callback: (param: any) => void) {
    // Listen  event from the server
    this.socket.on(event, (data) => {
      callback(data);
    });
  }

  public stoplistenEvent(event: string, callback: (param: any) => void) {
    // StopListen  event from the server
    this.socket.off(event);
  }

  // Emit 'messageToServer' event to the server
  public emitClientEvent(event: string, payload: any) {
    this.socket.emit(event, { payload });
  }
}
