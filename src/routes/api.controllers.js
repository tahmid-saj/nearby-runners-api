const subscribe = async (req, res) => {
  res.status(400).json({ error: "Use WebSocket to send messages." });
};

const sendLocationUpdate = async (req, res) => {
  res.status(400).json({ error: "Use WebSocket to send messages." });
};

const unsubscribe = async (req, res) => {
  res.status(400).json({ error: "Use WebSocket to send messages." });
};

module.exports = {
  subscribe,
  sendLocationUpdate,
  unsubscribe,
};
