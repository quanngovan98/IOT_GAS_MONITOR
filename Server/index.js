var admin = require('firebase-admin');
var serviceAccountKey = require('./serviceAccountKey.json');

const PORT = 3484; //Đặt địa chỉ Port được mở ra để tạo ra chương trình mạng Socket Server

var http = require('http') //#include thư viện http - Tìm thêm về từ khóa http nodejs trên google nếu bạn muốn tìm hiểu thêm. Nhưng theo kinh nghiệm của mình, Javascript trong môi trường NodeJS cực kỳ rộng lớn, khi bạn bí thì nên tìm hiểu không nên ngồi đọc và cố gắng học thuộc hết cái reference (Tài liêu tham khảo) của nodejs làm gì. Vỡ não đó!
var socketio = require('socket.io') //#include thư viện socketio

var ip = require('ip');
var app = http.createServer(); //#Khởi tạo một chương trình mạng (app)
var io = socketio(app); //#Phải khởi tạo io sau khi tạo app!
app.listen(PORT); // Cho socket server (chương trình mạng) lắng nghe ở port 3484
admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
})
console.log("Server nodejs chay tai dia chi: " + ip.address() + ":" + PORT)

//giải nén chuỗi JSON thành các OBJECT
function ParseJson(jsondata) {
    try {
        return JSON.parse(jsondata);
    } catch (error) {
        return null;
    }
}
let canSend = true;
setInterval(() => {
        canSend = true;
    }, 10000)
    //Khi có mệt kết nối được tạo giữa Socket Client và Socket Server
io.on('connection', function(socket) { //'connection' (1) này khác gì với 'connection' (2)
    //hàm console.log giống như hàm Serial.println trên Arduino
    console.log("Connected"); //In ra màn hình console là đã có một Socket Client kết nối thành công.
    //Khi lắng nghe được lệnh "connection" với một tham số, và chúng ta đặt tên tham số là message. Mình thích gì thì mình đặt thôi.
    //'connection' (2)
    socket.on('connection', function(message) {
        console.log(message);
    });

    socket.on('smokeData', function(data) {
        console.log(parseInt(data.smokeMagnitude, 10));
        if (parseInt(data.smokeMagnitude, 10) > 150) {
            if (canSend) {
                console.log("SMS sent");
                canSend = false;
            }
            const Nexmo = require('nexmo');

            const nexmo = new Nexmo({
                apiKey: 'key',
                apiSecret: 'secret',
            });

            const from = 'Gas monitor server';
            const to = '84326381799';
            const text = `Warning, your gas magnitude is ${data.smokeMagnitude}`;

            nexmo.message.sendSms(from, to, text);
        }
        admin.firestore().collection('GasSensor').doc("1:00").set({
            time: "1:00",
            magnitude: data.smokeMagnitude,
        })
    });
});
