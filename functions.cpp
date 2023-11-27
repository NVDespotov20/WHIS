#include "server.hpp"

int initSocket() {
     // Create a UDP socket
    int sockfd = socket(AF_INET, SOCK_DGRAM, 0);
    if (sockfd < 0) {
        std::cerr << "Error creating socket" << std::endl;
        return -1;
    }

    // Configure server address
    struct sockaddr_in serverAddr;
    memset(&serverAddr, 0, sizeof(serverAddr));
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_addr.s_addr = INADDR_ANY;
    serverAddr.sin_port = htons(PORT);

    // Bind the socket
    if (bind(sockfd, (struct sockaddr*)&serverAddr, sizeof(serverAddr)) < 0) {
        std::cerr << "Error binding socket" << std::endl;
        close(sockfd);
        return -1;
    }

    printf("Server listening on port %i\n", PORT);
    return sockfd;
}

void listenForPackets(int sockfd, struct sockaddr_in &clientAddr) {
    printf("Waiting for data...\n");
    // Receive data from the client
    char buffer[1024];
    socklen_t clientLen = sizeof(clientAddr);

    ssize_t recvLen = recv(sockfd, buffer, sizeof(buffer), 0);

    if (recvLen < 0) {
        std::cerr << "Error receiving data" << std::endl;
        return;
    }
    // Process the received data (replace with your audio processing logic)
    std::cout << "Received from " << inet_ntoa(clientAddr.sin_addr) << ": "
                << buffer <<" END\n";
        
}

void sendPacket(char packet[1024], int sockfd, struct sockaddr_in &clientAddr) {
    //send reply to client
    
    sendto(sockfd, packet, strlen(packet), 0,
            (struct sockaddr*)&clientAddr, sizeof(clientAddr));
}