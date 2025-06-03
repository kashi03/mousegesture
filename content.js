(() => {
  const gestureCanvas = document.createElement("canvas");
  gestureCanvas.style.position = "fixed";
  gestureCanvas.style.top = "0";
  gestureCanvas.style.left = "0";
  gestureCanvas.style.width = "100vw";
  gestureCanvas.style.height = "100vh";
  gestureCanvas.style.pointerEvents = "none";
  gestureCanvas.style.zIndex = "9999";
  document.body.appendChild(gestureCanvas);

  gestureCanvas.width = window.innerWidth;
  gestureCanvas.height = window.innerHeight;

  const ctx = gestureCanvas.getContext("2d");
  ctx.strokeStyle = "red";
  ctx.lineWidth = 3;

  let lastX, lastY;
  let dragContent = null;
  let gesturePath = [];

  const gestureEvent = (event) => {
    if (event.clientX <= 0 || event.clientY <= 0) return;
    const dx = event.clientX - window.startX;
    const dy = event.clientY - window.startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) { // しきい値を追加して微細な動きを無視
      if (Math.abs(dx) > Math.abs(dy)) {
        const gesture = dx > 0 ? "R" : "L";
        if (gesture != gesturePath[gesturePath.length - 1])
          gesturePath.push(gesture);
        console.log(gesture)
      } else {
        const gesture = dy > 0 ? "D" : "U";
        if (gesture != gesturePath[gesturePath.length - 1])
          gesturePath.push(gesture);
      }
      window.startX = event.clientX;
      window.startY = event.clientY;

      // マウスの軌跡を描画
      ctx.lineTo(event.clientX, event.clientY);
      ctx.stroke();
    }
  }

  const gestureInit = (x, y) => {
    gesturePath = [];
    window.startX = x;
    window.startY = y;

    lastX = x;
    lastY = y;
    ctx.clearRect(0, 0, gestureCanvas.width, gestureCanvas.height);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
  }

  const gestureEnd = () => {
    ctx.clearRect(0, 0, gestureCanvas.width, gestureCanvas.height)
  }

  document.addEventListener("contextmenu", (event) => {
    console.log(gesturePath)
    if (gesturePath.length > 0) {
      event.preventDefault();
    }
  });

  document.addEventListener("mousedown", (event) => {
    if (event.button !== 2) return;
    gestureInit(event.clientX, event.clientY);

    document.addEventListener("mousemove", gestureEvent);
  });

  document.addEventListener("mouseup", () => {
    if (gesturePath.length > 0) {
      const gesture = gesturePath.join("");
      chrome.runtime.sendMessage({ mouseButton: 'L', gesture });
    }
    document.removeEventListener("mousemove", gestureEvent);
    gestureEnd();
  });

  document.addEventListener("dragstart", (event) => {
    const content = event.dataTransfer.getData("text/plain");
    if (content) {
      dragContent = content;
      gestureInit(event.clientX, event.clientY);
      document.addEventListener("drag", gestureEvent);
    } else if (event.dataTransfer.types.length > 0) {
      const type = event.dataTransfer.types[0];
      const anotherContent = event.dataTransfer.getData(type);
      dragContent = anotherContent;
      gestureInit(event.clientX, event.clientY);
      document.addEventListener("drag", gestureEvent);
    }
  });

  document.addEventListener("dragend", (event) => {
    if (gesturePath.length > 0) {
      const gesture = gesturePath.join("");
      chrome.runtime.sendMessage({ mouseButton: 'R', gesture, dragContent });
      dragContetnt = null;
    }
    document.removeEventListener("drag", gestureEvent);
    gestureEnd();
  });
})();