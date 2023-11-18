#include <iostream>
#include <cstring>
#include <unistd.h>
#include <arpa/inet.h>

const int PORT = 6948;

int main() {
    // Create a UDP socket
    int sockfd = socket(AF_INET, SOCK_DGRAM, 0);
    if (sockfd < 0) {
        std::cerr << "Error creating socket" << std::endl;
        return 1;
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
        return 1;
    }

    std::cout << "Server listening on port " << PORT << std::endl;

    while (true) {


        // Receive data from the client
        char buffer[1024];
        struct sockaddr_in clientAddr;
        socklen_t clientLen = sizeof(clientAddr);

        ssize_t recvLen = recvfrom(sockfd, buffer, sizeof(buffer), 0,
                                   (struct sockaddr*)&clientAddr, &clientLen);

        if (recvLen < 0) {
            std::cerr << "Error receiving data" << std::endl;
            continue;
        }

        // Process the received data (replace with your audio processing logic)
        std::cout << "Received from " << inet_ntoa(clientAddr.sin_addr) << ": "
                  << buffer << std::endl;

        //send reply to client
        char reply[1024] = "Message received";
        sendto(sockfd, reply, strlen(reply), 0,
               (struct sockaddr*)&clientAddr, sizeof(clientAddr));
    }

    // Close the socket (unreachable in this example)
    close(sockfd);

    return 0;
}
