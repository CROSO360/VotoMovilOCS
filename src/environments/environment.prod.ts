export const environment = {
  production: true,
  baseURL: '/api',        // Nginx redirige a NestJS
  socketURL: '/',         // WebSocket también pasa por proxy
  socketPath: '/api/socket.io',
};
