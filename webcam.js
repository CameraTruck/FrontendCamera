let tg = window.Telegram.WebApp;
tg.expand();

function dataURLtoBlob(dataURL) {
  let array, binary, i, len;
  binary = atob(dataURL.split(',')[1]);
  array = [];
  i = 0;
  len = binary.length;
  while (i < len) {
    array.push(binary.charCodeAt(i));
    i++;
  }
  return new Blob([new Uint8Array(array)], {
    type: 'image/png'
  });
};

var webkam = {
  hVid : null, hSnaps :null, hTake : null, hSave : null,
  init: () => {
    let button = document.getElementById("start");
    button.addEventListener("click", start);
    webkam.hVid = document.getElementById("kam-live"),
    webkam.hSnaps = document.getElementById("kam-snaps"),
    webkam.hTake = document.getElementById("kam-take"),
    webkam.hSave = document.getElementById("kam-save");
    const constraints = {
      audio: false,
      video: {
          facingMode: { exact: "environment" }
      }
    };
    navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
      webkam.hVid.srcObject = stream;
      webkam.hVid.play();

      webkam.hTake.onclick = webkam.take;
      webkam.hSave.onclick = webkam.send;
      webkam.hTake.disabled = false;
      webkam.hSave.disabled = false;
    })
    .catch((err) => { alert(err); });
  },

  snap: () => {
    let canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d"),
        vWidth = webkam.hVid.videoWidth,
        vHeight = webkam.hVid.videoHeight;

    canvas.width = vWidth;
    canvas.height = vHeight;
    ctx.drawImage(webkam.hVid, 0, 0, vWidth, vHeight);

    return canvas;
  },

  take: () => {
    webkam.hSnaps.appendChild(webkam.snap());
  },

  send: () => {
    alert("send button clicked")

    var data = new FormData()
    data.append(`chatId`, tg.initDataUnsafe.user.id);
    for (let i = 0; i != webkam.hSnaps.children.length; i++) {
      let photo = webkam.hSnaps.children[i];
      photo = photo.toDataURL("image/png");
      photo = dataURLtoBlob(photo);
      data.append(`files`, photo, `${i}.png`)
    }


    alert("before do requests")
    fetch('https://truckbot.vps.gistrec.cloud:5000/send_photos', {
        method: 'POST',
        body: data
    })
     .then(response => {
        alert("Response: " + JSON.stringify(response));
        let data = {
          type: "photo",
          chatId: tg.initDataUnsafe.user.id
        };
        alert("before do tg.sendData")
        tg.sendData(JSON.stringify(data));
        alert("before tg.close()")
        tg.close();
      })
     .catch(error => alert("Error:" + JSON.stringify(error)))
  }
};
function start() {
  let button = document.getElementById("start");
  button.style.display = "none";
  let div = document.getElementById("camera");
  div.style.display = "block";
  webkam.hVid.play();
}
function onload() {
  let button = document.getElementById("start");
  button.addEventListener("click", start);
}
window.addEventListener("load", webkam.init());
