#include "server.hpp"

int main() {
   
    int sockfd = initSocket();
    if(sockfd < 0){
        std::cerr << "Error creating socket" << std::endl;
        return 1;
    }
    
    struct sockaddr_in clientAddr;
    while(true) {
        listenForPackets(sockfd, clientAddr);
        //sendPacket("Hello from server", sockfd, clientAddr);
    }

    // Close the socket (unreachable in this example)
    close(sockfd);

    return 0;
}
