#include <ESP8266WiFi.h>
#include <WifiUdp.h>
//#include <ESP8266Audio.h>

const char *ssid = "Intercom";
const char *password = "iNTERcom";
IPAddress serverIP(10,42,0,1);
const int serverPort = 6948;

const int sampleRate = 8000;
const int bitsPerSample = 16;
const int channels = 1;
const int bufferSize = 1024;
char *buf;
char *bufReceive;
//AudioData audioData;

WiFiUDP udp;

void sampleMicrophone(char buf[]);
void playAudio(char buf[]);
void sendPacket(char buf[]);

void setup() {
  Serial.begin(115200);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }

  Serial.printf("Connected to %s with IP: %s", ssid, WiFi.localIP().toString());
  serverIP = WiFi.gatewayIP();

  //init buffers
  buf = new char[bufferSize];
  bufReceive = new char[bufferSize];
  
  //Set up udp
  udp.begin(serverPort);

  Serial.println("Init done");
}
int counter = 0;
void loop() 
{
  while(true)
  {
    sampleMicrophone(buf, counter);
    sendPacket(buf);
    receivePacket(bufReceive);
    playAudio(bufReceive);
  }
}

void sampleMicrophone(char buf[], int &lastEl)
{
  float sample = analogRead(A0);
  sample = map(sample, 0,1023,0,255);
  if(lastEl >= bufferSize)
    return;
  buf[++lastEl] = sample;
  
}

void sendPacket(char buf[])
{
  udp.beginPacket(serverIP, serverPort);
  udp.write(buf);
  udp.endPacket();
}

void receivePacket(char buf[])
{
  int packetSize = udp.parsePacket();
  if (packetSize <= 0)
    return;
  int bytesRead = udp.read(buf, bufferSize);
  buf[bytesRead] = '\0';
  
}
void playAudio(char buf[])
{
  
}           
