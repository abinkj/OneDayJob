// Test script to verify socket connection
const { io } = require('socket.io-client');

const SOCKET_URL = 'http://192.168.0.110:8000';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODQzZWQ3MjcyOTczZjQ0ZTkyMjNiMzgiLCJwaG9uZU51bWJlciI6Iis5MTk0OTc0Mjk5ODkiLCJyb2xlIjoidXNlciIsImlhdCI6MTc1NzMxNDM0NSwiZXhwIjoxNzU3OTE5MTQ1fQ.PcogB659F6eGK0a-tS6h5GxvkEXvdEDyciYtT0yYuG8';

console.log('Testing Socket.IO connection...');
console.log('Server URL:', SOCKET_URL);

const socket = io(SOCKET_URL, {
  auth: { token: TEST_TOKEN },
  transports: ['polling', 'websocket'],
  timeout: 60000,
  forceNew: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

socket.on('connect', () => {
  console.log('✅ Socket connected successfully!');
  console.log('Socket ID:', socket.id);
  
  // Test joining a conversation
  socket.emit('join-conversation', { conversationId: '68bbf24c2b82ffc2c8b14cc7' });
  console.log('📨 Sent join-conversation event');
});

socket.on('connected', (data) => {
  console.log('✅ Socket authentication successful:', data);
});

socket.on('conversation-joined', (data) => {
  console.log('✅ Joined conversation:', data);
});

socket.on('new-message', (data) => {
  console.log('📨 New message received:', data);
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Socket disconnected:', reason);
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

// Test sending a message after 3 seconds
setTimeout(() => {
  if (socket.connected) {
    console.log('📤 Testing message send...');
    socket.emit('send-message', {
      conversationId: '68bbf24c2b82ffc2c8b14cc7',
      text: 'Test message from socket test script',
      type: 'text'
    });
  } else {
    console.log('❌ Socket not connected, cannot test message send');
  }
}, 3000);

// Close connection after 10 seconds
setTimeout(() => {
  console.log('🔌 Closing test connection...');
  socket.disconnect();
  process.exit(0);
}, 10000);

