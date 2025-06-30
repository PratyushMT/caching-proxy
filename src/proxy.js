const express = require("express");
const axios = require("axios");
const { getCachedResponse, setCachedResponse } = require("./cache");

function startProxy(port, origin) {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(async (req, res) => {
        const cachedResponse = getCachedResponse(req);
        if(cachedResponse) {
            Object.entries(cachedResponse.headers).forEach(([key, value]) => {
            res.set(key, value);
        });
        res.set("X-Cache", "HIT");
        return res.status(cachedResponse.status).send(cachedResponse.data);
        }

        try {
            const url = `${origin}${req.originalUrl}`;
            
            const forwardHeaders = { ...req.headers };
            delete forwardHeaders.host;
            delete forwardHeaders.connection;
            delete forwardHeaders['content-length'];
            
            const response = await axios({
                method: req.method,
                url,
                headers: forwardHeaders,
                data: req.body,
                timeout: 15000,
                validateStatus: () => true
            });

            const cachedData = {
                data: response.data,
                status: response.status,
                headers: response.headers
            };
            setCachedResponse(req, cachedData);

            Object.entries(response.headers).forEach(([key, value]) => {
                res.set(key, value);
            })
            res.set("X-Cache", "MISS");
            res.status(response.status).send(response.data);
        } catch(e) {
            res.status(e.response?.status || 500).send(e.message);
        }
    });

    app.listen(port, () => {
        console.log(`Running on port ${port}`);
        console.log(`Forwarding requests to ${origin}`);
    })
}

module.exports = startProxy;