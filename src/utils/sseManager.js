const clients = new Map();

export const connectSse = (userId, req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.flushHeaders();

    clients.set(userId, res);

    res.write(
        `data: ${JSON.stringify({
            type: 'CONNECTED',
        })}\n\n`,
    );

    const interval = setInterval(() => {
        res.write(': keepalive\n\n');
    }, 30000);

    req.on('close', () => {
        clearInterval(interval);
        clients.delete(userId);
    });
};

export const sendSseNotification = (userId, notification) => {
    const client = clients.get(userId);

    if (!client) {
        return;
    }

    client.write(`data: ${JSON.stringify(notification)}\n\n`);
};