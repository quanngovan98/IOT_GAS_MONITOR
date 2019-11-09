  #include <MQ2.h>
  #include <Wire.h>
  #include <ESP8266WiFi.h>
  #include <WiFiClientSecure.h> 
  #include <ESP8266WebServer.h>
  #include <ESP8266HTTPClient.h>
  #include <SocketIOClient.h>
  #include "ArduinoJson.h"


  ////tạo biến socket 
  SocketIOClient client;
  char host[] = "168.63.135.55";  //địa chỉ IP Socket server vps
  //char host[] = "192.168.1.103";  //địa chỉ IP Socket local
  int port = 3484;
  int smokeA0 = A0;
  //I2C pins declaration
  int lpg, co, smoke, oldSmoke;
  const int buzz = D1;
 
  
  void setup(){
    Serial.begin(115200);
    pinMode(buzz,OUTPUT);
    //set input port
    //connect to wifi
    WiFi.mode(WIFI_OFF);        //Prevents reconnection issue (taking too long to connect)
    delay(1000);
    WiFi.mode(WIFI_STA);
    WiFi.begin("Yasuo", "deadlikeawind");
    Serial.print("connecting");
    while (WiFi.status() != WL_CONNECTED) {
      Serial.print(".");
      delay(500);
    } 
  
     Serial.println(F("Di chi IP cua ESP8266 (Socket Client ESP8266): "));
    Serial.println(WiFi.localIP());
 
    if (!client.connect(host, port)) {
        Serial.println(F("Ket noi den socket server that bai!"));
        return;
    }
 
    //Khi đã kết nối thành công
    if (client.connected()) {
        //Thì gửi sự kiện ("connection") đến Socket server ahihi.
        client.send("connection", "message", "Connected !!!!");
    }
  }
  void loop(){
    if(WiFi.status()== WL_CONNECTED){ 
      //read smoke value from input port
    smoke = analogRead(smokeA0);
    
     //Gửi thông tin smoke lên server
    if(smoke != oldSmoke) {
      Serial.print("smoke is ");
      Serial.print(smoke);
      Serial.print("\n");
      if(smoke >=150){
        digitalWrite(buzz,HIGH);
      } else {
        digitalWrite(buzz,LOW);
      }
      oldSmoke = smoke;
      char snum[10];
      itoa(smoke, snum, 10);
      client.send("smokeData", "smokeMagnitude", snum);  
    }
        
 
    //Kết nối lại!
    if (!client.connected()) {
      client.reconnect(host, port);
    }
    delay(3000);
    }
  }
