if (typeof Notification !== "undefined" && Notification.permission !== "granted") {
  Notification.requestPermission();
}

let alarmInterval = null;

function playAlarm() {
  stopAlarm();
  alarmInterval = setInterval(() => {
    try {
      let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      let osc = audioCtx.createOscillator();
      let gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.value = 1200;

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      gain.gain.value = 0.7;

      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {}
  }, 1000);
}

function stopAlarm() {
  clearInterval(alarmInterval);
  alarmInterval = null;
}


let timers = {
  rai_liss: { duration: 15*60, time: 15*60, running: false },
  rai_ep:   { duration: 45*60, time: 45*60, running: false },
  dsai:     { duration: 45*60, time: 45*60, running: false },
  tpha:     { duration: 45*60, time: 45*60, running: false },
  du:       { duration: 15*60, time: 15*60, running: false },
  custom:   { duration: 0, time: 0, running: false }
};


setInterval(() => {
  Object.keys(timers).forEach(key => {
    if (timers[key].running && timers[key].time > 0) {
      timers[key].time--;
      updateUI(key);
    }

    if (timers[key].running && timers[key].time === 0) {
      timers[key].running = false;

      document.getElementById("status-" + key.replace("_","-"))
        .textContent = "✔ Session terminée !";

      playAlarm();

      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("Chrono Sessions", {
          body: key.toUpperCase() + " terminé"
        });
      }
    }
  });
}, 1000);


function updateUI(key) {
  let t = timers[key].time;
  let d = timers[key].duration;

  let percent = d ? (t / d) * 100 : 0;

  let min = Math.floor(t / 60);
  let sec = t % 60;

  let display = document.getElementById("disp_" + key);
  display.textContent =
    String(min).padStart(2,"0") + ":" + String(sec).padStart(2,"0");

  let bar = document.getElementById("prog_" + key);
  if (bar) bar.style.width = percent + "%";

  let pct = document.getElementById("percent_" + key);
  if (pct) pct.textContent = Math.round(percent) + "%";
}

function startTimer(key) {
  timers[key].running = true;
  document.getElementById("status-" + key.replace("_","-"))
    .textContent = "En cours...";
}

function pauseTimer(key) {
  timers[key].running = false;
  document.getElementById("status-" + key.replace("_","-"))
    .textContent = "⏸ Pause";
}

function resetTimer(key) {
  timers[key].running = false;
  timers[key].time = timers[key].duration;
  updateUI(key);
}


function startAll() {
  Object.keys(timers).forEach(k => {
    if (timers[k].duration > 0) startTimer(k);
  });
}

function resetAll() {
  stopAlarm();
  Object.keys(timers).forEach(k => resetTimer(k));
}

function setCustomTimer() {
  let mins = parseInt(document.getElementById("input_minutes").value);

  if (!mins || mins < 1) return;

  timers.custom.duration = mins * 60;
  timers.custom.time = mins * 60;

  document.getElementById("badge-custom").textContent = mins + " min";

  updateUI("custom");
}