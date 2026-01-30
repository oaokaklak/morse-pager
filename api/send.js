const Pusher = require("pusher");

const pusher = new Pusher({
  appId: "YOUR_APP_ID",
  key: "YOUR_KEY",
  secret: "YOUR_SECRET",
  cluster: "YOUR_CLUSTER",
  useTLS: true
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { to, message } = req.body;
    await pusher.trigger(to, "new-morse", { text: message });
    return res.status(200).json({ success: true });
  }
  res.status(405).send("Method Not Allowed");
}
