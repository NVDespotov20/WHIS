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

void appendAudioToMP3(const char *mp3FilePath, const unsigned char *audioBuffer ) {
    // Initialize the LAME encoder
    lame_global_flags *lame = lame_init();
    lame_set_num_channels(lame, 1);  // 1 for mono, 2 for stereo
    lame_set_in_samplerate(lame, 8000);
    lame_set_out_samplerate(lame, 44100); 
    lame_set_brate(lame, 128);  // Set the bitrate (in kbps)
    lame_set_quality(lame, 4);  // Set the quality (2 for near-best, 7 for fast)

    // Open the output file in append mode
    std::ofstream mp3File(mp3FilePath, std::ios::binary | std::ios::app);

    // Write the MP3 header (only once, when opening the file)
    if (mp3File.tellp() == 0) {
        lame_init_params(lame);
        unsigned char mp3Header[MP3_SIZEOF_STREAMINIT + 512];
        int headerSize = lame_encode_flush(lame, mp3Header, sizeof(mp3Header));
        mp3File.write(reinterpret_cast<char*>(mp3Header), headerSize);
    }

    // Encode and write audio data
    int numSamples = BUFFER_SIZE / sizeof(short);
    short *inputBuffer = reinterpret_cast<short*>(const_cast<unsigned char*>(audioBuffer));

    for (int i = 0; i < numSamples; i += 1152) {
        int samplesToWrite = std::min(1152, numSamples - i);
        int encodedSize = lame_encode_buffer(lame, inputBuffer + i, nullptr, samplesToWrite, nullptr, 0);
        mp3File.write(reinterpret_cast<char*>(inputBuffer + i), sizeof(short) * samplesToWrite);
    }

    // Clean up
    mp3File.flush(); // Flush the ofstream to ensure data is written to file
    lame_close(lame);
    mp3File.close();
}

