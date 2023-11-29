#pragma once
#include <iostream>
#include <cstring>
#include <unistd.h>
#include <arpa/inet.h>

const int PORT = 6948;

int initSocket();
void listenForPackets(int sockfd, struct sockaddr_in &clientAddr);
void sendPacket(char packet[], int sockfd, struct sockaddr_in &clientAddr);
void appendAudioToMP3(const char *mp3FileName, const unsigned char *audioBuffer);
