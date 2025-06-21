import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { environment } from '../../environments/environment';
@Injectable({
 providedIn: 'root',
})
export class WebSocketService {
 private webSocket: Socket;
 constructor() {
  this.webSocket = new Socket({
      url: environment.socketURL, // URL del servidor WebSocket, definida en environment.ts
    options: {
      path: '/api/socket.io',
      transports: ['websocket'],
      withCredentials: true,
    },
  });
 }

 onChange() {
    return this.webSocket.fromEvent('change');
  }
}