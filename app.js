// --- CONFIGURATION ---
const PUSHER_KEY = 'YOUR_APP_KEY';
const PUSHER_CLUSTER = 'YOUR_CLUSTER';

const MORSE_MAP = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--', 
    '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', 
    '9': '----.', '0': '-----', ' ': '/'
};

const UNIT = 120; // Timing speed (ms)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const pusher = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER });
let myChannel = null;

// --- INITIALIZE PAGER ---
function initConnection() {
    const myId = document.getElementById('myNumber').value.trim();
    if (!myId) return alert("Enter a number!");

    myChannel = pusher.subscribe(`channel-${myId}`);
    myChannel.bind('new-morse', (data) => {
        playMorse(data.text.toUpperCase());
    });

    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('pager-screen').style.display = 'block';
    document.getElementById('statusMsg').innerText = `Pager Active: #${myId}`;
}

// --- TRANSMISSION LOGIC ---
async function playMorse(text) {
    const display = document.getElementById('output-text');
    const screen = document.getElementById('flash-screen');
    display.innerText = ""; 

    for (let char of text) {
        const code = MORSE_MAP[char];
        if (code) {
            if (code === '/') {
                await sleep(UNIT * 5); 
            } else {
                for (let symbol of code) {
                    const duration = symbol === '.' ? UNIT : UNIT * 3;
                    beep(duration);
                    screen.classList.add('active');
                    await sleep(duration);
                    screen.classList.remove('active');
                    await sleep(UNIT); 
                }
            }
            display.innerText += char; // Only displays AFTER the morse for that letter
            await sleep(UNIT * 3); 
        }
    }
}

function beep(duration) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square'; // Crunchier "radio" sound
    osc.frequency.setValueAtTime(700, audioCtx.currentTime);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + (duration/1000));
    osc.stop(audioCtx.currentTime + (duration/1000));
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// --- SENDING ---
async function sendMessage() {
    const target = document.getElementById('targetNumber').value.trim();
    const text = document.getElementById('messageInput').value.trim();
    
    if (!target || !text) return;

    // NOTE: In a free setup, you'd use a Vercel/Netlify function here to 
    // trigger Pusher. For immediate local testing, use this:
    console.log(`Paging #${target}: ${text}`);
    
    // Replace this URL with your actual Vercel bridge URL
    await fetch('https://your-vercel-app.vercel.app/api/send', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ to: `channel-${target}`, message: text })
    });

    document.getElementById('messageInput').value = "";
}