# Temporary client to test the server
# Will be deleted once the ESP8266 is configured corrrectly

import socket

SERVER_IP = "localhost"
SERVER_PORT = 3848

# Create a UDP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# Set the destination server address
server_address = (SERVER_IP, SERVER_PORT)

try:
    # Send a message to the server
    message = "Hello, Server!"
    sock.sendto(message.encode(), server_address)
    print(f"Message sent to server: {message}")

finally:
    # Close the socket
    sock.close()
