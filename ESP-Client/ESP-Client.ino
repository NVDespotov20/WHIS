#include <ESP8266WiFi.h>
#include <WifiUdp.h>
//#include <ESP8266Audio.h>

const char *ssid = "Intercom";
const char *password = "iNTERcom";
const char *serverIP = "10.42.0.1";
const unsigned int serverPort = 6948;

const int sampleRate = 8000;
const int bitsPerSample = 16;
const int channels = 1;
const int bufferSize = 1024;

char* packetBuffer;
//AudioData audioData;

WiFiUDP udp;

void setup() {
  Serial.begin(115200);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }

  Serial.println("Connected to WiFi");
  
  //Set up udp
  packetBuffer = new char[bufferSize];
  udp.begin(serverPort);
  // Set up the audio library
  //Audio.begin(sampleRate, bitsPerSample, channels);
}

void loop() {
  /*// Capture audio from the microphone
  int16_t buffer[bufferSize];
  int bytesRead = Audio.read(buffer, bufferSize);

  if (bytesRead > 0) {
    // Send audio data to the Raspberry Pi
    udp.beginPacket(serverIP, serverPort);
    udp.write((uint8_t *)buffer, bytesRead * 2); // 2 bytes per sample
    udp.endPacket();
    Serial.println("Audio data sent to Raspberry Pi");
  */

  // Check for incoming audio data from the Raspberry Pi
  int packetSize = udp.parsePacket();
  if (packetSize > 0) {
    int bytesRead = udp.read(packetBuffer, bufferSize);
    if (bytesRead > 0) {
      // Play the received audio data on the speaker
      //Audio.write(buffer, bytesRead / 2); // 2 bytes per sample
      Serial.print("Message from pi: ");
      for(int i = 0; i < packetSize; ++i)
        Serial.print(packetBuffer[i]);
      Serial.println("Audio data received from Raspberry Pi");
    }
  }

  //Send Packet
  udp.beginPacket(Udp.remoteIP(), Udp.remotePort());
  udp.write(replyPacket);
  udp.endPacket();
}
