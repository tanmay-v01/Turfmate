import { io } from 'socket.io-client';
import env from '../config/env';

const SOCKET_URL = env.socketUrl;

class SocketService {
  constructor() {
    this.socket = null;
    this.userId = null;
  }

  connect(userId) {
    this.userId = userId;
    if (!this.socket) {
      this.socket = io(SOCKET_URL);

      this.socket.on('connect', () => {
        console.log('Connected to socket server with ID:', this.socket.id);
      });
    }
  }

  joinRoom(roomId) {
    if (this.socket) {
      this.socket.emit('join_room', roomId);
    }
  }

  sendMessage(roomId, userName, text, type = 'TEXT', callback) {
    if (this.socket) {
      this.socket.emit('send_message', {
        roomId,
        userId: this.userId,
        userName,
        text,
        type
      }, callback);
    }
  }

  onMessageReceived(callback) {
    if (this.socket) {
      this.socket.on('receive_message', callback);
    }
  }

  sendTyping(roomId, userName, isTyping) {
    if (this.socket) {
      this.socket.emit(isTyping ? 'typing' : 'stop_typing', { roomId, userName });
    }
  }

  onTyping(callback) {
    if (this.socket) {
      this.socket.on('typing', callback);
    }
  }

  onStopTyping(callback) {
    if (this.socket) {
      this.socket.on('stop_typing', callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
