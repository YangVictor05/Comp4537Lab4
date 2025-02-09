const http = require("http");
const url = require("url");
const messages = require("../lang/messages/en/user.js");

const PORT = process.env.PORT || 3000;
let dictionary = [];
let requestCount = 0;

const server = http.createServer((req, res) => {
    requestCount++;
    const parsedUrl = url.parse(req.url, true);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "application/json");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }

    if (req.method === "POST" && parsedUrl.pathname === "/api/definitions") {
        let body = "";
        req.on("data", chunk => (body += chunk));
        req.on("end", () => {
            const { word, definition } = JSON.parse(body || "{}");

            if (!word || !definition || /\d/.test(word)) {
                return res.end(JSON.stringify({ error: messages.InvalidInput }));
            }

            if (dictionary.some(entry => entry.word.toLowerCase() === word.toLowerCase())) {
                return res.end(
                    JSON.stringify({
                        message: messages.ExistingWord.replace("%1", word),
                        requestCount,
                        totalEntries: dictionary.length
                    })
                );
            }

            dictionary.push({ word, definition });
            res.end(
                JSON.stringify({
                    message: messages.AddedWord.replace("%1", word),
                    requestCount,
                    totalEntries: dictionary.length
                })
            );
        });
    } 

    else if (req.method === "GET" && parsedUrl.pathname === "/api/definitions") {
        const word = parsedUrl.query.word;
        console.log(word);
        console.log(dictionary);
        const entry = dictionary.find(e => e.word.toLowerCase() === word?.toLowerCase());
        res.end(
            JSON.stringify(
                entry
                    ? { word: entry.word, definition: entry.definition, requestCount }
                    : { message: messages.WordNotFound.replace("%1", word), requestCount }
            )
        );
    } 
    
    else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Not found" }));
    }
});

server.listen(PORT, () => console.log(Server running on port ${PORT}));
