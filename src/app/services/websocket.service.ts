import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
@Injectable({
 providedIn: 'root',
})
export class WebSocketService {
 private webSocket: Socket;
 constructor() {
  this.webSocket = new Socket({
   //url: "http://localhost:3000",
    url: "/",
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