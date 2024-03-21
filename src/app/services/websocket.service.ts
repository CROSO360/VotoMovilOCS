import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
@Injectable({
 providedIn: 'root',
})
export class WebSocketService {
 private webSocket: Socket;
 constructor() {
  this.webSocket = new Socket({
   url: "https://api-voto-6ggs.onrender.com",
   options: {transports: ['websocket']},
  });
 }

 onChange() {
    return this.webSocket.fromEvent('change');
  }
}