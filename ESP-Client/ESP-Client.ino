#include <ESP8266WiFi.h>
#include <WiFiUdp.h>
#include "AudioFileSourceICYStream.h"
#include "AudioFileSourceBuffer.h"
#include "AudioGeneratorMP3.h"
#include "AudioOutputI2SNoDAC.h"

// Server information
const char *ssid = "Intercom"; //Intercom
const char *password = "iNTERcom"; //iNTERcom
IPAddress serverIP(10,42,0,1); //10,42,0,1
const int serverPort = 6948;

// UDP information
WiFiUDP udp;

// Audio capture information
const int sampleRate = 8000;
const int bitsPerSample = 16;
const int channels = 1;
const int bufferSize = 1024;
unsigned char *buf;
#define MIC_PIN A0

// Audio play information
const char *URL="http://10.42.0.1/audio/sample.mp3";
AudioGeneratorMP3 *mp3;
AudioFileSourceICYStream *file;
AudioFileSourceBuffer *buff;
AudioOutputI2SNoDAC *out;

void sampleMicrophone(unsigned char buf[], int n);
void sendPacket(unsigned char buf[]);
void playAudio();

void MDCallback(void *cbData, const char *type, bool isUnicode, const char *string)
{
  const char *ptr = reinterpret_cast<const char *>(cbData);
  (void) isUnicode; // Punt this ball for now
  // Note that the type and string may be in PROGMEM, so copy them to RAM for printf
  char s1[32], s2[64];
  strncpy_P(s1, type, sizeof(s1));
  s1[sizeof(s1)-1]=0;
  strncpy_P(s2, string, sizeof(s2));
  s2[sizeof(s2)-1]=0;
  //Serial.printf("METADATA(%s) '%s' = '%s'\n", ptr, s1, s2);
  Serial.flush();
}

// Called when there's a warning or error (like a buffer underflow or decode hiccup)
void StatusCallback(void *cbData, int code, const char *string)
{
  const char *ptr = reinterpret_cast<const char *>(cbData);
  // Note that the string may be in PROGMEM, so copy it to RAM for printf
  char s1[64];
  strncpy_P(s1, string, sizeof(s1));
  s1[sizeof(s1)-1]=0;
  //Serial.printf("STATUS(%s) '%d' = '%s'\n", ptr, code, s1);
  Serial.flush();
}

void setup() {
  Serial.begin(115200);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.printf("Connected to %s", ssid);
  serverIP = WiFi.gatewayIP();

  // Setup audio playback
  audioLogger = &Serial;
  file = new AudioFileSourceICYStream(URL);
  file->RegisterMetadataCB(MDCallback, (void*)"ICY");
  buff = new AudioFileSourceBuffer(file, 8192);
  buff->RegisterStatusCB(StatusCallback, (void*)"buffer");
  out = new AudioOutputI2SNoDAC();
  mp3 = new AudioGeneratorMP3();
  mp3->RegisterStatusCB(StatusCallback, (void*)"mp3");
  mp3->begin(buff, out);


  // Setup audio capture
  buf = new char[bufferSize];

  // Setup UDP
  udp.begin(serverPort);
  Serial.println("Init done");
}
int n = 0;
void loop() 
{
  const unsigned long refreshInterval = 31; // ms
  unsigned long lastRefreshTime = 0;
  
  while(true)
  {
    if(micros() - lastRefreshTime >= refreshInterval){
      lastRefreshTime += refreshInterval;
      sampleMicrophone(buf, n);
      ++n;
    }
    if(n == bufferSize){
      sendPacket(buf);
      n = 0;
    }
    playAudio();
  }
}


void sampleMicrophone(unsigned char buf[], int n)
{
    int sample = analogRead(MIC_PIN);
    buf[n] = (char)map(sample, 0, 1023, 0, 255);
}
void sendPacket(unsigned char buf[])
{
  udp.beginPacket(serverIP, serverPort);
  udp.write(buf, bufferSize);
  udp.endPacket();
  
}

void playAudio()
{
  static int lastms = 0;

  if (mp3->isRunning()) {
    if (millis()-lastms > 1000) {
      lastms = millis();
      Serial.flush();
    }
    if (!mp3->loop()) mp3->stop();
  }
}           
